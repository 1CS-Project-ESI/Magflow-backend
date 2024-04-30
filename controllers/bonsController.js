import { BonCommande , BonReception, ProduitsCommandes, ProduitsDelivres , ProduitsCommandeInterne, BonCommandeInterne , BonSortie,ProduitsServie,BonDecharge, ProduitsDecharges} from "../models/bonsModel.js";
import { Article , Produit, ProduitsArticle } from "../models/productsModel.js";

import { Structure } from "../models/structuresModel.js";
import { Op, Sequelize, where } from 'sequelize';
import { StructureResponsable , Consumer } from "../models/usersModel.js";

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
const createBonSortie = async (req, res) => {
    try {
        const { id_boncommandeinterne } = req.params;
        const { id_magasinier, observation, service, date, produitsServie } = req.body;

        // Check if the boncommandeinterne exists
        const bonCommandeInterne = await BonCommandeInterne.findOne({
            where: { id: id_boncommandeinterne }
        });

        if (!bonCommandeInterne) {
            return res.status(400).json({ message: 'Invalid id_boncommandeinterne' });
        }

        // Check if each produitServie is contained in boncommandeinterne and served quantity <= accorded quantity
        for (const produitServie of produitsServie) {
            const produitCommande = await ProduitsCommandeInterne.findOne({
                where: {
                    id_produit: produitServie.id_produit,
                    id_boncommandeinterne
                }
            });

            if (!produitCommande) {
                return res.status(400).json({ message: 'Product not found in boncommandeinterne' });
            }

            if (produitCommande.accordedquantity < produitServie.servedquantity) {
                return res.status(400).json({ message: 'Served quantity exceeds accorded quantity' });
            }
        }

        // Calculate the sum of served quantity for each product in all bonsortie associated with the boncommandeinterne
        const totalServedQuantity = {};
        const bonsSorties = await BonSortie.findAll({
            where: { id_boncommandeinterne }
        });

        for (const bonsortie of bonsSorties) {
            const produitsServies = await ProduitsServie.findAll({
                where: { id_bonsortie: bonsortie.id }
            });

            for (const produitServie of produitsServies) {
                totalServedQuantity[produitServie.id_produit] = (totalServedQuantity[produitServie.id_produit] || 0) + produitServie.servedquantity;
            }
        }

        // Check if the sum of served quantity for each product <= accorded quantity
        for (const produitId in totalServedQuantity) {
            const accordedQuantity = await ProduitsCommandeInterne.sum('accordedquantity', {
                where: {
                    id_produit: produitId,
                    id_boncommandeinterne
                }
            });

            if (totalServedQuantity[produitId] > accordedQuantity) {
                return res.status(400).json({ message: 'Total served quantity exceeds accorded quantity for product' });
            }
        }

        // All verifications passed, create bonsortie and produitsServie entries
        const bonSortie = await BonSortie.create({
            id_boncommandeinterne,
            id_magasinier,
            observation,
            service,
            date
        });

        for (const produitServie of produitsServie) {
            await ProduitsServie.create({
                id_bonsortie: bonSortie.id,
                id_produit: produitServie.id_produit,
                servedquantity: produitServie.servedquantity
            });
        }

        res.status(201).json({ message: 'Bon de sortie created successfully', bonSortie });
    } catch (error) {
        console.error('Failed to create bon de sortie:', error);
        res.status(500).json({ message: 'Failed to create bon de sortie', error: error.message });
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


const getAllBonSorties = async(req,res)=>{
    try {
        const sorties = await BonSortie.findAll();
        res.status(200).json(sorties);
    } catch (error) {
        res.status(500).json({message : 'Failed to fetch all bons sorites' , error :error.message})   
    }
};

const getBonCommandInterneForStructureResponsable = async (req,res) => {
    try {
        const {id_structureresponsable} = req.params
        // Find the structureresponsable associated with the given structureId
        const responsable = await StructureResponsable.findByPk(id_structureresponsable)
        

        if (!responsable) {
            throw new Error('Structure responsable not found');
        }

        // Retrieve all consumers within the structure
        const consumers = await Consumer.findAll({
            where: { id_structure: responsable.id_structure }
        });

        // Get all boncommandinterne made by those consumers
        const bonCommandInterne = await BonCommandeInterne.findAll({
            where: { id_consommateur: consumers.map(consumer => consumer.user_id) }
        });

        return res.status(200).json(bonCommandInterne);
    } catch (error) {
        console.error('Failed to get boncommandinterne for structure responsable:', error);
        throw error;
    }
};

const createBonDecharge = async (req, res) => {
    let transaction;
    try {
        // Validate input data
        const { date, description, produitsdecharges, id_consommateur } = req.body;
        const { id_magasinier } = req.params;

        // Start a transaction
       // transaction = await Sequelize.transaction();

        // Create borrowing receipt entry
        const bonDecharge = await BonDecharge.create({
            id_magasinier: id_magasinier,
            id_consommateur: id_consommateur,
            date: date,
            description: description
        }, ); // ,{ transaction })

        // Handle many-to-many relationship with ProduitsDecharges table
        for (const produit of produitsdecharges) {
            // Get the product details
            const product = await Produit.findByPk(produit.id, { transaction });

            if (!product) {
                // If the product does not exist, rollback the transaction
                // await transaction.rollback();
                console.error(`Product with ID ${produit.id} not found.`);
                return res.status(404).json({ success: false, message: `Product with ID ${produit.id} not found.` });
            }

            // Calculate the available quantity (quantity - seuil)
            const availableQuantity = Math.max(0, product.quantity - product.seuil); // product.quantity is the  product quantity avaible in the stock 

            // Calculate the accorded quantity based on user-requested quantity and available quantity
            const accordedQuantity = Math.min(produit.quantity, availableQuantity); // produit.quantity is the quatntity the user wants to borrow 

            // Create ProduitsDecharges entry with the accorded quantity
            await ProduitsDecharges.create({
                id_bondecharge: bonDecharge.id,
                id_produit: produit.id,
                dechargedquantity: accordedQuantity
            }, ); // { transaction }

            // Subtract the accorded quantity from the product's quantity
            await Produit.update({
                quantity: product.quantity - accordedQuantity
            }, {
                where: { id: produit.id },
                // transaction
            });

            if (product.quantity <= product.seuil) {
                // Send alert/notification
                // Example: You can use a notification service like email, SMS, or push notification
                console.log(`Alert: Quantity of product '${product.name}' (${product.quantity}) is below the threshold (${product.seuil}).`);
            }
        }

        // Commit the transaction
        // await transaction.commit();

        res.status(201).json({ success: true, bonDecharge });
    } catch (error) {
        console.error('Error creating borrowing receipt:', error);
        // Rollback the transaction if an error occurs
        // if (transaction) await transaction.rollback();
        res.status(500).json({ success: false, message: "Error creating borrowing receipt", error: error.message });
    }
};
 
const receiveBorrowedProducts = async (req, res) => {
    try {
        
        const { receiveddecharges } = req.body;
        const { id_bondecharge } = req.params;

        const bonDecharge = await BonDecharge.findByPk(id_bondecharge);

        if (!bonDecharge) {
            return res.status(404).json({ success: false, message: 'Borrowing receipt not found' });
        }

        
        for (const produitDecharge of receiveddecharges) {
            // update product table 
            const produit = await Produit.findByPk(produitDecharge.id);

            if (!produit) {
                console.error(`Product with ID ${produitDecharge.id} not found`);
                continue;
            }

            produit.quantity += produitDecharge.dechargedquantity;
            await produit.save();


            // update product decharge 
            const produitDechargeRecord = await ProduitsDecharges.findOne({
                where: { id_bondecharge, id_produit: produitDecharge.id }
            });

            if (produitDechargeRecord) {
                produitDechargeRecord.dechargedquantity -= produitDecharge.dechargedquantity;
                produitDechargeRecord.dechargedquantity = Math.max(produitDechargeRecord.dechargedquantity,0) // to ensure that the value is minim zero and the record will be destroyed 
                await produitDechargeRecord.save();
            }
            if (produitDechargeRecord.dechargedquantity ==  0 ){
                produitDechargeRecord.destroy();

            }

           
        }
        const remainingProduitDecharges = await ProduitsDecharges.count({ where: { id_bondecharge } });
        if (remainingProduitDecharges === 0) {
            bonDecharge.status = 'Received';
            await bonDecharge.save();
        }

        // Update the borrowing receipt status to indicate that the products were received
        

        return res.status(200).json({ success: true, message: 'Borrowed products received successfully' });
    } catch (error) {
        console.error('Error receiving borrowed products:', error);
        res.status(500).json({ success: false, message: 'Error receiving borrowed products', error: error.message });
    }
};
 
const getAllBonDecharges = async (req, res) => {
    try {
       
        const bonDecharges = await BonDecharge.findAll();

        res.status(200).json({ success: true, bonDecharges });
    } catch (error) {
        console.error('Error fetching borrowing receipts:', error);
        res.status(500).json({ success: false, message: 'Error fetching borrowing receipts', error: error.message });
    }
};

const getBonDechargeDetailsById = async (req, res) => {
    try {
        const { id_bondecharge } = req.params;


        // Fetch the borrowing receipt by ID
        const bonDecharge = await BonDecharge.findByPk(id_bondecharge);
        console.log(bonDecharge);
        if (!bonDecharge) {
            return res.status(404).json({ success: false, message: 'Borrowing receipt not found' });
        }

        // Fetch all received products associated with this borrowing receipt
        const produitsDecharges = await ProduitsDecharges.findAll({
            where: { id_bondecharge: id_bondecharge },
        });
        console.log(produitsDecharges);

        // Return the borrowing receipt details along with received product details
        res.status(200).json({ success: true, bonDecharge, produitsDecharges });
    } catch (error) {
        console.error('Error fetching borrowing receipt details:', error);
        res.status(500).json({ success: false, message: 'Error fetching borrowing receipt details', error: error.message });
    }
};

const deleteBonDechargeById = async (req, res) => {
    try {
        const { id_bondecharge  } = req.params;

        // Find the record by ID
        const bonDecharge = await BonDecharge.findByPk(id_bondecharge);

        // If the record doesn't exist, return an error
        if (!bonDecharge) {
            return res.status(404).json({ success: false, message: 'Borrowing receipt not found' });
        }
        const count = await ProduitsDecharges.count({ where: { id_bondecharge: id_bondecharge } });
        console.log("this is the count ",count);
        // If there are associated ProduitsDecharges, return an error
        if (count > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete. Borrowing receipt has associated product records' });
        }
        // Delete the record
        await bonDecharge.destroy();

        // Return success response
        res.status(200).json({ success: true, message: 'Borrowing receipt deleted successfully' });
    } catch (error) {
        console.error('Error deleting borrowing receipt:', error);
        res.status(500).json({ success: false, message: 'Error deleting borrowing receipt', error: error.message });
    }
}; 

export { createBonCommande , createBonRepection, getAllCommands,getAllReception, getAllProductsOfCommand,getProductsWithQuantityDelivered, RemainingProducts,getAllProductsOfCommandWithNumber,getCommandDetails, createBonCommandeInterne , getcommandinternedetails , getConsommateurCommands, getAllCommandsInterne , createBonSortie, getAllBonSorties,getBonCommandInterneForStructureResponsable, createBonDecharge,deleteBonDechargeById, getBonDechargeDetailsById, getAllBonDecharges,receiveBorrowedProducts};


