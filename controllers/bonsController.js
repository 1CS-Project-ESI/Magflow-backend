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



export { createBonCommande};