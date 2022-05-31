const express = require('express');
const router = express.Router({ mergeParams: true }); //any params passed in app.use(.., reviews) can be used here now
const catchAsync = require('../utils/catchAsync.js');
const Attraction = require('../models/attractions');
const Review = require('../models/review');
const AppError = require('../utils/AppError');
const { reviewSchema } = require('../utils/schemas');
const methodOverride = require('method-override');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware')
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.index));

router.delete('/:reviewId', catchAsync(reviews.destroyReview))

module.exports = router;