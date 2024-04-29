import { BonCommande , BonReception, ProduitsCommandes, ProduitsDelivres , ProduitsCommandeInterne, BonCommandeInterne , BonSortie,ProduitsServie} from "../models/bonsModel.js";
import { Article , Produit, ProduitsArticle } from "../models/productsModel.js";

import { Op, Sequelize, where } from 'sequelize';


const createBonCommande = async (req, res) => {
    try {
        // Step 1: Get id_agentserviceachat and id_fournisseur from params
        const { id_agentserviceachat, id_fournisseur } = req.params;
        
        // Step 2: Get number, orderdate, status, and product details from body
        const { number, orderdate, status, productsOrdered ,orderspecifications} = req.body;

        // Step 3: Initialize total_ht, total_ttc, and total_tva to 0
        let total_ht = 0;
        let tva = 0;
        let total_ttc = 0;

        // Create a new instance of BonCommande
        const newBonCommande = await BonCommande.create({
            id_agentserviceachat,
            id_fournisseur,
            number,
            orderdate,
            orderspecifications,
            status,
            total_ttc,
            total_ht
        });

        // Step 4: Iterate through productsOrdered array and calculate total_ht
        for (const product of productsOrdered) {
            total_ht += product.ordered_quantity * product.price;
        }

        // Step 5 & 6: Calculate total_ttc and total_tva
        for (const product of productsOrdered) {
            const { productId } = product;
            const produit = await Produit.findByPk(productId);

            if (!produit) {
                return res.status(404).json({ message: `Product with ID ${productId} not found` });
            }

            const produitArticle = await ProduitsArticle.findOne({
                where: { id_produit: productId }
            });
            
            if (!produitArticle) {
                return res.status(404).json({ message: `Article not found for product ID ${productId}` });
            }

            // Find article by ID
            const article = await Article.findByPk(produitArticle.id_article);

            if (!article) {
                return res.status(404).json({ message: `Article not found for product ID ${productId}` });
            }

            const tva = article.tva;
            total_ttc += (product.price * (1 + tva / 100)) * product.ordered_quantity;

            // Step 7: Add a line for each product in the produitscommandes table
            await ProduitsCommandes.create({
                id_produit: product.productId,
                id_boncommande: newBonCommande.id,
                ordered_quantity: product.ordered_quantity,
                price: product.price
            });
        }

        // Step 8: Update total_ht, tva, and total_ttc in the BonCommande table
        await newBonCommande.update({
            total_ht,
            tva: total_ttc - total_ht,
            total_ttc
        });

        res.status(200).json({ message: 'BonCommande created successfully', BonCommande: newBonCommande });
    } catch (error) {
        console.error('Failed to create BonCommande:', error);
        res.status(500).json({ message: 'Failed to create BonCommande', error: error.message });
    }
};


const createBonRepection = async (req, res) => {
    try {
        const { id_boncommande } = req.params;
        const { number, id_magasinier, deliverydate, products, receivedQuantities } = req.body;

        const isValidProducts = await Promise.all(products.map(async (productId) => {

            const existingProduct = await ProduitsCommandes.findOne({
                where: {
                    id_produit: productId,
                    id_boncommande: id_boncommande
                }
            });
            return !!existingProduct;
        }));

        if (isValidProducts.includes(false)) {
            return res.status(400).json({ message: 'These products were not ordred ' });
        }

        const bonReception = await BonReception.create({
            id_boncommande,
            id_magasinier,
            number,
            deliverydate,
        });

        const bonReceptionId = bonReception.id;

        const produitsDelivresPromises = products.map(async (productId, index) => {
            const receivedQuantity = receivedQuantities[index];
            await ProduitsDelivres.create({
                id_produit: productId,
                id_bonreception: bonReceptionId,
                receivedquantity: receivedQuantity
            });
        });

        // wait for all ProduitsDelivres instances to be created (using promise)
        await Promise.all(produitsDelivresPromises);

        res.status(200).json({ message: 'BonReception created successfully', bonReception });
    } catch (error) {
        console.error('Error creating BonReception:', error);
        res.status(500).json({ message: 'Failed to create BonReception', error: error.message });
    }
};


const getAllCommands = async(req,res) =>{
    try {
        const commands =await BonCommande.findAll();
        res.status(200).json({message : 'The list of commands : ' , commands })        
    } catch (error) {
        res.status(500).json({ message: 'Failed to get commands', error: error.message }); 
    }
};

