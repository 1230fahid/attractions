const Attraction = require('../models/attractions');

module.exports.index = async (req, res, next) => {
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
}

module.exports.renderNewForm = (req, res) => {
    res.render('attractions/new')
}

module.exports.newAttraction = async (req, res) => {
    console.log("req.body.attractions is", req.body.attraction)
    console.log("req.user is", req.user)
    const newAttraction = new Attraction(req.body.attraction);
    newAttraction.author = req.user._id;
    await newAttraction.save();
    req.flash('success', 'Successfully made a new campground!'); //used to flash
    console.log(newAttraction);
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
    const attraction = await Attraction.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground!'); //used to flash
    res.redirect('/attractions');
}