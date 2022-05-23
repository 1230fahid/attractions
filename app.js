const mongoose = require('mongoose')
const express = require('express')
const path = require('path')
const app = express();
const methodOverride = require('method-override');
const Attraction = require('./models/attractions');
const res = require('express/lib/response');
const engine = require('ejs-mate');
const morgan = require('morgan');
const AppError = require('./Errors/AppError');

const { nextTick } = require('process');
app.use(morgan('tiny'));

mongoose.connect('mongodb://localhost:27017/worldAttractions', {}) //set up connection to mongo (still need mongod on powershell). movieApp is an example
    .then(() => {
        console.log("CONNECTION OPEN!!!!");
    })
    .catch((err) => {
        console.log("OH NO ERROR!!!!");
        console.log(err);
    })

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database connected");
});



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.engine('ejs', engine);

app.get("/attractions", async (req, res) => {
    const attractions = await Attraction.find({});
    res.render('attractions/index', { attractions });
})

app.get('/attractions/new', async (req, res) => {
    res.render('attractions/new')
})

app.post('/attractions', async (req, res) => {
    console.log(req.body.attraction)
    const newAttraction = new Attraction(req.body.attraction);
    await newAttraction.save();
    console.log(newAttraction);
    res.redirect('/attractions');
})

app.get('/attractions/country', async (req, res, next) => {
    const country = req.query.country; //gets search query
    const region = req.query.region; //gets search query
    if (!region && !country) {
        //next();
        //throw new AppError('Wee', 401)
        //console.log("Hello")
        res.redirect('/attractions')
    }
    else if (!region) {
        console.log("No region given");
        const countries = await Attraction.find({ "country": country })
        console.log(countries);
        //res.send(countries);
        if (countries.length === 0) {
            res.render('attractions/countries/notFound', { country })
        }
        res.render('attractions/countries/index', { countries })
    }
    else if (!country) {
        console.log("No country given");
        const regions = await Attraction.find({ "region": region });
        if (regions.length === 0) {
            res.render('attractions/regions/notFound', { region })
        }
        //res.send(regions);
        res.render('attractions/regions/index', { regions })
    }
})

app.get('/attractions/:id', async (req, res) => {
    //console.log("Hello")
    const { id } = req.params;
    const attraction = await Attraction.findById(id);
    res.render('attractions/show', { attraction });
})

app.get('/attractions/:id/edit', async (req, res) => {
    const attraction = await Attraction.findById(req.params.id);
    res.render('attractions/edit', { attraction })
})

app.put('/attractions/:id', async (req, res) => {
    const { id } = req.params;
    const attraction = await Attraction.findByIdAndUpdate(id, { ...req.body.attraction })
    console.log(attraction);
    res.redirect(`/attractions/${attraction._id}`);
})

app.delete('/attractions/:id', async (req, res) => {
    const { id } = req.params;
    const attraction = await Attraction.findByIdAndDelete(id);
    res.redirect('/attractions');
})

app.use('/:id', (req, res) => {
    const { id } = req.params;
    console.log("ID is", id);
    res.render('attractions/notFound', { id });
    //res.status(404).send('NOT FOUND!'); // can send 404 if request is not found, by using this at end of file
})


app.use((err, req, res, next) => {
    const { message = 'Something Went Wrong', status = 500 } = err; //destructuring and setting defaults
    console.log("Hello")
    console.log(message)
    res.status(status).send(message)
    //res.send(message)
})

app.listen(3000, () => {
    console.log("Listening on server port 3000");
})