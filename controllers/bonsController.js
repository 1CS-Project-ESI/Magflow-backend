import { BonCommande , BonReception, ProduitsDelivres } from "../models/bonsModel.js";
import { Article , Produit } from "../models/productsModel.js";
import {Op} from 'sequelize'


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

            // Fetch the product from database
            const produit = await Produit.findByPk(productId);

            // Calculate total_ht
            total_ht += produit.price * orderedQuantity;

            // Calculate total_ttc (assuming tva is stored in Article)
            const article = await Article.findByPk(produit.article_id);
            const tva = article.tva;
            total_ttc += (produit.price * (1 + tva / 100)) * orderedQuantity;

            // Create entry in ProduitsDelivres table for each product
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
        const { number, commandeNumber, deliverydate, products, receivedQuantities } = req.body;
        
        const bonReception = await BonReception.create({
            id_magasinier,
            number,
            deliverydate,
        });

        // Searching for "bon de commande" based on its number (i need the id)
        const bonCommande = await BonCommande.findOne({ where: { number: commandeNumber } });
        if (!bonCommande) {
            throw new Error('BonCommande not found for the provided commandeNumber');
        }

        for (let i = 0; i < products.length; i++) {
            const productId = products[i];
            const receivedQuantity = receivedQuantities[i];
            console.log(bonReception.id ,bonCommande.id ,receivedQuantity,productId);
            await ProduitsDelivres.update(
                { receivedquantity: receivedQuantity, id_bonreception: bonReception.id },
                { where: { id_produit: productId, id_boncommande: bonCommande.id } }
            );
        }

        res.status(200).json({ message: 'BonReception created successfully', bonReception });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create BonReception', error: error.message });
    }
};

const getAllCommands = async(req,res) =>{
    try {
        const commands =await BonCommande.findAll();
        res.status(200).json({message : 'the list of commands : ' , commands })        
    } catch (error) {
        res.status(500).json({ message: 'Failed to get commands', error: error.message }); 
    }
}

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

        // Find the command by ID
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

        // Find product details using the extracted product IDs
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




export { createBonCommande , createBonRepection, getAllCommands,getAllProductsOfCommand , getProductsWithQuantityDelivered};

