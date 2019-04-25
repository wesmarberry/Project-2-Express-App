const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
	name: {type: String, required: true},
	breed: {type: String, required: true},
	age: String,
	schedule:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Schedule'
	},
	photo:{type:String, required:true},
	petKind: {type: String, required:true}
});

const Pet = mongoose.model('Pet', petSchema)


module.exports = Pet;

//changing the age type to string until we figure out how we will store the information about 
//years or months the pet has.
