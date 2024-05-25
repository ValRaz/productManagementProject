const mongodb = require('../config/dbconnect');
const { ObjectId } = require('mongodb');

const registerUser = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const newUser = { name, email, password };

  try {
    const client = await mongodb.connect();
    const db = client.db('yourDatabaseName');
    const collection = db.collection('users');

    await collection.insertOne(newUser);

    client.close();

    res.status(201).json({ message: 'New User Added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user' });
  }
};

const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const client = await mongodb.connect();
    const db = client.db('yourDatabaseName');
    const collection = db.collection('users');

    const user = await collection.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.password === password) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }

    client.close();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error logging in' });
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const client = await mongodb.connect();
    const db = client.db('yourDatabaseName');
    const collection = db.collection('users');

    const users = await collection.find().toArray();

    client.close();

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

const getUserById = async (req, res, next) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: 'Missing user ID' });
  }

  try {
    const client = await mongodb.connect();
    const db = client.db('yourDatabaseName');
    const collection = db.collection('users');

    const user = await collection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    client.close();

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user details' });
  }
};

const updateUser = async (req, res, next) => {
  const userId = req.params.id;
  const { name, email, password } = req.body;

  const updatedUser = {};
  if (name) {
    updatedUser.name = name;
  }
  if (email) {
    updatedUser.email = email;
  }
  if (password) {
    updatedUser.password = password;
  }

  if (!Object.keys(updatedUser).length) {
    return res.status(400).json({ message: 'No updates provided' });
  }

  try {
    const client = await mongodb.connect();
    const db = client.db('yourDatabaseName');
    const collection = db.collection('users');

    const updatedUserDoc = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updatedUser },
      { returnDocument: 'after' }
    );
    if (!updatedUserDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    client.close();

    res.status(200).json({ message: 'User Updated', updatedUser: updatedUserDoc });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user' });
  }
};

const deleteUser = async (req, res, next) => {
  const userId = req.params.id;

  if (!userId) {
    return res.status(400).json({ message: 'Missing user ID' });
  }

  try {
    const client = await mongodb.connect();
    const db = client.db('yourDatabaseName');
    const collection = db.collection('users');

    const deletedUser = await collection.findOneAndDelete({ _id: new ObjectId(userId) });
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    client.close();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting user' });
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