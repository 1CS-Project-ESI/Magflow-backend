import { BonCommande , BonReception, ProduitsCommandes, ProduitsDelivres , ProduitsCommandeInterne, BonCommandeInterne , BonSortie,ProduitsServie,BonDecharge, ProduitsDecharges} from "../models/bonsModel.js";
import { Article , Produit, ProduitsArticle } from "../models/productsModel.js";
import {sequelize} from '../models/usersModel.js'; 
import { Structure } from "../models/structuresModel.js";
import { Op } from 'sequelize';
import { StructureResponsable , Consumer, Director, Magasinier } from "../models/usersModel.js";
import {Fournisseur} from "../models/fournisseurModel.js";
import { sendNotificationToUser } from "../services/notificationService.js";

const createBonCommande = async (req, res) => {
    try {
        const { id_agentserviceachat } = req.params;
        const { id_fournisseur, number, orderdate, status, productsOrdered, orderspecifications } = req.body;

        let total_ht = 0;
        let total_tva = 0;
        let total_ttc = 0;

        const newBonCommande = await BonCommande.create({
            id_agentserviceachat,
            id_fournisseur,
            number,
            orderdate,
            orderspecifications,
            status,
            total_ttc,
            total_ht,
            tva: total_tva
        });

        for (const product of productsOrdered) {
            total_ht += product.ordered_quantity * product.price;
        }

        for (const product of productsOrdered) {
            const { productId, ordered_quantity, price } = product;
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

            const article = await Article.findByPk(produitArticle.id_article);

            if (!article) {
                return res.status(404).json({ message: `Article not found for product ID ${productId}` });
            }

            const tva = article.tva;
            const product_total_ttc = (price * (1 + tva / 100)) * ordered_quantity;
            total_ttc += product_total_ttc;
            total_tva += (price * (tva / 100)) * ordered_quantity;

            await ProduitsCommandes.create({
                id_produit: productId,
                id_boncommande: newBonCommande.id,
                ordered_quantity,
                price
            });
        }

        await newBonCommande.update({
            total_ht,
            tva: total_tva,
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
            return res.status(400).json({ message: 'These products were not ordered' });
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

            const product = await Produit.findByPk(productId);
            if (product) {
                const newQuantity = product.quantity + receivedQuantity;
                await product.update({ quantity: newQuantity });
            } else {
                console.error(`Product with ID ${productId} not found`);
            }
        });

        // wait for all ProduitsDelivres instances to be created (using promise)
        await Promise.all(produitsDelivresPromises);

        res.status(200).json({ message: 'BonReception created successfully', bonReception });
    } catch (error) {
        console.error('Error creating BonReception:', error);
        res.status(500).json({ message: 'Failed to create BonReception', error: error.message });
    }
};

// bon reception deteailes 
// const getBonReceptionDetails = async (req, res) => {
//     try {
//         // const { id } = req.params;
//         const id = 22;
//         const bonReception = await BonReception.findOne({
//             where: { id: id }
//         });
//         console.log(bonReception);

//         if (!bonReception) {
//             return res.status(404).json({ message: 'Bon reception not found' });
//         }

//         const magasinier = await Magasinier.findByPk(bonReception.id_magasinier, {
//             attributes: ['id', 'name'] 
//         });

//         const bonCommande = await BonCommande.findByPk(bonReception.id_boncommande, {
//             attributes: ['id', 'number', 'orderdate'] 
//         });

//         const produitsDelivresData = await ProduitsDelivres.findAll({
//             where: {
//                 id_bonreception: id
//             },
//             attributes: ['id_produit', 'receivedquantity'] 
//         });

//         const produitsDelivres = [];
//         for (const produitDelivreData of produitsDelivresData) {
//             const { id_produit, receivedquantity } = produitDelivreData;
//             const produit = await Produit.findByPk(id_produit, {
//                 attributes: ['id', 'name'] 
//             });
//             if (produit) {
//                 produitsDelivres.push({ 
//                     ...produit.toJSON(), 
//                     receivedquantity,
//                     product_name: produit.name // Include the product name in the object
//                 });
//             }
//         }

