// db/connect.js
import mongoose from "mongoose";
// const mongoose = require("mongoose");

// const connectDB = (url) => {
//   return mongoose.connect(url, {
//     useNewUrlParser: true,
//     // useCreateIndex: true,
//     // useFindAndModify: false,
//     useUnifiedTopology: true,
//   });
// };

const connectDB = async (url) => {
  try {
    await mongoose.connect(url);
    console.log("MongoDB connected...");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDB;
