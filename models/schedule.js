const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
	date: String,
	time: String,
	proposerId: String,
	petOwnerId: String,
	proposerUsername: String,
	pet: String,
	booked: {type: Boolean, default: false}

});

const Schedule = mongoose.model('Schedule', scheduleSchema)


module.exports = Schedule;