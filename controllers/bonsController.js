import { BonCommande , BonReception, ProduitsCommandes, ProduitsDelivres } from "../models/bonsModel.js";
import { Article , Produit } from "../models/productsModel.js";

import { Op, Sequelize } from 'sequelize';


const createBonCommande = async (req, res) => {
    try {
        const { id_agentServiceAchat } = req.params;
        const { number, orderdate, deliverydate, orderspecifications, status, productDetails } = req.body;

        let total_ht = 0;
        let total_ttc = 0;
        let totalPriceOfWholeOrder = 0;

        let productsWithOrderedQuantity = [];


        const boncommande = await BonCommande.create({
            id_agentserviceachat: id_agentServiceAchat,
            number,
            orderdate,
            deliverydate,
            orderspecifications,
            status
        });


        for (const productDetail of productDetails) {
            const { productId, orderedQuantity } = productDetail;

            const produit = await Produit.findByPk(productId);

            if (!produit) {
                return res.status(404).json({ message: `Product with ID ${productId} not found` });
            }

            total_ht += produit.price * orderedQuantity;

            const article = await Article.findByPk(produit.article_id);
            const tva = article.tva;
            total_ttc += (produit.price * (1 + tva / 100)) * orderedQuantity;

            const totalPriceOfProduct = produit.price * orderedQuantity;
            totalPriceOfWholeOrder += totalPriceOfProduct;

            productsWithOrderedQuantity.push({
                productId: produit.id,
                productName: produit.name,
                price: produit.price,
                orderedQuantity: orderedQuantity,
                totalPriceOfProduct: totalPriceOfProduct
            });

            await ProduitsDelivres.create({
                id_produit: productId,
                id_boncommande: boncommande.id,
                orderedquantity: orderedQuantity
            });
        }

        await boncommande.update({
            total_ht,
            tva: total_ttc - total_ht,
            total_ttc: totalPriceOfWholeOrder
        });

        res.status(200).json({message: 'BonCommande created successfully',boncommande,productsWithOrderedQuantity
        });
    } catch (error) {
        // Handle any errors that occur during the process
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
        const productsData = await ProduitsDelivres.findAll({
            where: {
                id_boncommande: command.id
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

        // Optionally, you can fetch additional related data here

        res.status(200).json({ command, products });
    } catch (error) {
        console.error('Error fetching command details:', error);
        res.status(500).json({ message: 'Failed to fetch command details' });
    }
};




export { createBonCommande , createBonRepection, getAllCommands,getAllReception, getAllProductsOfCommand,getProductsWithQuantityDelivered, RemainingProducts,getAllProductsOfCommandWithNumber,getCommandDetails};

