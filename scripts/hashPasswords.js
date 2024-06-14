const mongodb = require("../config/dbconnect");
const bcrypt = require("bcrypt");

const saltRounds = 10;

const hashPasswords = async () => {
  try {
    // Initialize the database connection
    await new Promise((resolve, reject) => {
      mongodb.initDb((err, db) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      });
    });

    // Get the database
    const db = mongodb.getDb();
    const collection = db.collection("users");

    // Retrieve all users
    const users = await collection.find().toArray();

    // Loop through each user and hash their password if it's not hashed already
    for (let user of users) {
      // Check if the password is already hashed (assuming a hashed password is 60 characters long)
      if (user.password.length !== 60) {
        const hashedPassword = await bcrypt.hash(user.password, saltRounds);

        // Update the user record with the hashed password
        await collection.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );

        console.log(`Password for user ${user.email} has been hashed.`);
      } else {
        console.log(`Password for user ${user.email} is already hashed.`);
      }
    }

    console.log("All passwords have been processed.");
  } catch (error) {
    console.error("Error hashing passwords:", error);
  }
};

hashPasswords();