const Attraction = require('../models/attractions');
const { cloudinary } = require('../cloudinary/index.js');
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const AppError = require('../utils/AppError');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }) //look at geocode more. geocode is a geocoding API
const Review = require('../models/review');

module.exports.index = async (req, res, next) => {
    const country = req.query.country; //gets search query
    const region = req.query.region; //gets search query
    let page = req.query.page;
    if(!page || page==0) {
        page=1
    }
    let ratings = []
    console.log("page is", page);
    if (!region && !country) {
        const attractions = await Attraction.find({});
        const reviews = await Review.find({});
        /*for (let j=0; j < reviews.length; j++){
            ratingObj[reviews._id]
        }*/
        for(let i = 0; i < attractions.length; i++) {
            let num = 0;
            for(let j = 0; j< attractions[i].reviews.length; j++) {
                const id = attractions[i].reviews[j]
                const review = await Review.findById(id)
                num+=review.rating
                console.log(review)
            }
            if(attractions[i].reviews.length > 0) {
                let avg = num / attractions[i].reviews.length;
                console.log("Average rating is", avg.toFixed(2));
                ratings.push(avg.toFixed(2));
            }
            else {
                ratings.push("No reviews yet")
            }
        }
        console.log("ratings is",ratings)
        if((attractions.length != 0) && (page*30 >= attractions.length+30)) {
            return next(new AppError(`Page ${page} does not exist!`, 400));
        }
        res.render('attractions/index', { attractions, page, ratings });
        //return next(new AppError('No region nor country', 401)); //Works as intended. Goes to error handler
    }
    else if (!region) {
        console.log("No region given");
        const countries = await Attraction.find({ "country": country })
        console.log(countries);
        //res.send(countries);
        for(let i = 0; i < countries.length; i++) {
            let num = 0;
            for(let j = 0; j< countries[i].reviews.length; j++) {
                const id = countries[i].reviews[j]
                const review = await Review.findById(id)
                num+=review.rating
                console.log(review)
            }
            if(countries[i].reviews.length > 0) {
                let avg = num / countries[i].reviews.length;
                console.log("Average rating is", avg.toFixed(2));
                ratings.push(avg.toFixed(2));
            }
            else {
                ratings.push("No reviews yet")
            }
        }
        
        if((countries.length != 0) && (page*30 >= countries.length+30)) {
            return next(new AppError(`Page ${page} does not exist for country: ${country}!`, 400));
        }
        if (countries.length === 0) {
            res.render('attractions/countries/notFound', { country })
        }
        else {
            res.render('attractions/countries/index', { countries, page, ratings })
        }
    }
    else if (!country) {
        console.log("No country given");
        const regions = await Attraction.find({ "region": region });
        for(let i = 0; i < regions.length; i++) {
            let num = 0;
            for(let j = 0; j< regions[i].reviews.length; j++) {
                const id = regions[i].reviews[j]
                const review = await Review.findById(id)
                num+=review.rating
                console.log(review)
            }
            if(regions[i].reviews.length > 0) {
                let avg = num / regions[i].reviews.length;
                console.log("Average rating is", avg.toFixed(2));
                ratings.push(avg.toFixed(2));
            }
            else {
                ratings.push("No reviews yet")
            }
        }
        if((regions.length != 0) && (page*30 >= regions.length+30)) {
            return next(new AppError(`Page ${page} does not exist for region: ${region}!`, 400));
        }
        if (regions.length === 0) {
            res.render('attractions/regions/notFound', { region })
        }
        //res.send(regions);
        else {
            res.render('attractions/regions/index', { regions, page, ratings })
        }
    }
    else {
        const attractions = await Attraction.find({ "region": region, "country": country });
        for(let i = 0; i < attractions.length; i++) {
            let num = 0;
            for(let j = 0; j< attractions[i].reviews.length; j++) {
                const id = attractions[i].reviews[j]
                const review = await Review.findById(id)
                num+=review.rating
                console.log(review)
            }
            if(attractions[i].reviews.length > 0) {
                let avg = num / attractions[i].reviews.length;
                console.log("Average rating is", avg.toFixed(2));
                ratings.push(avg.toFixed(2));
            }
            else {
                ratings.push("No reviews yet")
            }
        }
        id = `${region}, ${country}`
        console.log(id)
        if((attractions.length != 0) && (page*30 >= attractions.length+30)) {
            return next(new AppError(`Page ${page} does not exist for region: ${region}, country: ${country}!`, 400));
        }
        if (attractions.length == 0) {
            res.render('attractions/notFound', { id });
        }
        else {
            //res.send('Attraction found');
            res.render('attractions/found', { attractions, page, ratings });
        }
    }
}

