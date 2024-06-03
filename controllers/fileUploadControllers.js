import { User } from "../models/usersModel.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Get the directory name using process.cwd()
const currentDir = process.cwd();

// Define storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const destinationDir = path.join(currentDir, 'uploads', 'profilePics'); // Define the destination directory path
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

const uploadProfilePic = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findOne({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }

        // Upload the bonlivraison file using multer middleware
        upload.single('profilepic')(req, res, async function (err) {
            if (err) {
                return res.status(400).json({ message: 'Failed to upload profile pic', error: err.message });
            }

            // File uploaded successfully, retrieve the file path
            const filePath = req.file.path;

            // Update the bonreception record with the file path
            await User.update({ profile_pic: filePath }, { where: { id: userId } });

            return res.status(200).json({ message: 'Profile Pic uploaded successfully', filePath });
        });
    } catch (error) {
        console.error('Failed to upload Bon livraison:', error);
        return res.status(500).json({ message: 'Failed to upload Bon livraison', error: error.message });
    }
};

export default uploadProfilePic;
