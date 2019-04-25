const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
	text: String,
	rating: Number,
	userReviewing: String,
	userReviewed: String

});

const Review = mongoose.model('Review', reviewSchema)


module.exports = Review;