const getAllReception = async(req,res) =>{
    try {
        const receptions =await BonReception.findAll();
        res.status(200).json({message : 'The list of receptions: ' , receptions })        
    } catch (error) {
        res.status(500).json({ message: 'Failed to get the list of receptions', error: error.message }); 
    }
};


const getAllProductsOfCommand = async (req, res) => {
    try {
        const { command_id } = req.params;

        // Find the command by ID
        const command = await BonCommande.findByPk(command_id);

        if (!command) {
            return res.status(404).json({ message: 'Command not found' });
        }

        // Find all products delivered for this command
        const productsData = await ProduitsCommandes.findAll({
            where: {
                id_boncommande: command_id
            },
            attributes: ['id_produit', 'ordered_quantity'] // Only fetch necessary attributes
        });

        // Get details of each product using separate queries
        const products = [];
        for (const productData of productsData) {
            const { id_produit, ordered_quantity } = productData;
            const product = await Produit.findByPk(id_produit, {
                attributes: ['id', 'name', 'caracteristics'] // Fetch product details
            });
            if (product) {
                products.push({ ...product.toJSON(), ordered_quantity }); // Combine product details with ordered quantity
            }
        }

        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products of command', error: error.message });
    }
};



const RemainingProducts = async (req, res) => {
    try {
        const CommandId = req.params.CommandId;

        const receptions = await BonReception.findAll({
            where: {
                id_boncommande: CommandId,
            },
            attributes: ['id'],
            raw: true,
        });

        // reception of receptions (array of "bon de receptions")
        const receptionIds = receptions.map(reception => reception.id);

        const orderedProducts = await ProduitsCommandes.findAll({
            where: {
                id_boncommande: CommandId,
            },
            attributes: ['id_produit', 'ordered_quantity'],
            raw: true,
        });


        const receivedProducts = await ProduitsDelivres.findAll({
            where: {
                id_bonreception: receptionIds,
            },
            attributes: ['id_produit', 'receivedquantity'],
            raw: true,
        });

        // Map ordered quantities to object for easier access
        const orderedMap = orderedProducts.reduce((acc, product) => {
            acc[product.id_produit] = product.ordered_quantity;
            return acc;
        }, {});

        const remainingProducts = orderedProducts.map(product => {
            const receivedProduct = receivedProducts.find(item => item.id_produit === product.id_produit);
            // if the products doesnt exist in the produitsDelivres table then received quantity = 0 
            const receivedQuantity = receivedProduct ? receivedProduct.receivedquantity : 0;
            const remainingQuantity = product.ordered_quantity - receivedQuantity;
            return {
                productId: product.id_produit,
                orderedQuantity: product.ordered_quantity,
                receivedQuantity: receivedQuantity,
                remainingQuantity: remainingQuantity
            };
        });

        res.status(200).json({ remainingProducts: remainingProducts });
    } catch (error) {
        console.error('Error fetching remaining products:', error);
        res.status(500).json({ message: 'Failed to fetch remaining products', error: error.message });
    }
};

const getProductsWithQuantityDelivered = async (req, res) => {
    try {
        const { commandId } = req.params;
      
        const command = await BonCommande.findByPk(commandId);
        console.log(command)

        if (!command) {
            return res.status(404).json({ message: 'Command not found' });
        }

        // Find products with received quantity greater than 0 for this command
        const productsData = await ProduitsDelivres.findAll({
            where: {
                id_boncommande: commandId,
                receivedquantity: { [Op.gt]: 0 } // Filter products with received quantity > 0
            },
            attributes: ['id_produit', 'receivedquantity']
        });

        // Extract product IDs
        const productIds = productsData.map(productData => productData.id_produit);


        const productsDetails = await Produit.findAll({
            where: {
                id: productIds
            },
            attributes: ['id', 'name', 'caracteristics', 'price']
        });

        // Combine product details with received quantities
        const products = productsData.map(productData => {
            const productDetail = productsDetails.find(p => p.id === productData.id_produit);
            return {
                id: productDetail.id,
                name: productDetail.name,
                caracteristics: productDetail.caracteristics,
                price: productDetail.price,
                receivedquantity: productData.receivedquantity
            };
        });

        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products delivered for command', error: error.message });
    }
};


const getAllProductsOfCommandWithNumber = async (req, res) => {
    try {
        const { number } = req.params;

        // Find the command by its number to get the command ID
        const command = await BonCommande.findOne({
            where: { number: number }
        });

        if (!command) {
            return res.status(404).json({ message: 'Command not found' });
        }

        // Find all product IDs associated with the command
        const products = await ProduitsCommandes.findAll({
            where: { id_boncommande: command.id },
            attributes: ['id_produit'] // Only retrieve the product IDs
        });

        // Extract product IDs
        const productIds = products.map(product => product.id_produit);

        // Find all products associated with the product IDs
        const productsData = await Produit.findAll({
            where: { id: productIds }
        });

        res.status(200).json({ products: productsData });
    } catch (error) {
        console.error('Error fetching products of command:', error);
        res.status(500).json({ message: 'Failed to fetch products of command' });
    }
};

const getCommandDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the command by its number
        const command = await BonCommande.findOne({
            where: { id: id }
        });

        if (!command) {
            return res.status(404).json({ message: 'Command not found' });
        }

        // Find the associated products for the command
        // const products = await ProduitsDelivres.findAll({
        //     where: { id_boncommande: command.id }
        // });
        const productsData = await ProduitsCommandes.findAll({
            where: {
                id_boncommande: id
            },
            attributes: ['id_produit', 'ordered_quantity'] // Only fetch necessary attributes
        });

        // Get details of each product using separate queries
        const products = [];
        for (const productData of productsData) {
            const { id_produit, orderedquantity } = productData;
            const product = await Produit.findByPk(id_produit, {
                attributes: ['id', 'name', 'caracteristics'] // Fetch product details
            });
            if (product) {
                products.push({ ...product.toJSON(), orderedquantity }); // Combine product details with ordered quantity
            }
        }

        // Optionally, you can fetch additional related data here

        res.status(200).json({ command, products });
    } catch (error) {
        console.error('Error fetching command details:', error);
        res.status(500).json({ message: 'Failed to fetch command details' });
    }
};


const createBonCommandeInterne = async (req, res) => {
    try {
        const {id_consommateur} = req.params;
        const {  number, date, validation, produitsCommandes } = req.body;

        const bonCommandeInterne = await BonCommandeInterne.create({
            id_consommateur,
            number,
            date,
            validation
        });

        // Create entries in produitscommandeinterne table
        for (const produitCommande of produitsCommandes) {
            await ProduitsCommandeInterne.create({
                id_produit: produitCommande.id_produit,
                id_boncommandeinterne: bonCommandeInterne.id,
                orderedquantity: produitCommande.orderedquantity,
                accordedquantity: produitCommande.accordedquantity
            });
        }

        res.status(201).json({ message: 'Bon de commande interne created successfully', bonCommandeInterne });
    } catch (error) {
        console.error('Failed to create bon de commande interne:', error);
        res.status(500).json({ message: 'Failed to create bon de commande interne', error: error.message });
    }
};

const getcommandinternedetails = async (req, res) => {
    try {
        // Extract the ID of the internal command from request parameters
        const { id } = req.params;

        // Find the internal command by its ID
        const command = await BonCommandeInterne.findByPk(id);

        // If the internal command is not found, return a 404 error
        if (!command) {
            return res.status(404).json({ message: 'Internal command not found' });
        }

        // Find associated product orders for the internal command
        const productOrders = await ProduitsCommandeInterne.findAll({
            where: { id_boncommandeinterne: id }
        });

        // Iterate through each product order and fetch product details
        const productDetails = await Promise.all(productOrders.map(async (order) => {
            // Find product details by product ID
            const product = await Produit.findByPk(order.id_produit);
            if (product) {
                return {
                    name: product.name,
                    characteristics: product.caracteristicsgit ,
                    orderedQuantity: order.orderedquantity,
                    accordedQuantity: order.accordedquantity
                };
            }
            return null;
        }));

        // Return the internal command details along with associated product details
        res.status(200).json({ command, products: productDetails });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Failed to get internal command details:', error);
        res.status(500).json({ message: 'Failed to get internal command details', error: error.message });
    }
};

const getConsommateurCommands = async (req,res) => {
    try {
        const {id} = req.params
        const commands = await BonCommandeInterne.findAll({
            where : {id_consommateur : id}
        })

        res.status(200).json(commands)
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch commands of consumer', error: error.message });
    }
};

const getAllCommandsInterne = async (req,res)=> {
    try {
        const commands = await BonCommandeInterne.findAll();
        res.status(200).json(commands); 
    } catch (error) {
        res.status(500).json({message : 'Failed to fetch all commands' , error :error.message})
    }
};




export { createBonCommande , createBonRepection, getAllCommands,getAllReception, getAllProductsOfCommand,getProductsWithQuantityDelivered, RemainingProducts,getAllProductsOfCommandWithNumber,getCommandDetails, createBonCommandeInterne , getcommandinternedetails , getConsommateurCommands, getAllCommandsInterne};

