const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const app = express();
const methodOverride = require('method-override');
const Attraction = require('./models/attractions');
const res = require('express/lib/response');
const engine = require('ejs-mate');
const morgan = require('morgan');
const AppError = require('./utils/AppError.js');
const catchAsync = require('./utils/catchAsync.js');
const { attractionSchema } = require('./utils/schemas.js');
const attractions = require('./routes/attractions.js');

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
app.use('/attractions', attractions);
app.use(express.static(path.join(__dirname, 'public'))) //used to mention the public directory from which I am serving the static files, such as index.css
//allows you to use static files(css files, js files, etc.)


app.get("/", (req, res) => { //placeholder home
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