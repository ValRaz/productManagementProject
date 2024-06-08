const mongodb = require("../config/dbconnect");
const { ObjectId } = require("mongodb");
const Joi = require("joi");

const productSchema = Joi.object({
  _id: Joi.string(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().positive(),
  image: Joi.string().required(),
  category: Joi.string().required(),
  stock: Joi.number().required().positive(),
  rating: Joi.number().required().min(0).max(5),
});


const productCreateSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().positive(),
  image: Joi.string().required(),
  category: Joi.string().required(),
  stock: Joi.number().required().positive(),
  rating: Joi.number().required().min(0).max(5),
});

const createProduct = async (req, res, next) => {
  const { body } = req;

  const { error } = productCreateSchema.validate(body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const newProduct = {
    name: body.name,
    description: body.description,
    price: body.price,
    image: body.image,
    category: body.category,
    stock: body.stock,
    rating: body.rating,
  };

  try {
    const collection = await mongodb.getDb().collection("products");
    const result = await collection.insertOne(newProduct);
    res.status(201).json({ message: "Product Added to Catalog", id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error Adding product" });
  }
};

const getProducts = async (req, res, next) => {
  try {
    const collection = await mongodb.getDb().collection("products");
    const products = await collection.find().toArray();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching products" });
  }
};

const getProductById = async (req, res, next) => {
  const productId = req.params.id;

  if (!ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  try {
    const collection = await mongodb.getDb().collection("products");
    const product = await collection.findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving product details" });
  }
};

const updateProduct = async (req, res, next) => {
  const productId = req.params.id;
  const { body } = req;

  delete body._id;

  const { error } = productSchema.validate(body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const collection = await mongodb.getDb().collection("products");
    const updatedProduct = await collection.findOneAndUpdate(
      { _id: new ObjectId(productId) },
      { $set: body },
      { returnDocument: "after" }
    );

    if (!updatedProduct.value) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated", updatedProduct: updatedProduct.value });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating product" });
  }
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.id;

  if (!ObjectId.isValid(productId)) {
    res.setHeader('Content-Type', 'application/json');
    return res.status(400).json({ message: "Invalid product ID format" });
  }

  try {
    const collection = await mongodb.getDb().collection("products");
    const deletedProduct = await collection.findOneAndDelete({ _id: new ObjectId(productId) });

    res.setHeader('Content-Type', 'application/json');
    if (deletedProduct.value) {
      return res.status(200).json({ message: "Product removed from catalog", deletedProduct: deletedProduct.value });
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error removing product" });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};