module.exports.renderNewForm = (req, res) => {
    res.render('attractions/new')
}

module.exports.newAttraction = async (req, res) => {
    //console.log(geoData.body.features[0].geometry.coordinates); //get [longitude, latitude] coordinates
    const geoData = await geocoder.forwardGeocode({
        //query: `${req.body.attraction.region}, ${req.body.attraction.country}`,
        query: `${req.body.attraction.name}, ${req.body.attraction.country}`,
        limit: 1
    }).send()
    console.log("geoJSON is", geoData.body.features[0].geometry) //this is a geoJSON
    console.log("req.body.attraction is", req.body.attraction)
    console.log("req.user is", req.user)
    const newAttraction = new Attraction(req.body.attraction);
    newAttraction.images = req.files.map(f => ({ url: f.path, filename: f.filename })) //takes path and file name, and make a new obhect for each one and put that in an array.
    newAttraction.author = req.user._id;
    newAttraction.geometry = geoData.body.features[0].geometry;
    await newAttraction.save();
    console.log(newAttraction);
    req.flash('success', 'Successfully made a new campground!'); //used to flash
    res.redirect(`/attractions/${newAttraction._id}`);
}

module.exports.showAttraction = async (req, res) => {
    //console.log("Hello")
    const { id } = req.params;
    const attr = await Attraction.findById(id);
    //const attraction = await Attraction.findById(id);
    //const attraction = await Attraction.findById(id).populate('reviews').populate('author'); //this populates the reviews array with the review parameters for each attraction, as well as the author of each attraction
    const attraction = await Attraction.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author'); //this gives us access to user name and other info for each author of each review
    console.log(attraction)
    res.render('attractions/show', { attraction });
}

module.exports.renderEditForm = async (req, res) => {
    const attraction = await Attraction.findById(req.params.id);
    res.render('attractions/edit', { attraction })
}

module.exports.updateAttraction = async (req, res) => {
    const { id } = req.params;
    //const attraction = await Attraction.findByIdAndUpdate(id, { ...req.body.attraction }) //break this into two so you can check if current user is author. This is mainly for server side, like postman, or if you manually go to edit
    /*const attr = await Attraction.findById(id);
    if (!attr.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/attractions/${id}`)
    }*/
    const attraction = await Attraction.findByIdAndUpdate(id, { ...req.body.attraction })
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    attraction.images.push(...imgs); //take data from array and pass into push. We already have an existing array
    await attraction.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);  //deletes from cloudinary as well
        }
        await attraction.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    console.log(attraction);
    req.flash('success', 'Successfully edited campground!'); //used to flash
    res.redirect(`/attractions/${attraction._id}`);
}

module.exports.destroyAttraction = async (req, res) => {
    const { id } = req.params;
    /*const attr = await Attraction.findById(id);
    if (!attr.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that');
        return res.redirect(`/attractions/${id}`)
    }*/
    const attr = await Attraction.findById(id);

    for(let i = 0; i < attr.reviews.length; i++) {
        console.log("Attraction reviews are ", attr.reviews[i])
        await Review.findByIdAndDelete(attr.reviews[i]);
    }

    for (let img of attr.images) {
        await cloudinary.uploader.destroy(img.filename);  //deletes from cloudinary as well
    }
    const attraction = await Attraction.findByIdAndDelete(id);
    //await Attraction.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    //await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Successfully deleted campground!'); //used to flash
    res.redirect('/attractions');
}




/*
*/