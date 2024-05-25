const mongodb = require('../config/dbconnect');
const { ObjectId } = require('mongodb');

const createProduct = async (req, res, next) => {
  const { name, description, price, image, category, stock, rating } = req.body;

  if (!name || !description || !price || !image || !category || !stock || !rating) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newProduct = {
    name,
    description,
    price,
    image,
    category,
    stock,
    rating,
  };

  try {
    const collection = await mongodb.getDb().collection('products');
    const result = await collection.insertOne(newProduct);
    res.status(201).json({ message: 'Product Added to Catalog', id: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error Adding product' });
  }
};

const getProducts = async (req, res, next) => {
  try {
    const collection = await mongodb.getDb().collection('products');
    const products = await collection.find().toArray();
    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching products' });
  }
};

const getProductById = async (req, res, next) => {
  const productId = req.params.id;

  if (!ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product ID format' });
  }

  try {
    const collection = await mongodb.getDb().collection('products');
    
    const product = await collection.findOne({ _id: new ObjectId(productId) });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving product details' });
  }
};

const updateProduct = async (req, res, next) => {
  const productId = req.params.id;
  const { name, description, price, image, category, stock, rating } = req.body;

  if (!ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product ID format' });
  }

  try {
    const collection = await mongodb.getDb().collection('products');
    const updatedProduct = await collection.findOneAndUpdate(
      { _id: new ObjectId(productId) },
      { $set: { name, description, price, image, category, stock, rating } },
      { returnDocument: 'after' }
    );

    if (!updatedProduct.value) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product updated', updatedProduct: updatedProduct.value });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating product' });
  }
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.id;

  if (!ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product ID format' });
  }

  try {
    const collection = await mongodb.getDb().collection('products');
    const deletedProduct = await collection.findOneAndDelete({ _id: new ObjectId(productId) });

    if (!deletedProduct.value) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product removed from catalog', deletedProduct: deletedProduct.value });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error removing product' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};