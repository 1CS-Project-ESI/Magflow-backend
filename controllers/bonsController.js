import { BonCommande , BonReception, ProduitsDelivres } from "../models/bonsModel.js";
import { Article , Produit } from "../models/productsModel.js";


const createBonCommande = async (req, res) => {
    try {
        const {id_agentServiceAchat}  = req.params;
        const {  number, orderdate, deliverydate, orderspecifications, status } = req.body;
        
        // Create BonCommande
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
}


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


export { createBonCommande , getAllCommands,getAllProductsOfCommand};