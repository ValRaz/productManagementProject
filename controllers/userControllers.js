const mongodb = require("../config/dbconnect");
const { ObjectId } = require("mongodb");
const Joi = require("joi");

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const registerUser = async (req, res, next) => {
  const { body } = req;

  const { error } = userSchema.validate(body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const newUser = {
    name: body.name,
    email: body.email,
    password: body.password,
  };

  try {
    const client = await mongodb.connect();
    const db = client.db("yourDatabaseName");
    const collection = db.collection("users");

    await collection.insertOne(newUser);

    client.close();

    res.status(201).json({ message: "New User Added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating user" });
  }
};

const loginUser = async (req, res, next) => {
  const { body } = req;

  const { error } = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }).validate(body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const client = await mongodb.connect();
    const db = client.db("yourDatabaseName");
    const collection = db.collection("users");

    const user = await collection.findOne({ email: body.email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.password === body.password) {
      res.status(200).json({ message: "Login successful" });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }

    client.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const client = await mongodb.connect();
    const db = client.db("yourDatabaseName");
    const collection = db.collection("users");

    const users = await collection.find().toArray();

    client.close();

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

const getUserById = async (req, res, next) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }

  try {
    const client = await mongodb.connect(); 
    const db = client.db("yourDatabaseName");
    const collection = db.collection("users"); 

    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: "User not found" }); 
    }

    client.close();

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving user details" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};