import { Fournisseur } from '../models/fournisseurModel.js'; 


const createFournisseur = async (req, res) => {
    try {

        const { name, email, phone, rc, nif, rib } = req.body;
        
        const existingFournisseur = await Fournisseur.findOne({ where: { email } });
        if (existingFournisseur) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        const fournisseur = await Fournisseur.create({
            name,
            email,
            phone,
            rc,
            nif,
            rib
        });

        res.status(201).json({ message: 'Supplier created successfully', fournisseur });
    } catch (error) {

        console.error('Failed to create supplier:', error);
        res.status(500).json({ message: 'Failed to create supplier', error: error.message });
    }
};


const getAllFournisseurs = async (req, res) => {
    try {
        const fournisseurs = await Fournisseur.findAll();
        res.status(200).json({ fournisseurs });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch suppliers', error: error.message });
    }
};



const updateFournisseurByEmail = async (req, res) => {
    try {
      const { email } = req.params;
      const [updated] = await Fournisseur.update(req.body, {
        where: { email: email },
      });
      if (updated) {
        const updatedFournisseur = await Fournisseur.findOne({
          where: { email: email },
        });
        res.status(200).json({
          message: 'Supplier updated successfully',
          fournisseur: updatedFournisseur,
        });
      } else {
        res.status(404).json({ message: 'Supplier not found' });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Failed to update supplier',
        error: error.message,
      });
    }
  };


  const deleteFournisseurByEmail = async (req, res) => {
    try {
      const { email } = req.params;
      const deleted = await Fournisseur.destroy({ where: { email: email } });
      if (deleted) {
        res.status(200).json({ message: 'Supplier deleted successfully' });
      } else {
        res.status(404).json({ message: 'Supplier not found' });
      }
    } catch (error) {
      res.status(500).json({
        message: 'Failed to delete supplier',
        error: error.message,
      });
    }
  };

  const getFournisseurById = async (req, res) => {
    try {
        const { fournisseurId } = req.params;

        // Find the supplier by ID
        const supplier = await Fournisseur.findByPk(fournisseurId);

        // Check if the supplier exists
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // Return the supplier details
        res.status(200).json({ supplier });
    } catch (error) {
        console.error('Error fetching supplier details:', error);
        res.status(500).json({ message: 'Failed to fetch supplier details' });
    }
};

export { createFournisseur, getAllFournisseurs, updateFournisseurByEmail, deleteFournisseurByEmail , getFournisseurById };
