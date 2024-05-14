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
        const { id } = req.params;
        const { physicalQuantity, observation } = req.body;

        const etatStock = await EtatStock.findOne({
            where: { id_inventaire: id }
        });

        if (!etatStock) {
            return res.status(404).json({ error: 'Inventory state not found' });
        }

        etatStock.physicalquantity = physicalQuantity;
        etatStock.observation = observation;
        await etatStock.save();

        res.status(200).json({ message: 'Inventory state updated successfully', etatStock });
    } catch (error) {
        console.error('Error updating inventory state:', error);
        res.status(500).json({ error: 'Failed to update inventory state' });
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

        const etatInventaire = await EtatStock.findOne({
            where: { id_inventaire: id }
        });

        if (!etatInventaire) {
            return res.status(404).json({ error: 'Inventory state not found' });
        }

        res.status(200).json(etatInventaire);
    } catch (error) {
        console.error('Error retrieving inventory state:', error);
        res.status(500).json({ error: 'Failed to retrieve inventory state' });
    }
};

const validateInventoryState = async (req, res) => {
    try {
        const { id_inventaire } = req.params;

        const etatInventaires = await EtatStock.findAll({
          where: { id_inventaire },
        });
    
        if (etatInventaires.length === 0) {
          return res.status(404).json({ error: 'Inventory state not found' });
        }
    

        const updatedEtatInventaires = await Promise.all(
          etatInventaires.map(async (etatInventaire) => {
            return await etatInventaire.increment('validate', { by: 1 });
          })
        );
    

        for (const etatInventaire of etatInventaires) {
          const produit = await Produit.findByPk(etatInventaire.id_produit);
          if (produit) {
            produit.quantity = etatInventaire.physicalquantity;
            await produit.save();
          }
        }

        res.status(200).json({ message: 'Inventory state validated successfully', updatedEtatInventaires });
      } catch (error) {
        console.error('Error validating inventory state:', error);
        res.status(500).json({ error: 'Failed to validate inventory state' });
      }
    }

export { addInventoryState, modifyInventoryState, deleteInventoryState, viewInventoryState,validateInventoryState };

