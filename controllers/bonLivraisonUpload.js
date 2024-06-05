import {BonReception} from "../models/bonsModel.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Get the directory name using process.cwd()
const currentDir = process.cwd();

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationDir = path.join(currentDir, 'uploads', 'BonsLivraisons'); // Define the destination directory path
        if (!fs.existsSync(destinationDir)) {
            fs.mkdirSync(destinationDir, { recursive: true });
        }
        cb(null, destinationDir); // Define the destination directory for storing uploaded files
    },
    filename: function (req, file, cb) {
        // Define the filename for the uploaded file
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Create multer instance with the defined storage
const upload = multer({ storage });

const uploadBonLivraison = async (req, res) => {
    try {
        const { bonReceptionId } = req.params;

        const user = await BonReception.findOne({
            where: { id: bonReceptionId }
        });

        if (!user) {
            return res.status(404).json({ message: 'reception not found' });
        }

        // Upload the bonlivraison file using multer middleware
        upload.single('bonlivraison')(req, res, async function (err) {
            if (err) {
                return res.status(400).json({ message: 'Failed to upload bon livraison', error: err.message });
            }

            // File uploaded successfully, retrieve the file path
            const filePath = req.file.path;

            // Update the bonreception record with the file path
            await BonReception.update({ bonlivraison_path: filePath }, { where: { id: bonReceptionId } });

            return res.status(200).json({ message: 'bon livraison uploaded successfully', filePath });
        });
    } catch (error) {
        console.error('Failed to upload Bon livraison:', error);
        return res.status(500).json({ message: 'Failed to upload Bon livraison', error: error.message });
    }
};

export default uploadBonLivraison;
