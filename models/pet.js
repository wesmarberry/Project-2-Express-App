const mongoose = require('mongoose');
const Schedule = require('./schedule')

const petSchema = new mongoose.Schema({
	name: {type: String, required: true},
	breed: {type: String, required: true},
	age: String,
	schedule:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Schedule'
	}],
	photo:{ 
		data: Buffer,
		contentType: String },
	petKind: {type: String, required:true},
	owner: String
});

const Pet = mongoose.model('Pet', petSchema)


module.exports = Pet;

//changing the age type to string until we figure out how we will store the information about 
//years or months the pet has.

// How I'm gonna link the pet with his owner when someone wants to make a proposal?
// maybe seting up a propertie ownerId when creating a new dog?
