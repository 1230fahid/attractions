const express = require('express');
const router = express.Router({ mergeParams: true }); //any params passed in app.use(.., reviews) can be used here now
const catchAsync = require('../utils/catchAsync.js');
const Attraction = require('../models/attractions');
const Review = require('../models/review');
const AppError = require('../utils/AppError');
const { reviewSchema } = require('../utils/schemas');
const methodOverride = require('method-override');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, 400)
    }
    else {
        next();
    }
}


router.post('/', validateReview, catchAsync(async (req, res) => {
    const attraction = await Attraction.findById(req.params.id);
    const review = new Review(req.body.review);
    await review.save();
    attraction.reviews.push(review);
    await attraction.save();
    req.flash('success', 'Review Submitted!')
    res.redirect(`/attractions/${attraction._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Attraction.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/attractions/${id}`);
}))

module.exports = router;