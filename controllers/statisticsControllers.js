import { EtatStock } from "../models/inventaireModel.js";
import { BonSortie , ProduitsDecharges,ProduitsServie ,BonCommandeInterne,ProduitsCommandeInterne , BonDecharge , ProduitsCommandes } from "../models/bonsModel.js";
import {Structure} from "../models/structuresModel.js";
import { User } from "../models/usersModel.js";
import { Produit } from "../models/productsModel.js";
import { Consumer } from "../models/usersModel.js";
import {sequelize} from '../models/usersModel.js'; 
import { Op , literal } from "sequelize";


const calculateQuantitiesByProduct = async (req, res) => {
  try {
    // Fetch the served quantities grouped by product ID
    const servedQuantities = await ProduitsServie.findAll({
      attributes: [
        'id_produit',
        [sequelize.fn('SUM', sequelize.col('servedquantity')), 'total_served'],
      ],
      group: ['id_produit'],
    });

    // Fetch the decharged quantities grouped by product ID
    const dechargedQuantities = await ProduitsDecharges.findAll({
      attributes: [
        'id_produit',
        [sequelize.fn('SUM', sequelize.col('dechargedquantity')), 'total_decharged'],
      ],
      group: ['id_produit'],
    });

    // Merge the results by product ID
    const quantitiesByProduct = {};

    servedQuantities.forEach((item) => {
      quantitiesByProduct[item.id_produit] = {
        total_served: parseInt(item.getDataValue('total_served'), 10),
        total_decharged: 0,
      };
    });

    dechargedQuantities.forEach((item) => {
      if (!quantitiesByProduct[item.id_produit]) {
        quantitiesByProduct[item.id_produit] = {
          total_served: 0,
          total_decharged: parseInt(item.getDataValue('total_decharged'), 10),
        };
      } else {
        quantitiesByProduct[item.id_produit].total_decharged = parseInt(item.getDataValue('total_decharged'), 10);
      }
    });

    // Fetch product details for each product ID
    const productIds = Object.keys(quantitiesByProduct);
    const products = await Produit.findAll({
      where: {
        id: productIds,
      },
      attributes: ['id', 'name', 'caracteristics', 'quantity', 'seuil'],
    });

    // Map the quantities to the product details
    const response = products.map((product) => ({
      product: product.toJSON(),
      total_served: quantitiesByProduct[product.id].total_served,
      total_decharged: quantitiesByProduct[product.id].total_decharged,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error('Error calculating quantities by product:', error);
    res.status(500).json({ error: 'Failed to calculate quantities by product' });
  }
};


const getMostConsumableProductsByStructure = async (req, res) => {
    const { structureId } = req.params;
  
    if (!structureId || isNaN(structureId)) {
      return res.status(400).json({
        message: 'Invalid or missing structureId parameter',
      });
    }
  
    try {
      // Find all consumers with the given structureId
      const consumers = await Consumer.findAll({
        attributes: ['user_id'],
        where: {
          id_structure: structureId
        }
      });
  
      if (consumers.length === 0) {
        return res.status(404).json({
          message: 'No consumers found for the given structureId',
        });
      }
  
      const consumerIds = consumers.map(consumer => consumer.user_id);
  
      // Find all BonCommandeInterne records for those consumers
      const bonCommandesInternes = await BonCommandeInterne.findAll({
        attributes: ['id'],
        where: {
          id_consommateur: {
            [Op.in]: consumerIds
          }
        }
      });
  
      const bonCommandeIds = bonCommandesInternes.map(bon => bon.id);
  
      if (bonCommandeIds.length === 0) {
        return res.status(404).json({
          message: 'No BonCommandeInterne records found for the given consumers',
        });
      }
  
      // Find all BonSortie and BonDecharge records linked to the BonCommandeInterne records
      const bonSorties = await BonSortie.findAll({
        attributes: ['id'],
        where: {
          id_boncommandeinterne: {
            [Op.in]: bonCommandeIds
          }
        }
      });
  
      const bonDecharges = await BonDecharge.findAll({
        attributes: ['id'],
        where: {
          id_boncommandeinterne: {
            [Op.in]: bonCommandeIds
          }
        }
      });
  
      const bonSortieIds = bonSorties.map(bon => bon.id);
      const bonDechargeIds = bonDecharges.map(bon => bon.id);
  
      // Find the most consumable products by those bonSortieIds and bonDechargeIds
      const servedQuantities = await ProduitsServie.findAll({
        attributes: [
          'id_produit',
          [sequelize.fn('SUM', sequelize.col('servedquantity')), 'total_served_quantity']
        ],
        where: {
          id_bonsortie: {
            [Op.in]: bonSortieIds
          }
        },
        group: ['id_produit']
      });
  
      const dechargedQuantities = await ProduitsDecharges.findAll({
        attributes: [
          'id_produit',
          [sequelize.fn('SUM', sequelize.col('dechargedquantity')), 'total_decharged_quantity']
        ],
        where: {
          id_bondecharge: {
            [Op.in]: bonDechargeIds
          }
        },
        group: ['id_produit']
      });
  
      // Merge the results based on product ID
      const productMap = new Map();
  
      servedQuantities.forEach(item => {
        const productId = item.id_produit;
        const servedQuantity = item.get('total_served_quantity');
        productMap.set(productId, {
          id_produit: productId,
          total_served_quantity: servedQuantity,
          total_decharged_quantity: 0
        });
      });
  
      dechargedQuantities.forEach(item => {
        const productId = item.id_produit;
        const dechargedQuantity = item.get('total_decharged_quantity');
        if (productMap.has(productId)) {
          productMap.get(productId).total_decharged_quantity = dechargedQuantity;
        } else {
          productMap.set(productId, {
            id_produit: productId,
            total_served_quantity: 0,
            total_decharged_quantity: dechargedQuantity
          });
        }
      });
  
      const mergedResults = Array.from(productMap.values());
  
      // Sort and limit results
      mergedResults.sort((a, b) => b.total_served_quantity - a.total_served_quantity);
      const topResults = mergedResults.slice(0, 10);
  
      // Fetch product names from Produit table using the retrieved product IDs
      const productIds = topResults.map(result => result.id_produit);
      const products = await Produit.findAll({
        attributes: ['id', 'name'],
        where: {
          id: {
            [Op.in]: productIds
          }
        }
      });
  
      // Merge product names with the results
      const finalResults = topResults.map(result => {
        const productName = products.find(product => product.id === result.id_produit)?.name;
        return {
          ...result,
          productName: productName || 'Unknown' // Set default name if product not found
        };
      });
  
      res.status(200).json({
        message: 'Most consumable products retrieved successfully',
        data: finalResults
      });
    } catch (error) {
      console.error('Error retrieving most consumable products by structure:', error);
      res.status(500).json({
        message: 'Error retrieving most consumable products by structure',
        error: error.message
      });
    }
  };
  

  const calculateStockValue = async (req, res) => {
    try {
      // Step 1: Fetch products with positive quantity
      const productsWithPositiveStock = await Produit.findAll({
        attributes: ['id', 'quantity'],
        where: {
          quantity: {
            [Op.gt]: 0
          }
        }
      });
  
      if (productsWithPositiveStock.length === 0) {
        return res.status(404).json({
          message: 'No products with positive stock found'
        });
      }
  
      // Step 2: Fetch the latest prices for these products from the ProduitsCommandes table
      const productIds = productsWithPositiveStock.map(product => product.id);
      const latestPrices = await ProduitsCommandes.findAll({
        attributes: ['id_produit', [sequelize.fn('MAX', sequelize.col('price')), 'latest_price']],
        where: {
          id_produit: {
            [Op.in]: productIds
          }
        },
        group: ['id_produit']
      });
  
      // Step 3: Calculate the total value of the stock
      let totalStockValue = 0;
      productsWithPositiveStock.forEach(product => {
        const latestPriceEntry = latestPrices.find(p => p.id_produit === product.id);
        if (latestPriceEntry) {
          totalStockValue += product.quantity * latestPriceEntry.get('latest_price');
        }
      });
  
      res.status(200).json({
        message: 'Stock value calculated successfully',
        totalStockValue
      });
    } catch (error) {
      console.error('Error calculating stock value:', error);
      res.status(500).json({
        message: 'Error calculating stock value',
        error: error.message
      });
    }
  };

  const fetchProductsWithPositiveStock = async (req, res) => {
    try {
      // Fetch products with positive quantity
      const productsWithPositiveStock = await Produit.findAll({
        attributes: ['id', 'name', 'quantity'],
        where: {
          quantity: {
            [Op.gt]: 0
          }
        }
      });
  
      if (productsWithPositiveStock.length === 0) {
        return res.status(404).json({
          message: 'No products with positive stock found'
        });
      }
  
      // Enumerate the products starting from 1
      const enumeratedProducts = productsWithPositiveStock.map((product, index) => ({
        index: index + 1,
        id: product.id,
        name: product.name,
        quantity: product.quantity
      }));
  
      res.status(200).json({
        message: 'Products with positive stock fetched successfully',
        products: enumeratedProducts
      });
    } catch (error) {
      console.error('Error fetching products with positive stock:', error);
      res.status(500).json({
        message: 'Error fetching products with positive stock',
        error: error.message
      });
    }
  };


  const getMostConsumableProductsByUser = async (req, res) => {
    try {
      const { user_id } = req.params;
  
      if (!user_id) {
        return res.status(400).json({
          message: 'user_id parameter is required'
        });
      }
  
      // Find the user
      const user = await Consumer.findOne({
        where: {
          user_id
        }
      });
  
      if (!user) {
        return res.status(404).json({
          message: 'User not found'
        });
      }
  
      // Find the internal purchase orders of the user
      const userBonCommandes = await BonCommandeInterne.findAll({
        where: {
          id_consommateur: user_id
        }
      });
  
      if (userBonCommandes.length === 0) {
        return res.status(404).json({
          message: 'No internal purchase orders found for the user'
        });
      }
  
      const bonCommandeIds = userBonCommandes.map(bon => bon.id);
  
      // Find the served quantities for each product
      const servedProducts = await ProduitsServie.findAll({
        attributes: [
          'id_produit',
          [sequelize.fn('SUM', sequelize.col('servedquantity')), 'total_served_quantity']
        ],
        where: {
          id_bonsortie: {
            [Op.in]: bonCommandeIds
          }
        },
        group: ['id_produit']
      });
  
      // Find the decharged quantities for each product
      const dechargedProducts = await ProduitsDecharges.findAll({
        attributes: [
          'id_produit',
          [sequelize.fn('SUM', sequelize.col('dechargedquantity')), 'total_decharged_quantity']
        ],
        where: {
          id_bondecharge: {
            [Op.in]: bonCommandeIds
          }
        },
        group: ['id_produit']
      });
  
      // Merge served and decharged quantities for each product
      const mergedProducts = new Map();
      servedProducts.forEach(product => {
        const productId = product.id_produit;
        const totalServedQuantity = product.get('total_served_quantity');
        mergedProducts.set(productId, totalServedQuantity);
      });
  
      dechargedProducts.forEach(product => {
        const productId = product.id_produit;
        const totalDechargedQuantity = product.get('total_decharged_quantity');
        if (mergedProducts.has(productId)) {
          mergedProducts.set(productId, mergedProducts.get(productId) + totalDechargedQuantity);
        } else {
          mergedProducts.set(productId, totalDechargedQuantity);
        }
      });
  
      // Filter out products with total consumed quantity of 0
      const filteredProducts = [...mergedProducts.entries()].filter(([_, totalQuantity]) => totalQuantity > 0);
  
      // Sort products based on their total consumed quantities
      const sortedProducts = filteredProducts.sort((a, b) => b[1] - a[1]);
  
      // Return the sorted products with their details
      const topNProducts = await Promise.all(sortedProducts.map(async ([productId, totalQuantity], index) => {
        const product = await Produit.findByPk(productId);
        return {
          id: index + 1, // Enumeration starting from 1
          name: product.name,
          total_quantity_consumed: totalQuantity
        };
      }));
  
      res.status(200).json({
        message: 'Most consumable products by user retrieved successfully',
        topNProducts
      });
    } catch (error) {
      console.error('Error retrieving most consumable products by user:', error);
      res.status(500).json({
        message: 'Error retrieving most consumable products by user',
        error: error.message
      });
    }
  };

  const getTopConsumersByStructure = async (req, res) => {
    const { structureId } = req.params;
  
    if (!structureId) {
      return res.status(400).json({
        message: 'structureId parameter is required',
      });
    }
  
    try {
      // Step 1: Fetch consumers by structureId
      const consumers = await Consumer.findAll({
        attributes: ['user_id'],
        where: {
          id_structure: structureId,
        },
      });
  
      const consumerIds = consumers.map((consumer) => consumer.user_id);
  
      if (consumerIds.length === 0) {
        return res.status(404).json({
          message: 'No consumers found for the specified structure',
        });
      }
  
      // Step 2: Find BonCommandeInterne records for these consumers
      const internalOrders = await BonCommandeInterne.findAll({
        attributes: [
          'id_consommateur',
          [sequelize.fn('COUNT', sequelize.col('id')), 'order_count'],
        ],
        where: {
          id_consommateur: {
            [Op.in]: consumerIds,
          },
        },
        group: ['id_consommateur'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
      });
  
      if (internalOrders.length === 0) {
        return res.status(404).json({
          message: 'No internal orders found for the consumers in the specified structure',
        });
      }
  
      // Step 3: Fetch user details from the users table
      const userIds = internalOrders.map((order) => order.id_consommateur);
      const users = await User.findAll({
        attributes: ['id', 'firstname', 'lastname'],
        where: {
          id: {
            [Op.in]: userIds,
          },
        },
      });
  
      // Step 4: Attach user details to the result
      const result = internalOrders.map((order) => {
        const user = users.find((user) => user.id === order.id_consommateur);
        return {
          user_id: user.id,
          name: `${user.firstname} ${user.lastname}`,
          order_count: order.dataValues.order_count,
        };
      });
  
      res.status(200).json({
        message: 'Top consumers by internal orders and structure retrieved successfully',
        data: result,
      });
    } catch (error) {
      console.error('Error retrieving top consumers by internal orders and structure:', error);
      res.status(500).json({
        message: 'Error retrieving top consumers by internal orders and structure',
        error: error.message,
      });
    }
  };    

  const getTotalOrdersByStructure = async (req, res) => {
    const { structureId } = req.params;
  
    if (!structureId) {
      return res.status(400).json({
        message: 'structureId parameter is required',
      });
    }
  
    try {
      // Step 1: Fetch consumers by structureId
      const consumers = await Consumer.findAll({
        attributes: ['user_id'],
        where: {
          id_structure: structureId,
        },
      });
  
      const consumerIds = consumers.map((consumer) => consumer.user_id);
  
      if (consumerIds.length === 0) {
        return res.status(404).json({
          message: 'No consumers found for the specified structure',
        });
      }
  
      // Step 2: Count the total number of BonCommandeInterne records for these consumers
      const totalOrders = await BonCommandeInterne.count({
        where: {
          id_consommateur: {
            [Op.in]: consumerIds,
          },
        },
      });
  
      res.status(200).json({
        message: 'Total number of internal orders by structure retrieved successfully',
        totalOrders,
      });
    } catch (error) {
      console.error('Error retrieving total number of internal orders by structure:', error);
      res.status(500).json({
        message: 'Error retrieving total number of internal orders by structure',
        error: error.message,
      });
    }
  };


  const getUserCommandCounts = async(req,res) =>{
    try {
      const {userId} = req.params;
      // Find commands associated with the user
      const commands = await BonCommandeInterne.findAll({
        where: {
          id_consommateur: userId
        }
      });
  
      // Initialize counters for different validation values
      let validation_0_count = 0;
      let validation_1_2_count = 0;
      let validation_3_count = 0;
  
      // Count commands based on validation value
      commands.forEach(command => {
        if (command.validation === 0) {
          validation_0_count++;
        } else if (command.validation === 1 || command.validation === 2) {
          validation_1_2_count++;
        } else if (command.validation === 3) {
          validation_3_count++;
        }
      });
  
      res.status(200).json( {
        validation_0_count,
        validation_1_2_count,
        validation_3_count
      });
    } catch (error) {
      console.error("Error retrieving user command counts:", error);
      throw error;
    }
  };

  const getTopConsumersForProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        // Step 1: Find the product by id
        const product = await Produit.findByPk(productId);
        if (!product) {
            throw new Error(`Product with ID ${productId} not found`);
        }

        // Step 2: Find the rows of produitsdecharges and produitsservie by produit_id
        const servedProducts = await ProduitsServie.findAll({
            where: { id_produit: productId }
        });
        const dechargedProducts = await ProduitsDecharges.findAll({
            where: { id_produit: productId }
        });

        // Step 3: Get consumers from bonsortie and bondecharge by id_consommateur
        const consumers = {};

        // Helper function to calculate quantity for a consumer
        const calculateQuantity = (consumerName, quantity) => {
            if (!consumers[consumerName]) {
                consumers[consumerName] = 0;
            }
            consumers[consumerName] += quantity;
        };

        // Fetch consumers and calculate quantities for servedProducts
        for (const servedProduct of servedProducts) {
            const bonSortie = await BonSortie.findByPk(servedProduct.id_bonsortie);
            if (bonSortie) {
                const commandeInterne = await BonCommandeInterne.findByPk(bonSortie.id_boncommandeinterne);
                if (commandeInterne) {
                    const consumer = await User.findByPk(commandeInterne.id_consommateur);
                    if (consumer) {
                        const consumerName = consumer.firstname;
                        calculateQuantity(consumerName, servedProduct.servedquantity);
                    }
                }
            }
        }

        // Fetch consumers and calculate quantities for dechargedProducts
        for (const dechargedProduct of dechargedProducts) {
            const bonDecharge = await BonDecharge.findByPk(dechargedProduct.id_bondecharge);
            if (bonDecharge) {
                const commandeInterne = await BonCommandeInterne.findByPk(bonDecharge.id_boncommandeinterne);
                if (commandeInterne) {
                    const consumer = await User.findByPk(commandeInterne.id_consommateur);
                    if (consumer) {
                        const consumerName = consumer.firstname;
                        calculateQuantity(consumerName, dechargedProduct.dechargedquantity);
                    }
                }
            }
        }

        // Step 6: Order the consumers
        const topConsumers = Object.entries(consumers)
            .sort(([, quantityA], [, quantityB]) => quantityB - quantityA)
            .slice(0, 10);

        // Step 7: Return the top consumers with their quantities
        res.status(200).json(topConsumers.map(([consumerName, quantity]) => ({ consumerName, quantity })));
    } catch (error) {
        // Handle errors
        console.error('Error fetching top consumers:', error);
        res.status(500).json({ message: 'Failed to fetch top consumers', error: error.message });
    }
};

const getTopConsumersForProductByDate = async (req, res) => {
  try {
      const {productId} = req.params;
      const { startDate, endDate } = req.body;

      // Step 1: Find the product by id
      const product = await Produit.findByPk(productId);
      if (!product) {
          throw new Error(`Product with ID ${productId} not found`);
      }

      // Step 2: Find BonSortie and BonDecharge records within the date range
      const bonsSortie = await BonSortie.findAll({
          where: {
              date: { // Assuming 'date' is the column name in 'BonSortie'
                  [Op.between]: [startDate, endDate]
              }
          }
      });
      console.log(bonsSortie)

      const bonsDecharge = await BonDecharge.findAll({
          where: {
              date: { // Assuming 'date' is the column name in 'BonDecharge'
                  [Op.between]: [startDate, endDate]
              }
          }
      });

      // Step 3: Get the ids of the filtered BonSortie and BonDecharge records
      const bonsSortieIds = bonsSortie.map(bon => bon.id);
      const bonsDechargeIds = bonsDecharge.map(bon => bon.id);

      // Step 4: Find the rows of produitsdecharges and produitsservie by produit_id and bon ids
      const servedProducts = await ProduitsServie.findAll({
          where: {
              id_produit: productId,
              id_bonsortie: bonsSortieIds
          }
      });

      const dechargedProducts = await ProduitsDecharges.findAll({
          where: {
              id_produit: productId,
              id_bondecharge: bonsDechargeIds
          }
      });

      // Step 5: Get consumers from bonsortie and bondecharge by id_consommateur
      const consumers = {};

      // Helper function to calculate quantity for a consumer
      const calculateQuantity = (consumerName, quantity) => {
          if (!consumers[consumerName]) {
              consumers[consumerName] = 0;
          }
          consumers[consumerName] += quantity;
      };

      // Fetch consumers and calculate quantities for servedProducts
      for (const servedProduct of servedProducts) {
          const bonSortie = bonsSortie.find(bon => bon.id === servedProduct.id_bonsortie);
          if (bonSortie) {
              const commandeInterne = await BonCommandeInterne.findByPk(bonSortie.id_boncommandeinterne);
              if (commandeInterne) {
                  const consumer = await User.findByPk(commandeInterne.id_consommateur);
                  if (consumer) {
                      const consumerName = consumer.firstname;
                      calculateQuantity(consumerName, servedProduct.servedquantity);
                  }
              }
          }
      }

      // Fetch consumers and calculate quantities for dechargedProducts
      for (const dechargedProduct of dechargedProducts) {
          const bonDecharge = bonsDecharge.find(bon => bon.id === dechargedProduct.id_bondecharge);
          if (bonDecharge) {
              const commandeInterne = await BonCommandeInterne.findByPk(bonDecharge.id_boncommandeinterne);
              if (commandeInterne) {
                  const consumer = await User.findByPk(commandeInterne.id_consommateur);
                  if (consumer) {
                      const consumerName = consumer.firstname;
                      calculateQuantity(consumerName, dechargedProduct.dechargedquantity);
                  }
              }
          }
      }

      // Step 6: Order the consumers
      const topConsumers = Object.entries(consumers)
          .sort(([, quantityA], [, quantityB]) => quantityB - quantityA)
          .slice(0, 10);

      // Step 7: Return the top consumers with their quantities
      res.status(200).json(topConsumers.map(([consumerName, quantity]) => ({ consumerName, quantity })));
  } catch (error) {
      // Handle errors
      console.error('Error fetching top consumers:', error);
      res.status(500).json({ message: 'Failed to fetch top consumers', error: error.message });
  }
};



export { calculateQuantitiesByProduct , getMostConsumableProductsByStructure , calculateStockValue , fetchProductsWithPositiveStock ,getMostConsumableProductsByUser , getTopConsumersByStructure , getTotalOrdersByStructure , getUserCommandCounts,getTopConsumersForProduct,getTopConsumersForProductByDate};
