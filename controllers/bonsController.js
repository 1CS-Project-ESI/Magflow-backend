import { BonCommande , BonReception, ProduitsDelivres } from "../models/bonsModel.js";
import { Article , Produit } from "../models/productsModel.js";
import { Sequelize } from 'sequelize';


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

const RemainingProducts = async (req, res) => {
    try {
        const ReceptionId = req.params.ReceptionId;

        const remainingProducts = await ProduitsDelivres.findAll({
            where: {
                id_bonreception: ReceptionId,
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


export { createBonCommande, createBonRepection, RemainingProducts};