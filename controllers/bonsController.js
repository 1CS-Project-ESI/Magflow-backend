import { BonCommande , BonReception, ProduitsCommandes  } from "../models/bonsModel.js";
import { Article , Produit,ProduitsArticle } from "../models/productsModel.js";

import { Op, Sequelize } from 'sequelize';


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
        const { id_magasinier } = req.params;
        const { number, commandId, deliverydate, products, receivedQuantities } = req.body;
        
        const bonReception = await BonReception.create({
            id_magasinier,
            number,
            deliverydate,
        });
        
        // Searching for "bon de commande" based on its number (i need the id)
        const BonCommande = await BonCommande.findOne({ where: { id: commandId } });
        if (!BonCommande) {
            throw new Error('BonCommande not found for the provided commandeNumber');
        }

        for (let i = 0; i < products.length; i++) {
            const productId = products[i];
            const receivedQuantity = receivedQuantities[i];
            console.log(`this is produnt number ${i}and its questiiti is ${receivedQuantity}`);
            console.log(bonReception.id ,BonCommande.id ,receivedQuantity,productId);
            await ProduitsDelivres.update(
                { receivedquantity: receivedQuantity, id_bonreception: bonReception.id },
                { where: { id_produit: productId, id_boncommande: BonCommande.id } }
            );
        }

        res.status(200).json({ message: 'BonReception created successfully', bonReception, commandId: BonCommande.id });
    } catch (error) {
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

        const remainingProducts = await ProduitsDelivres.findAll({
            where: {
                id_boncommande: CommandId,
                receivedquantity: {
                    [Sequelize.Op.lt]: Sequelize.col('orderedquantity')
                }
            },
            attributes: ['id_produit', 'orderedquantity', 'receivedquantity'],
            include: [{ model: Produit, as: 'produit' }] // Include Produit model with alias 'produit'
        });


        const remainingProductsInfo = remainingProducts.map(product => {
            const remainingQuantity = product.orderedquantity - product.receivedquantity;
            return {
                productId: product.id_produit,
                productName: product.produit.name, // Access name through alias 'produit'
                orderedQuantity: product.orderedquantity,
                receivedQuantity: product.receivedquantity,
                remainingQuantity: remainingQuantity
            };
        });

        res.status(200).json({ remainingProducts: remainingProductsInfo });
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




export { createBonCommande , createBonRepection, getAllCommands,getAllReception, getAllProductsOfCommand,getProductsWithQuantityDelivered, RemainingProducts,getAllProductsOfCommandWithNumber,getCommandDetails};

