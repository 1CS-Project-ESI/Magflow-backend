import { Chapter,Article ,Product  } from "../models/productsModel.js";

const addChapter = async(req,res) => {
    const name = req.body;
try{
    const chapter = await Chapter.create({name});
    return res.status(200).json(chapter) ;
} catch (error) {
    res.status(500).json({message : "failed to add chapter " ,error : error.message})
}
};

const addArticle = async(req,res)=> {
    try {
        const chapterId = req.params;
        const name = req.body;

        const article = await Article.create({chapterId,name})

        res.status(200).json(article)
    } catch (error) {
        res.status(500).json({message : 'failed to add article' , error : error.message})
    }
};

const addProduct = async(req,res)=> {
    try {
        const articleId = req.params;
        const {name,price} = req.body;

        const product = await Product.create({articleId,name,price})

        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({message : 'failed to add product' , error : error.message})
    }
};



export {addChapter , addArticle , addProduct}