//         res.status(200).json({ 
//             bonReception: { 
//                 ...bonReception.toJSON(), 
//                 magasinier_name: magasinier ? magasinier.name : null,
//                 bon_commande_number: bonCommande ? bonCommande.number : null,
//                 bon_commande_orderdate: bonCommande ? bonCommande.orderdate : null
//             }, 
//             produitsDelivres
//         });
//     } catch (error) {
//         console.error('Error fetching bon reception details:', error);
//         res.status(500).json({ message: 'Failed to fetch bon reception details' });
//     }
// };

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

        const command = await BonCommande.findByPk(command_id);

        if (!command) {
            return res.status(404).json({ message: 'Command not found' });
        }
        const productsData = await ProduitsCommandes.findAll({
            where: {
                id_boncommande: command_id
            },
            attributes: ['id_produit', 'ordered_quantity'] 
        });

        const products = [];
        for (const productData of productsData) {
            const { id_produit, ordered_quantity } = productData;
            const product = await Produit.findByPk(id_produit, {
                attributes: ['id', 'name', 'caracteristics'] 
            });
            if (product) {
                products.push({ ...product.toJSON(), ordered_quantity });
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
    const receptionIds = receptions.map(reception => reception.id);


    const orderedProducts = await ProduitsCommandes.findAll({
        where: {
            id_boncommande: CommandId,
        },
        attributes: ['id_produit', 'ordered_quantity'],
        raw: true,
    });


    const productIds = orderedProducts.map(product => product.id_produit);
    const products = await Produit.findAll({
        where: {
            id: productIds,
        },
        attributes: ['id', 'name'],
        raw: true,
    });


    const receivedProducts = await ProduitsDelivres.findAll({
        where: {
            id_bonreception: receptionIds,
        },
        attributes: ['id_produit', 'receivedquantity'],
        raw: true,
    });


    const receivedMap = receivedProducts.reduce((acc, item) => {
        if (!acc[item.id_produit]) {
            acc[item.id_produit] = 0;
        }
        acc[item.id_produit] += item.receivedquantity;
        return acc;
    }, {});


    const remainingProducts = orderedProducts.map(product => {
        const receivedQuantity = receivedMap[product.id_produit] || 0;
        const remainingQuantity = product.ordered_quantity - receivedQuantity;

        const productName = products.find(p => p.id === product.id_produit)?.name || 'Unknown';
        return {
            productId: product.id_produit,
            name: productName,
            orderedQuantity: product.ordered_quantity,
            receivedQuantity: receivedQuantity,
            remainingQuantity: remainingQuantity,
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
        const command = await BonCommande.findOne({
            where: { number: number }
        });

        if (!command) {
            return res.status(404).json({ message: 'Command not found' });
        }

        const products = await ProduitsCommandes.findAll({
            where: { id_boncommande: command.id },
            attributes: ['id_produit'] 
        });

        const productIds = products.map(product => product.id_produit);
        const productsData = await Produit.findAll({
            where: { id: productIds }
        });

        res.status(200).json({ products: productsData });
    } catch (error) {
        console.error('Error fetching products of command:', error);
        res.status(500).json({ message: 'Failed to fetch products of command' });
    }
};

// const getBonReceptionDetails = async (req, res) => {
//     try {
//         // const { id } = req.params;
//         const id = 22;
//         const reception = await BonReception.findOne({
//             where: { id: id }
//         });

//         if (!reception) {
//             return res.status(404).json({ message: 'reception not found' });
//         }

       
        
//         const produitsDelivresData = await ProduitsDelivres.findAll({
//                         where: {
//                             id_bonreception: id
//                         },
//                         attributes: ['id_produit', 'receivedquantity'] 
//                     });
            
//                     const produitsDelivres = [];
//                     for (const produitDelivreData of produitsDelivresData) {
//                         const { id_produit, receivedquantity } = produitDelivreData;
//                         const produit = await Produit.findByPk(id_produit, {
//                             attributes: ['id', 'name'] 
//                         });
//                         if (produit) {
//                             produitsDelivres.push({ 
//                                 ...produit.toJSON(), 
//                                 receivedquantity,
//                                 product_name: produit.name // Include the product name in the object
//                             });
//                         }
//                     }

        

//         res.status(200).json({ reception: { ...command.toJSON(), produitsDelivres }});
//     } catch (error) {
//         console.error('Error fetching command details:', error);
//         res.status(500).json({ message: 'Failed to fetch command details' });
//     }
// };


const getBonReceptionDetails = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(id);
        // const id = 22;
        const reception = await BonReception.findOne({
            where: { id: id }
        });

        if (!reception) {
            return res.status(404).json({ message: 'Reception not found' });
        }

        const produitsDelivresData = await ProduitsDelivres.findAll({
            where: {
                id_bonreception: id
            },
            attributes: ['id_produit', 'receivedquantity'] 
        });

        const produitsDelivres = [];
        for (const produitDelivreData of produitsDelivresData) {
            const { id_produit, receivedquantity } = produitDelivreData;
            const produit = await Produit.findByPk(id_produit, {
                attributes: ['id', 'name'] 
            });
            if (produit) {
                produitsDelivres.push({ 
                    ...produit.toJSON(), 
                    receivedquantity,
                    product_name: produit.name
                });
            }
        }

        res.status(200).json({ 
            reception: { 
                ...reception.toJSON(),
            }, 
            produitsDelivres
        });
    } catch (error) {
        console.error('Error fetching bon reception details:', error);
        res.status(500).json({ message: 'Failed to fetch bon reception details' });
    }
};


const getCommandDetails = async (req, res) => {
    try {
         const { id } = req.params;
      
        const command = await BonCommande.findOne({
            where: { id: id }
        });

        if (!command) {
            return res.status(404).json({ message: 'Command not found' });
        }

        const supplier = await Fournisseur.findByPk(command.id_fournisseur, {
            attributes: ['id', 'name'] 
        });

        
        const productsData = await ProduitsCommandes.findAll({
            where: {
                id_boncommande: id
            },
            attributes: ['id_produit', 'ordered_quantity', 'price'] 
        });

        const products = [];
        for (const productData of productsData) {
            const { id_produit, ordered_quantity, price } = productData;
            const product = await Produit.findByPk(id_produit, {
                attributes: ['id', 'name'] 
            });
            if (product) {
                products.push({ ...product.toJSON(), ordered_quantity, price });
            }
        }

        const AllBonRecepttions = await BonReception.findAll({
            where: { id_boncommande: id }, 
          });
        

        res.status(200).json({ command: { ...command.toJSON(), fournisseur_name: supplier ? supplier.name : null }, products ,AllBonRecepttions ,tva:command.tva});
    } catch (error) {
        console.error('Error fetching command details:', error);
        res.status(500).json({ message: 'Failed to fetch command details' });
    }
};



const getIdResponsable = async (id_consommateur) => {
    try {
      const consumer = await Consumer.findOne({ where: { user_id: id_consommateur } });
      if (consumer) {
        const structure = await Structure.findOne({ where: { id: consumer.id_structure } });
        if (structure) {
          const responsable = await StructureResponsable.findOne({ where: { id_structure: structure.id } });
          if (responsable) {
            return responsable.user_id;
          }
        }
      }
      return null; 
    } catch (error) {
      console.error('Failed to get id_responsable:', error);
      throw error;
    }
  };
  
const createBonCommandeInterne = async (req, res) => {
    try {
        const {id_consommateur} = req.params;
        const {  number, date, produitsCommandes ,typecommande} = req.body;
        const id_responsable = await getIdResponsable(id_consommateur);


        const bonCommandeInterne = await BonCommandeInterne.create({
            id_consommateur,
            number, // i have to geenerate it 
            date,
            typecommande
        });

        sendNotificationToUser(`Bon de commande interne ${bonCommandeInterne.number} is ready for processing.`, id_responsable)


        for (const produitCommande of produitsCommandes) {
            await ProduitsCommandeInterne.create({
                id_produit: produitCommande.id_produit,
                id_boncommandeinterne: bonCommandeInterne.id,
                orderedquantity: produitCommande.orderedquantity

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

        const { id } = req.params;

        const command = await BonCommandeInterne.findByPk(id);

        if (!command) {
            return res.status(404).json({ message: 'Internal command not found' });
        }

        const productOrders = await ProduitsCommandeInterne.findAll({
            where: { id_boncommandeinterne: id }
        });

        const productDetails = await Promise.all(productOrders.map(async (order) => {

            const product = await Produit.findByPk(order.id_produit);
            if (product) {
                return {
                    id_produit :product.id,
                    name: product.name,
                    characteristics: product.caracteristicsgit ,
                    orderedQuantity: order.orderedquantity,
                    accordedQuantity: order.accordedquantity

                };
            }
            return null;
        }));

        res.status(200).json({ command, products: productDetails });
    } catch (error) {

        console.error('Failed to get internal command details:', error);
        res.status(500).json({ message: 'Failed to get internal command details', error: error.message });
    }
};
const createBonSortie = async (req, res) => {
    try {
        const { id_boncommandeinterne } = req.params;
        const { service, date, observations } = req.body;
    
        const bonCommandeInterne = await BonCommandeInterne.findOne({
          where: { id: id_boncommandeinterne }
        });
    
        if (!bonCommandeInterne) {
          return res.status(400).json({ message: 'Invalid id_boncommandeinterne' });
        }
    
        if (bonCommandeInterne.typecommande !== 'Commande Interne') {
          return res.status(400).json({ message: 'It\'s not a Commande Interne' });
        }
    
        const sortie = await BonSortie.findOne({
          where: { id_boncommandeinterne: id_boncommandeinterne }
        });
        if (sortie) {
          return res.status(400).json({ message: 'Bon de sortie already created' });
        }
    
        if (bonCommandeInterne.validation !== 3) {
          return res.status(400).json({ message: 'Bon de commande is not validated yet' });
        }
    
        const produits = await ProduitsCommandeInterne.findAll({
          where: { id_boncommandeinterne: id_boncommandeinterne }
        });
    
        for (const produit of produits) {
          const availableQuantity = produit.quantity - produit.seuil;
          if (produit.accordedquantity > availableQuantity) {
            return res.status(400).json({
              message: 'Accorded quantity exceeds available quantity - seuil',
              produit: produit.id_produit
            });
          }
        }
    
        const bonSortie = await BonSortie.create({
          id_boncommandeinterne,
          service,
          date
        });
    
        for (const produit of produits) {
          const observation = observations.find(obs => obs.id_produit === produit.id_produit);
    
          await ProduitsServie.create({
            id_bonsortie: bonSortie.id,
            id_produit: produit.id_produit,
            servedquantity: produit.accordedquantity,
            observation: observation ? observation.observation : null
          });
    
          await Produit.update(
            { quantity: sequelize.literal(`quantity - ${produit.accordedquantity}`) },
            { where: { id: produit.id_produit } }
          );
    
          if (observation) {
            await Produit.update(
              { observation: observation.observation },
              { where: { id: produit.id_produit } }
            );
          }
        }
    
        // Gestion des alertes
        for (const produit of produits) {
          const updatedProduct = await Produit.findByPk(produit.id_produit);
          if (updatedProduct.quantity <= updatedProduct.seuil) {
            await sendNotificationToUser(
              `The product ${updatedProduct.name} is running out of stock.`,
              34 // Assuming 34 is the user ID of the magasinier
            );
          }
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

        for(const command of commands){
            
        }

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
        const {id_structureresponsable} = req.params;
        const responsable = await StructureResponsable.findByPk(id_structureresponsable)

        if (!responsable) {
            throw new Error('Structure responsable not found');
        }

        const consumers = await Consumer.findAll({
            where: { id_structure: responsable.id_structure }
        });

        const bonCommandInterne = await BonCommandeInterne.findAll({
            where: { id_consommateur: consumers.map(consumer => consumer.user_id),
            validation: 0 }
            
        });

        return res.status(200).json(bonCommandInterne);
    } catch (error) {
        console.error('Failed to get boncommandinterne for structure responsable:', error);
        throw error;
    }
};


const getAllBonCommandInterneFFordirectorMagazinier = async (req, res) => {
    try {
        const { role } = req.query; 
        let validationStatus;

        switch (role) {
            case 'director':
                validationStatus = 1;
                break;
            case 'magasinier':
                validationStatus =[2, 3];
                break;
            default:
                return res.status(403).json({ message: 'User role not authorized' });
        }

        const bonCommandInterne = await BonCommandeInterne.findAll({
            where: { validation: validationStatus }
        });

        return res.status(200).json(bonCommandInterne);
    } catch (error) {
        console.error('Failed to get bon command interne:', error);
        return res.status(500).json({ message: 'Failed to get bon command interne', error: error.message });
    }
};

const createBonDecharge = async (req, res) => {
    try {
        const { service, date, observations } = req.body;
        const {id_boncommandeinterne} = req.params

        const bonCommandeInterne = await BonCommandeInterne.findOne({
            where: { id: id_boncommandeinterne }
        });

        if (!bonCommandeInterne) {
            return res.status(400).json({ message: 'Invalid id_boncommandeinterne' });
        }

        if (bonCommandeInterne.typecommande !== 'Commande Decharges') {
            return res.status(400).json({ message: 'It\'s not a Commande Decharges' });
        }

        const decharge = await BonDecharge.findOne({
            where: { id_boncommandeinterne: id_boncommandeinterne }
        });
        if (decharge) {
            return res.status(400).json({ message: 'Bon decharge already created' });
        }

        if (bonCommandeInterne.validation !== 3) {
            return res.status(400).json({ message: 'Bon de commande is not validated yet' });
        }

        const id_consommateur = bonCommandeInterne.id_consommateur;

        const produits = await ProduitsCommandeInterne.findAll({
            where: { id_boncommandeinterne: id_boncommandeinterne }
        });

        for (const produit of produits) {
            const availableQuantity = produit.quantity - produit.seuil;
            if (produit.accordedquantity > availableQuantity) {
                return res.status(400).json({
                    message: 'Accorded quantity exceeds available quantity - seuil',
                    produit: produit.id_produit
                });
            }
        }

        const bonDecharge = await BonDecharge.create({
            id_consommateur: id_consommateur,
            id_boncommandeinterne: id_boncommandeinterne,
            service:service,
            date: date,
        });

        for (const produit of produits) {
            const product = await Produit.findByPk(produit.id_produit);

            if (!product) {
                console.error(`Product with ID ${produit.id_produit} not found.`);
                return res.status(404).json({ success: false, message: `Product with ID ${produit.id_produit} not found.` });
            }

            const availableQuantity = Math.max(0, product.quantity - product.seuil);
            const accordedQuantity = Math.min(produit.accordedquantity, availableQuantity);

            const observationText = observations.find(obs => obs.id_produit === produit.id_produit)?.observation;

            await ProduitsDecharges.create({
                id_bondecharge: bonDecharge.id,
                id_produit: produit.id_produit,
                dechargedquantity: accordedQuantity,
                observation: observationText || null // Use observation text if found, else null
            });

            await Produit.update({
                quantity: product.quantity - accordedQuantity
            }, {
                where: { id: produit.id_produit },
            });
        }

        res.status(201).json({ message: 'Bon decharge created successfully', bonDecharge });
    } catch (error) {
        console.error('Failed to create bon decharge:', error);
        res.status(500).json({ message: 'Failed to create bon decharge', error: error.message });
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
        const bonDecharge = await BonDecharge.findByPk(id_bondecharge);


        if (!bonDecharge) {
            return res.status(404).json({ success: false, message: 'Borrowing receipt not found' });
        }
        const count = await ProduitsDecharges.count({ where: { id_bondecharge: id_bondecharge } });
        console.log("this is the count ",count);
        if (count > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete. Borrowing receipt has associated product records' });
        }

        await bonDecharge.destroy();

        // Return success response
        res.status(200).json({ success: true, message: 'Borrowing receipt deleted successfully' });
    } catch (error) {
        console.error('Error deleting borrowing receipt:', error);
        res.status(500).json({ success: false, message: 'Error deleting borrowing receipt', error: error.message });
    }
}; 

const validateBonCommandeInterne = async (req, res) => {
    try {
      const { id_boncommandeinterne } = req.params;
      const { products } = req.body; // id product + accordProduct
  
      const bonCommandeInterne = await BonCommandeInterne.findByPk(id_boncommandeinterne);
  
      if (!bonCommandeInterne) {
        return res.status(404).json({ error: "Bon de commande interne not found" });
      }
  
      if (!products || Object.keys(products).length === 0) {
        bonCommandeInterne.validation++;
        await bonCommandeInterne.save();
  
        if (bonCommandeInterne.validation === 1) {
          sendNotificationToUser(`Bon de commande interne ${bonCommandeInterne.number} requires validation.`, 34);
        } else if (bonCommandeInterne.validation === 2) {

          sendNotificationToUser(`Bon de commande interne ${bonCommandeInterne.number} is ready for processing.`, 136);
        } else if (bonCommandeInterne.validation === 3) {
            sendNotificationToUser(`Your command ${bonCommandeInterne.number} is validated and ready for pickup.`, bonCommandeInterne.id_consommateur);
        };
  
        return res.status(200).json({ message: "Bon de commande interne validated successfully with no new accorded quantities" });
      } else {
        for (const product of products) {
          const existingProduct = await ProduitsCommandeInterne.findOne({
            where: { id_produit: product.id_produit, id_boncommandeinterne: id_boncommandeinterne }
          });
  
          if (!existingProduct) {
            return res.status(404).json({ error: `Product with ID ${product.id_produit} not found in bon de commande` });
          }
  
          existingProduct.accordedquantity = product.accordedquantity;
          await existingProduct.save();
        }
  
        bonCommandeInterne.validation++;
        await bonCommandeInterne.save();
  
        if (bonCommandeInterne.validation === 1) {
          sendNotificationToUser(`Bon de commande interne ${bonCommandeInterne.number} requires validation.`, 34);
        } else if (bonCommandeInterne.validation === 2) {
          sendNotificationToUser(`Bon de commande interne ${bonCommandeInterne.number} is ready for processing.`, 136);
        }
  
        res.status(200).json({ message: "Bon de commande interne validated successfully" });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

const getProductMovementSheet = async (req, res) => {
    const { productId } = req.params;
  
    if (!productId) {
      return res.status(400).json({
        message: 'productId parameter is required',
      });
    }
  
    try {
      // Step 1: Check if the product exists
      const product = await Produit.findByPk(productId);
  
      if (!product) {
        return res.status(404).json({
          message: 'Product not found',
        });
      }
  
      // Step 2: Fetch product movements if the product exists
      // Fetch product deliveries
      const deliveries = await ProduitsDelivres.findAll({
        where: { id_produit: productId },
        include: [
          {
            model: BonReception,
            as: 'bonReception',
            attributes: ['deliverydate']
          }
        ]
      });
  
      // Fetch product decharges
      const decharges = await ProduitsDecharges.findAll({
        where: { id_produit: productId },
        include: [
          {
            model: BonDecharge,
            as: 'bonDecharge',
            attributes: ['date']
          }
        ]
      });
  
      // Fetch product sorties
      const sorties = await ProduitsServie.findAll({
        where: { id_produit: productId },
        include: [
          {
            model: BonSortie,
            as: 'bonSortie',
            attributes: ['date']
          }
        ]
      });
  
      // Combine all movements and sort by date
      const movements = [];
  
      deliveries.forEach(delivery => {
        movements.push({
          type: 'Reception',
          date: delivery.bonReception.deliverydate,
          quantity: delivery.receivedquantity
        });
      });
  
      decharges.forEach(decharge => {
        movements.push({
          type: 'Decharge',
          date: decharge.bonDecharge.date,
          quantity: decharge.dechargedquantity
        });
      });
  
      sorties.forEach(sortie => {
        movements.push({
          type: 'Sortie',
          date: sortie.bonSortie.date,
          quantity: sortie.servedquantity
        });
      });
  
      movements.sort((a, b) => new Date(a.date) - new Date(b.date));
  
      // Step 3: Return the result
      res.status(200).json({
        message: 'Product movement sheet retrieved successfully',
        data: {
          product: {
            id: productId,
            name: product.name,
            // Include other product details as needed
          },
          movements: movements
        }
      });
  
    } catch (error) {
      console.error('Error retrieving product movement sheet:', error);
      res.status(500).json({
        message: 'Error retrieving product movement sheet',
        error: error.message,
      });
    }
  };
export {getAllBonCommandInterneFFordirectorMagazinier ,createBonCommande ,createBonRepection, getAllCommands,getAllReception ,getAllProductsOfCommand, getProductsWithQuantityDelivered, RemainingProducts,getAllProductsOfCommandWithNumber, getCommandDetails, createBonCommandeInterne, getcommandinternedetails, getConsommateurCommands, getAllCommandsInterne, createBonSortie, getAllBonSorties,getBonCommandInterneForStructureResponsable, createBonDecharge,receiveBorrowedProducts,getAllBonDecharges,getBonDechargeDetailsById,deleteBonDechargeById,validateBonCommandeInterne,getBonReceptionDetails , getProductMovementSheet}
