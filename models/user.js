const mongoose = require('mongoose');
const Pet = require('./pet')

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  name: String,
  email: String,
  phone: String,
  zipcode: Number,
<<<<<<< HEAD
  photo: {type: String, required: true},
=======
  photo: {type: String},
>>>>>>> user-routes
  pets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet'
  }],
  reviews: [{
  	type: mongoose.Schema.Types.ObjectId,
  	ref: 'Review'
  }]

});

module.exports = mongoose.model('User', userSchema);