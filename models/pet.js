const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
	name: {type: String, required: true},
	breed: {type: String, required: true},
	age: Number,
	schedule:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Schedule'
	},
	photo:{type:String, required:true},
	petKind: {type: String, required:true}
});

const Pet = mongoose.model('Pet', petSchema)


module.exports = Pet;
