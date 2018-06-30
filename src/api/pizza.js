'use strict';

import mongoose from 'mongoose';

const pizzaSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true},
  style: {type: String, required: true},
  toppings: {type: String, required: true},
  userID: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
});

module.exports = mongoose.model('Pizza', pizzaSchema);