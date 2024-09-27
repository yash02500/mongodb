
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  duration: Number,
  price: Number
});

module.exports = mongoose.model('Service', productSchema);

