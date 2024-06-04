import { EtatStock, Inventaire } from '../models/inventaireModel.js';
import { Produit,Article,Chapitre } from '../models/productsModel.js';
import { ProduitsDelivres, ProduitsServie } from '../models/bonsModel.js';
import { sendNotification } from '../services/notificationService.js';

const addInventoryState = async (req, res) => {
  try {
    const { articleId, number, date, products } = req.body;

    const inventaire = await Inventaire.create({
        id_article: articleId,
        number,
        date
    });

    for (const product of products) {
        const { produitId, physicalQuantity, observation } = product;
        const produit = await Produit.findByPk(produitId);

        if (!produit) {
            return res.status(404).json({ error: `Product with ID ${produitId} not found` });
        }

        const etatStock = await EtatStock.create({
            id_produit: produitId,
            id_inventaire: inventaire.id,
            physicalquantity: physicalQuantity,
            logicalquantity : produit.quantity ,
            observation,
        });
    }
    sendNotification(`Inventaire ${inventaire.number} requires validation.`, 34);

    res.status(201).json({ message: 'Inventory states added successfully', inventaire });
} catch (error) {
    console.error('Error adding inventory states:', error);
    res.status(500).json({ error: 'Failed to add inventory states' });
}
};

const modifyInventoryState = async (req, res) => {
  try {
    const { products } = req.body;

    const updatedStates = [];
    for (const product of products) {
        const { id, physicalQuantity, observation } = product;

        const etatInventaire = await EtatStock.findByPk(id);

        if (!etatInventaire) {
            return res.status(404).json({ error: `Inventory state with ID ${id} not found` });
        }

        if (physicalQuantity !== undefined) {
            etatInventaire.physicalquantity = physicalQuantity;
        }
        if (observation !== undefined) {
            etatInventaire.observation = observation;
        }
        await etatInventaire.save();

        updatedStates.push(etatInventaire);
    }

    res.status(200).json({ message: 'Inventory states updated successfully', updatedStates });
} catch (error) {
    console.error('Error updating inventory states:', error);
    res.status(500).json({ error: 'Failed to update inventory states' });
}
};

const deleteInventoryState = async (req, res) => {
        try {
        const { id } = req.params;
        const deleted = await Inventaire.destroy({ where: { id: id } });
        if (deleted) {
            res.status(200).json({ message: 'State deleted successfully' });
        } else {
            res.status(404).json({ message: 'State not found' });
        }
        } catch (error) {
        res.status(500).json({
            message: 'Failed to delete supplier',
            error: error.message,
        });
        }
  };

const getAllInventaires = async (req, res) => {
    try {
        const inventaires = await Inventaire.findAll();
        res.status(200).json(inventaires);
    } catch (error) {
        console.error('Error fetching inventaires:', error);
        res.status(500).json({ error: 'Failed to fetch inventaires' });
    }
};

const validateInventoryState = async (req, res) => {
  try {
    const { id_inventaire } = req.params;

    const inventaire = await Inventaire.findByPk(id_inventaire);

    if (!inventaire) {
        return res.status(404).json({ error: 'Inventaire not found' });
    }

    if (inventaire.validation === 1) {
        return res.status(400).json({ error: 'Inventory state is already validated' });
    }

    inventaire.validation = 1;
    await inventaire.save();

    const etatInventaires = await EtatStock.findAll({
        where: { id_inventaire },
    });

    if (etatInventaires.length === 0) {
        return res.status(404).json({ error: 'No inventory states found for this inventory' });
    }

    for (const etatInventaire of etatInventaires) {
        const produit = await Produit.findByPk(etatInventaire.id_produit);
        if (produit) {
            produit.quantity = etatInventaire.physicalquantity;
            await produit.save();
        }
    }

    res.status(200).json({ message: 'Inventory state validated successfully', inventaire });
} catch (error) {
    console.error('Error validating inventory state:', error);
    res.status(500).json({ error: 'Failed to validate inventory state' });
}
};

// const getInventoryDifferences = async (req, res) => {
//   try {
//     const { id_inventaire } = req.params;

//     const etatInventaires = await EtatStock.findAll({
//         where: { id_inventaire },
//     });

//     if (etatInventaires.length === 0) {
//         return res.status(404).json({ error: 'No inventory states found for this inventory' });
//     }

//     const differences = [];

