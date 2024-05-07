import expressAsyncHandler from "express-async-handler";
import { Chapitre,Article ,Produit ,ProduitsArticle } from "../models/productsModel.js";

const addChapter = async(req,res) => {
    const {id} = req.params;
    const {name,description,code} = req.body;
try{
    const chapter = await Chapitre.create({name,description,id_agentserviceachat:id,code});
    return res.status(200).json(chapter) ;
} catch (error) {
    res.status(500).json({message : "failed to add chapter " ,error : error.message})
}
};

const updateChapitre = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description,code} = req.body;

        // Find the chapitre to update by its ID
        const chapitre = await Chapitre.findByPk(id);
        console.log(chapitre);

        if (!chapitre) {
            return res.status(404).json({ message: 'Chapitre not found' });
        }

        // Update the chapitre with new data
        await chapitre.update({
            name: name || chapitre.name,
            description: description || chapitre.description,
            code: code || chapitre.code
        });

        res.status(200).json({ message: 'Chapitre updated successfully', chapitre });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update Chapitre', error: error.message });
    }
};

const addArticle = async(req,res)=> {
    try {
        const {chapterId} = req.params;
        const {name,description,tva} = req.body;

        const article = await Article.create({chapter_id:chapterId,name,description,tva})

        res.status(200).json(article)
    } catch (error) {
        res.status(500).json({message : 'failed to add article' , error : error.message})
    }
};

const updateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, tva } = req.body;

        // Find the article to update by its ID
        const article = await Article.findByPk(id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Update the article with new data
        await article.update({
            name: name || article.name, // Keep the existing name if not provided
            description: description || article.description, // Keep the existing description if not provided
            tva: tva || article.tva // Keep the existing tva if not provided
        });

        res.status(200).json({ message: 'Article updated successfully', article });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update Article', error: error.message });
    }
};



// const addProduct = async (req, res) => {
//     try {
//         const { articleId } = req.params;
//         const { name, caracteristics, quantity, seuil } = req.body;

//         // Create the product
//         const product = await Produit.create({ name, caracteristics, quantity, seuil });

//         // Add an entry in the produitsarticle table
//         await ProduitsArticle.create({ id_produit: product.id, id_article: articleId });

//         res.status(200).json(product);
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to add product', error: error.message });
//     }
// };
const addProduct = async (req, res) => {
    try {
      
        const { name, caracteristics, quantity, seuil } = req.body;
        const product = await Produit.create({ name, caracteristics, quantity, seuil });


        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add product', error: error.message });
    }
};


const addProductByartcileId = async (req, res) => {
    try {
        const { articleId } = req.params;
        const { productId  } = req.body; // name, caracteristics, quantity, seuil, 

        // Add an entry in the produitsarticle table
        await ProduitsArticle.create({ id_produit: productId, id_article: articleId });

        // res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add product', error: error.message });
    }
};






// const updateProduct = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, caracteristics } = req.body;

//         // Find the product to update by its ID
//         const product = await Produit.findByPk(id);

//         if (!product) {
//             return res.status(404).json({ message: 'Product not found' });
//         }

//         // Update the product with new data
//         await product.update({
//             name: name || product.name, // Keep the existing name if not provided
//             caracteristics: caracteristics || product.caracteristics // Keep the existing caracteristics if not provided
//         });

//         res.status(200).json({ message: 'Product updated successfully', product });
//     } catch (error) {
//         res.status(500).json({ message: 'Failed to update Product', error: error.message });
//     }
// };


