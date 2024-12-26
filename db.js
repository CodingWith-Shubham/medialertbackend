// db.js
const mongoose = require('mongoose');
require('dotenv').config();
console.log('Mongo URI:', process.env.MONGO_URI); 
async function connectToMongo() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
  }
}
// 
module.exports = connectToMongo;