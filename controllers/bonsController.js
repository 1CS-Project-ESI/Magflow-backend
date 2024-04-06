import { BonCommande , BonReception, ProduitsDelivres } from "../models/bonsModel.js";
import { Article , Produit } from "../models/productsModel.js";

import { Op, Sequelize } from 'sequelize';


const createBonCommande = async (req, res) => {
    try {
        const {id_agentServiceAchat}  = req.params;
        const {  number, orderdate, deliverydate, orderspecifications, status } = req.body;
        
        const boncommande = await BonCommande.create({
            id_agentserviceachat:id_agentServiceAchat,
            number,
            orderdate,
            deliverydate,
            orderspecifications,
            status
        });

        // Receive product IDs and quantities from frontend
        let total_ht = 0;
        let total_ttc = 0;

        const {productDetails } = req.body
        // Iterate over product details
        for (const productDetail of productDetails) {
            const { productId, orderedQuantity } = productDetail;

            const produit = await Produit.findByPk(productId);

            total_ht += produit.price * orderedQuantity;

            // Calculate total_ttc (assuming tva is stored in Article)
            const article = await Article.findByPk(produit.article_id);
            const tva = article.tva;
            total_ttc += (produit.price * (1 + tva / 100)) * orderedQuantity;

            await ProduitsDelivres.create({
                id_produit: productId,
                id_boncommande: boncommande.id,
                orderedquantity : orderedQuantity
            })

            await boncommande.update({
                total_ht,
                tva: total_ttc - total_ht,
                total_ttc
            });        
        }

        res.status(200).json({ message: 'BonCommande created successfully', boncommande });
    } catch (error) {
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
        const bonCommande = await BonCommande.findOne({ where: { id: commandId } });
        if (!bonCommande) {
            throw new Error('BonCommande not found for the provided commandeNumber');
        }

        for (let i = 0; i < products.length; i++) {
            const productId = products[i];
            const receivedQuantity = receivedQuantities[i];
            console.log(`this is produnt number ${i}and its questiiti is ${receivedQuantity}`);
            console.log(bonReception.id ,bonCommande.id ,receivedQuantity,productId);
            await ProduitsDelivres.update(
                { receivedquantity: receivedQuantity, id_bonreception: bonReception.id },
                { where: { id_produit: productId, id_boncommande: bonCommande.id } }
            );
        }

        res.status(200).json({ message: 'BonReception created successfully', bonReception, commandId: bonCommande.id });
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
        const productsData = await ProduitsDelivres.findAll({
            where: {
                id_boncommande: command_id
            },
            attributes: ['id_produit', 'orderedquantity'] // Only fetch necessary attributes
        });

        // Get details of each product using separate queries
        const products = [];
        for (const productData of productsData) {
            const { id_produit, orderedquantity } = productData;
            const product = await Produit.findByPk(id_produit, {
                attributes: ['id', 'name', 'caracteristics', 'price'] // Fetch product details
            });
            if (product) {
                products.push({ ...product.toJSON(), orderedquantity }); // Combine product details with ordered quantity
            }
        }

        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch products of command', error: error.message });
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
        const products = await ProduitsDelivres.findAll({
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




export { createBonCommande , createBonRepection, getAllCommands,getAllReception, getAllProductsOfCommand,getProductsWithQuantityDelivered, RemainingProducts,getAllProductsOfCommandWithNumber};

