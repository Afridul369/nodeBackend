require("dotenv").config();
const mongoose = require("mongoose");
const DBName = require("../constants/constant");
exports.ConnectDatabase = async () => {
  try {
    const db = await mongoose.connect(`${process.env.MONGODB_URL}`);
    console.log("Database connection Sucessfully ....", db.connection.host);
  } catch (error) {
    console.log("Error from Database connection ", error);
  }
};
