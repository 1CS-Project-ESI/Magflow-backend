import { EtatStock, Inventaire } from '../models/inventaireModel.js';
import { Produit } from '../models/productsModel.js';

const addInventoryState = async (req, res) => {
    try {
        const { number, date, products } = req.body;

        const inventaire = await Inventaire.create
        ({
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
            observation,
          });
        }
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

const viewInventoryState = async (req, res) => {
  try {
    const { id } = req.params;

    const etatInventaires = await EtatStock.findAll({
      where: { id_inventaire: id },
    });

    if (etatInventaires.length === 0) {
      return res.status(404).json({ error: 'Inventory state not found' });
    }

    const response = await Promise.all(
      etatInventaires.map(async (etatInventaire) => {
        const produit = await Produit.findByPk(etatInventaire.id_produit, {
          attributes: ['name', 'caracteristics', 'quantity', 'seuil'],
        });
        return { ...etatInventaire.toJSON(), Produit: produit };
      })
    );

    res.status(200).json(response);
  } catch (error) {
    console.error('Error retrieving inventory state:', error);
    res.status(500).json({ error: 'Failed to retrieve inventory state' });
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

const getInventoryDifferences = async (req, res) => {
  try {
    const { id_inventaire } = req.params;

    const etatInventaires = await EtatStock.findAll({
        where: { id_inventaire },
    });

    if (etatInventaires.length === 0) {
        return res.status(404).json({ error: 'No inventory states found for this inventory' });
    }

    const differences = [];

    for (const etatInventaire of etatInventaires) {
        const produit = await Produit.findByPk(etatInventaire.id_produit);
        if (produit && produit.quantity !== etatInventaire.physicalquantity) {
            differences.push({
                id: produit.id,
                name: produit.name,
                caracteristics: produit.caracteristics,
                quantity: produit.quantity,
                seuil: produit.seuil,
                physicalquantity: etatInventaire.physicalquantity,
                observation: etatInventaire.observation
            });
        }
    }

    if (differences.length === 0) {
        return res.status(200).json({ message: 'No differences found' });
    }

    res.status(200).json(differences);
} catch (error) {
    console.error('Error retrieving inventory differences:', error);
    res.status(500).json({ error: 'Failed to retrieve inventory differences' });
}
};


export { addInventoryState, modifyInventoryState, deleteInventoryState, viewInventoryState,getAllInventaires,validateInventoryState,getInventoryDifferences };