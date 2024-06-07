const mongodb = require("../config/dbconnect");
const { ObjectId } = require("mongodb");
const Joi = require("joi");

const userSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required()
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
    const db = mongodb.getDb();
    const collection = db.collection("users");
    await collection.insertOne(newUser);
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
    const db = mongodb.getDb();
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error logging in" });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const db = mongodb.getDb();
    const collection = db.collection("users");
    const users = await collection.find().toArray();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

const getUserById = async (req, res, next) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }

  try {
    const db = mongodb.getDb();
    const collection = db.collection("users");
    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving user details" });
  }
};

const updateUser = async (req, res, next) => {
  const userId = req.params.id;
  const { body } = req;

  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }

  const updateSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  });

  const { error } = updateSchema.validate(body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const db = mongodb.getDb();
    const collection = db.collection("users");
    const update = { $set: body };
    await collection.updateOne({ _id: new ObjectId(userId) }, update);
    res.status(200).json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Error updating user" });
  }
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: "Missing user ID" });
  }

  try {
    const db = mongodb.getDb();
    const collection = db.collection("users");
    await collection.deleteOne({ _id: new ObjectId(userId) });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
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