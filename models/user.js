const mongoose = require('mongoose');
const Pet = require('./pet')
const Review = require('./review')

const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String},
  name: String,
  email: String,
  phone: String,
  zipcode: Number,
  lat: Number,
  lng: Number,
  photo:{ 
    data: Buffer,
    contentType: String },
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




// make the e-mail require and unique