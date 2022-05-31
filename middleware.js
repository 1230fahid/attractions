const AppError = require('./utils/AppError.js');
const Attraction = require('./models/attractions');
const Review = require('./models/review');
const { attractionSchema, reviewSchema } = require('./utils/schemas');


module.exports.isLoggedIn = (req, res, next) => { //log in middleware
    console.log("REQ.USER...", req.user);
    if (!req.isAuthenticated()) {
        console.log(req.path, req.originalUrl) //print path, and the original Url
        req.session.returnTo = req.originalUrl; //store the URL they are requesting, by adding the originalUrl to a new parameter 'returnTo'!
        console.log('req.session.returnTo in isLoggedIn is', req.session.returnTo);
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    else {
        next();
    }
    //next();
}

module.exports.isAuthor = async (req, res, next) => { //middleware to check if current user is author
    const { id } = req.params;
    const attraction = await Attraction.findById(id);
    if (!attraction.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/attractions/${id}`);
    }
    else {
        next();
    }
}
//req.user tells us info about the user.

module.exports.validateAttraction = (req, res, next) => {
    console.log("req.body is", req.body)
    const { error } = attractionSchema.validate(req.body);
    console.log("Error is", error)
    if (error) {
        const msg = error.details.map(el => el.message).join(',') //this gets all of the errors, if there are multiple or not, then gets the error message of each and joins them together, separated by a comma for each
        throw new AppError(msg, 400) //throw error so it goes to next error handler
    }
    else {
        next(); //if no session error, go to next middleware
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new AppError(msg, 400)
    }
    else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => { //middleware to check if current user for review is author. //not including, just here as an example of what i could do
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/attractions/${id}`);
    }
    else {
        next();
    }
}