import { Admin,User } from "../models/usersModel.js";

const isAdmin = async (req, res, next) => {
    try {
        // Check if the user object is attached to the request
        const currentUser = req.user;
        console.log(currentUser); // Change 'user' to 'currentUser'
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized. User not authenticated." });
        }
        

        // Retrieve the user ID from the authenticated user object
        const userId = req.user.id;                                                                                                                                                                                                                                      

        // Query the database to check if the user is an admin
        const isAdminUser = await Admin.findOne({ where: { user_id: userId } });

        // If the user is not an admin, return a 403 Forbidden response
        if (!isAdminUser) {
            return res.status(403).json({ message: "Access denied. You are not authorized to access this resource." });
        }

        // If the user is an admin, proceed to the next middleware/route handler
        next();
    } catch (error) {
        // Handle any errors that occur during the process
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Export the isAdmin middleware for use in routes
export { isAdmin };