const getAllchapters = async (req, res) => {
    try {
      // Find all structures
      const chapters = await Chapitre.findAll();
  
      // Return the list of structures
      return res.status(200).json({ chapters });
    } catch (error) {
      return res.status(500).json({ message: "Error getting structures", error: error.message });
    }
  };

  const getAllArticles = async (req, res) => {
    try {
      // Find all structures
      const articles = await Article.findAll();
  
      // Return the list of structures
      return res.status(200).json({ articles });
    } catch (error) {
      return res.status(500).json({ message: "Error getting structures", error: error.message });
    }
  };

  const getAllProducts = async (req, res) => {
    try {
      // Find all structures
      const products = await Produit.findAll();
  
      // Return the list of structures
      return res.status(200).json({ products });
    } catch (error) {
      return res.status(500).json({ message: "Error getting structures", error: error.message });
    }
  };

  const getChapterArticles = async (req, res) => {
    try {
        const { chapterId } = req.params; // Extract chapterId from request parameters

        // Find all articles with the specified chapter ID
        const articles = await Article.findAll({ where: { chapter_id: chapterId } });

        res.status(200).json(articles); // Return the articles
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve chapter articles', error: error.message });
    }
};


const getArticleProducts = async (req, res) => {
    try {
        const { articleId } = req.params; // Extract articleId from request parameters

        // Find all product IDs associated with the specified articleId
        const productIdsData = await ProduitsArticle.findAll({ 
            where: { id_article: articleId }, 
            attributes: ['id_produit'] 
        });
        
        // Extract product IDs from the result
        const productIds = productIdsData.map(data => data.id_produit);

        // Find all products associated with the retrieved product IDs
        const products = await Produit.findAll({ 
            where: { id: productIds } 
        });

        res.status(200).json(products); // Return the products
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve article products', error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { productId } = req.params; // Extract productId from request parameters

        // Find the product by ID
        const product = await Produit.findByPk(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Remove the product association from produitsarticle table
        await ProduitsArticle.destroy({ where: { id_produit: productId } });

        // Delete the product
        await product.destroy();

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product', error: error.message });
    }
};


const deleteArticleIfEmpty = async (req, res) => {
    try {
        const { articleId } = req.params; // Extract articleId from request parameters

        // Find the article by ID
        const article = await Article.findByPk(articleId);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        // Check if the article has any associated products
        const productsCount = await ProduitsArticle.count({ where: { id_article: articleId } });

        if (productsCount > 0) {
            return res.status(400).json({ message: 'Cannot delete article because it contains products' });
        }

        // Delete the article
        await article.destroy();

        res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete article', error: error.message });
    }
};
const deleteChapterIfEmpty = async (req, res) => {
    try {
        const { chapterId } = req.params; // Extract chapterId from request parameters

        // Find the chapter by ID
        const chapter = await Chapitre.findByPk(chapterId);

        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        // Check if the chapter has any associated articles
        const articlesCount = await Article.count({ where: { chapter_id: chapterId } });

        if (articlesCount > 0) {
            return res.status(400).json({ message: 'Cannot delete chapter because it contains articles' });
        }

        // Delete the chapter
        await chapter.destroy();

        res.status(200).json({ message: 'Chapter deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete chapter', error: error.message });
    }
};

const getChapterInfo = async (req, res) => {
    try {
        const { chapterId } = req.params;

        // Fetch the chapter information from the database
        const chapter = await Chapitre.findByPk(chapterId);

        if (!chapter) {
            return res.status(404).json({ message: 'Chapter not found' });
        }

        // Return the chapter's information
        res.status(200).json({ chapter });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch chapter information', error: error.message });
    }
};

const getArticleInfo = async (req, res) => {
    try {
        const { articleId } = req.params;

        // Fetch the chapter information from the database
        const article = await Article.findByPk(articleId);

        if (!article) {
            return res.status(404).json({ message: 'article not found' });
        }

        // Return the chapter's information
        res.status(200).json({ article });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch article information', error: error.message });
    }
};


const getProductInfo = async (req, res) => {
    try {
        const { productId } = req.params;

        // Fetch the chapter information from the database
        const product = await Produit.findByPk(productId);

        if (!product) {
            return res.status(404).json({ message: 'product not found' });
        }

        // Return the chapter's information
        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch product information', error: error.message });
    }
};




export {addChapter , addArticle , addProduct,getAllArticles,getAllProducts,getAllchapters , getChapterArticles , getArticleProducts,deleteProduct,deleteArticleIfEmpty,deleteChapterIfEmpty ,updateChapitre,updateArticle,getChapterInfo,getArticleInfo,getProductInfo,addProductByartcileId}