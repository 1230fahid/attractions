const Attraction = require('../models/attractions');
const Review = require('../models/review');

module.exports.index = async (req, res) => {
    const attraction = await Attraction.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id; // storing author
    await review.save();
    attraction.reviews.push(review);
    await attraction.save();
    req.flash('success', 'Review Submitted!')
    res.redirect(`/attractions/${attraction._id}`);
}

module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Attraction.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/attractions/${id}`);
}