//     for (const etatInventaire of etatInventaires) {
//         const produit = await Produit.findByPk(etatInventaire.id_produit);
//         if (produit && produit.quantity !== etatInventaire.physicalquantity) {
//             differences.push({
//                 id: produit.id,
//                 name: produit.name,
//                 caracteristics: produit.caracteristics,
//                 quantity: produit.quantity,
//                 seuil: produit.seuil,
//                 physicalquantity: etatInventaire.physicalquantity,
//                 observation: etatInventaire.observation
//             });
//         }
//     }

//     if (differences.length === 0) {
//         return res.status(200).json({ message: 'No differences found' });
//     }

//     res.status(200).json(differences);
// } catch (error) {
//     console.error('Error retrieving inventory differences:', error);
//     res.status(500).json({ error: 'Failed to retrieve inventory differences' });
// }
// };

const viewInventoryState = async (req, res) => {
  try {
    const { id } = req.params;

    const etatInventaires = await EtatStock.findAll({
      where: { id_inventaire: id },
    });

    if (etatInventaires.length === 0) {
      return res.status(404).json({ error: 'Inventory state not found' });
    }

    const inventaire = await Inventaire.findByPk(id);
    if (!inventaire) {
      return res.status(404).json({ error: `Inventory with ID ${id} not found` });
    }

    const article = await Article.findByPk(inventaire.id_article);
    if (!article) {
      return res.status(404).json({ error: `Article with ID ${inventaire.id_article} not found` });
    }

    const chapitre = await Chapitre.findByPk(article.chapter_id);
    const chapitreName = chapitre ? chapitre.name : 'Unknown';
    const articleName = article.name;

    const response = await Promise.all(
      etatInventaires.map(async (etatInventaire) => {
        try {
          const produit = await Produit.findByPk(etatInventaire.id_produit);
          if (!produit) {
            throw new Error(`Product with ID ${etatInventaire.id_produit} not found`);
          }

          const reste = await getReste(etatInventaire.id_produit);
          const entree = await getEntree(etatInventaire.id_produit);
          const sortie = await getSortie(etatInventaire.id_produit);

          const ecart = etatInventaire.physicalquantity - produit.quantity;

          return {
            designation: produit.name,
            n_inventaire: etatInventaire.id_inventaire,
            reste: reste,
            entree: entree,
            sortie: sortie,
            quantity_logique: produit.quantity,
            physicalquantity: etatInventaire.physicalquantity,
            ecart: ecart,
            obs: etatInventaire.observation || "",
            produit: {
              caracteristics: produit.caracteristics,
              stock_mini: produit.seuil,
            },
          };
        } catch (error) {
          console.error('Error retrieving inventory state for a product:', error);
          return null;
        }
      })
    );

    const filteredResponse = response.filter((item) => item !== null);

    res.status(200).json({
      inventaire: {
        id: inventaire.id,
        number: inventaire.number,
        date: inventaire.date,
        validation: inventaire.validation,
      },
      chapitre: chapitreName,
      article: articleName,
      products: filteredResponse,
    });
  } catch (error) {
    console.error('Error retrieving inventory state:', error);
    res.status(500).json({ error: 'Failed to retrieve inventory state' });
  }
};

const getReste = async (produitId) => {
  try {
    const lastInventory = await EtatStock.findOne({
      where: {
        id_produit: produitId,
      },
      order: [['id_inventaire', 'DESC']],
    });
    if (!lastInventory) {
      return 0; 
    }
    return lastInventory.physicalquantity;
  } catch (error) {
    console.error('Error retrieving last inventory:', error);
    throw new Error('Failed to retrieve last inventory');
  }
};

const getEntree = async (produitId) => {
  try {
    const produitsDelivres = await ProduitsDelivres.findAll({
      where: { id_produit: produitId },
      attributes: ['receivedquantity'], 
    }); 

    return produitsDelivres.reduce((total, produit) => total + produit.receivedquantity, 0);
  } catch (error) {
    console.error('Error retrieving incoming quantity:', error);
    throw new Error('Failed to retrieve incoming quantity');
  }
};

const getSortie = async (produitId) => {
  try {
    const produitsServie = await ProduitsServie.findAll({
      where: { id_produit: produitId },
      attributes: ['servedquantity'],
    });

    return produitsServie.reduce((total, produit) => total + produit.servedquantity, 0);
  } catch (error) {
    console.error('Error retrieving outgoing quantity:', error);
    throw new Error('Failed to retrieve outgoing quantity');
  }
};

export { addInventoryState, modifyInventoryState, deleteInventoryState, viewInventoryState,getAllInventaires,validateInventoryState};