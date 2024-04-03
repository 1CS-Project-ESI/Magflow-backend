import expressAsyncHandler from "express-async-handler";
import { Chapitre,Article ,Produit  } from "../models/productsModel.js";

const addChapter = async(req,res) => {
    const {id} = req.params;
    const {name,description} = req.body;
try{
    const chapter = await Chapitre.create({name,description,id_agentserviceachat:id});
    return res.status(200).json(chapter) ;
} catch (error) {
    res.status(500).json({message : "failed to add chapter " ,error : error.message})
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

const addProduct = async(req,res)=> {
    try {
        const {articleId} = req.params;
        const {name,price,caracteristics} = req.body;

        const product = await Produit.create({article_id:articleId,name,price,caracteristics})

        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({message : 'failed to add product' , error : error.message})
    }
};


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
        const { articleId } = req.params; // Extract chapterId from request parameters

        // Find all articles with the specified chapter ID
        const products = await Produit.findAll({ where: { article_id: articleId } });

        res.status(200).json(products); // Return the articles
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve chapter articles', error: error.message });
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
        const productsCount = await Produit.count({ where: { article_id: articleId } });

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



export {addChapter , addArticle , addProduct,getAllArticles,getAllProducts,getAllchapters , getChapterArticles , getArticleProducts,deleteProduct,deleteArticleIfEmpty,deleteChapterIfEmpty}