const mongoose = require('mongoose');
const express = require('express')
const AppError = require('../utils/AppError.js');
const catchAsync = require('../utils/catchAsync.js');
const Attraction = require('../models/attractions');
const { attractionSchema } = require('../utils/schemas.js');
const router = express.Router();
//make sure to include everything you needed to include originally in app.js for these routes

const validate = (req, res, next) => {
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

router.get("/", catchAsync(async (req, res, next) => {
    const country = req.query.country; //gets search query
    const region = req.query.region; //gets search query
    if (!region && !country) {
        const attractions = await Attraction.find({});
        res.render('attractions/index', { attractions });
        //return next(new AppError('No region nor country', 401)); //Works as intended. Goes to error handler
    }
    else if (!region) {
        console.log("No region given");
        const countries = await Attraction.find({ "country": country })
        console.log(countries);
        //res.send(countries);
        if (countries.length === 0) {
            res.render('attractions/countries/notFound', { country })
        }
        else {
            res.render('attractions/countries/index', { countries })
        }
    }
    else if (!country) {
        console.log("No country given");
        const regions = await Attraction.find({ "region": region });
        if (regions.length === 0) {
            res.render('attractions/regions/notFound', { region })
        }
        //res.send(regions);
        else {
            res.render('attractions/regions/index', { regions })
        }
    }
    else {
        const attractions = await Attraction.find({ "region": region, "country": country });
        id = `${region}, ${country}`
        console.log(id)
        if (attractions.length == 0) {
            res.render('attractions/notFound', { id });
        }
        else {
            //res.send('Attraction found');
            res.render('attractions/found', { attractions });
        }
    }
}))

router.get('/new', (req, res) => {
    res.render('attractions/new')
})

router.post('/', validate, catchAsync(async (req, res) => {
    console.log(req.body.attraction)
    const newAttraction = new Attraction(req.body.attraction);
    await newAttraction.save();
    req.flash('success', 'Successfully made a new campground!'); //used to flash
    console.log(newAttraction);
    res.redirect(`/attractions/${newAttraction._id}`);
}))

router.get('/:id', catchAsync(async (req, res) => {
    //console.log("Hello")
    const { id } = req.params;
    const attraction = await Attraction.findById(id);
    res.render('attractions/show', { attraction });
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const attraction = await Attraction.findById(req.params.id);
    res.render('attractions/edit', { attraction })
}))

router.put('/:id', validate, catchAsync(async (req, res) => {
    const { id } = req.params;
    const attraction = await Attraction.findByIdAndUpdate(id, { ...req.body.attraction })
    console.log(attraction);
    req.flash('success', 'Successfully made a new campground!'); //used to flash
    res.redirect(`/attractions/${attraction._id}`);
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const attraction = await Attraction.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!'); //used to flash
    res.redirect('/attractions');
}))

module.exports = router;