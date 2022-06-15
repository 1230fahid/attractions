if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}
console.log(process.env.CLOUDINARY_SECRET);
console.log(process.env.CLOUDINARY_KEY);



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
const { attractionSchema } = require('./utils/schemas.js');
const attractions = require('./routes/attractions.js');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const Review = require('./models/review');
const reviews = require('./routes/reviews');

const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');

const MongoStore = require("connect-mongo");

app.use(flash());
app.use(morgan('tiny'));


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com/jquery-3.3.1.slim.min.js",
    "https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css",
    "https://fonts.gstatic.com",
    "https://fonts.googleapis.com/css2?family=Fira+Sans:wght@500&family=Nuosu+SIL&family=Radio+Canada:wght@300&display=swap",
    "https://fonts.googleapis.com/css2?family=Fira+Sans:wght@500&family=Nuosu+SIL&family=Open+Sans:wght@700&family=Radio+Canada:wght@300&display=swap",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dxbaj75pt/",
                "https://images.unsplash.com/",
                "https://a.cdn-hotels.com/gdcs/production29/d372/b70fa24d-b7b9-491a-a67a-8da0857b80a2.jpg",
                'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/bojnice-castle-1603142898.jpg',
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const dbURL = process.env.DB_URL;
//'mongodb://localhost:27017/worldAttractions'
mongoose.connect(dbURL, {})
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
app.use(express.static(path.join(__dirname, 'public'))) 

app.use(mongoSanitize());
const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

const store = MongoStore.create({
    mongoUrl: dbURL,
    crypto: {
        secret,
    },
    touchAfter: 24 * 3600
})

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: { //properties for the cookie
        httpOnly: true, //http only is an additional flag included in a set-cookie http response header. added for security. our cookies are only accessible through http
        //secure: true, //makes it so that cookie is only accessible or changeable through https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //expires a week from now // used for logging in
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session()); //make sure session is used before passport.session
passport.use(new LocalStrategy(User.authenticate())); //authenticate() generates a function that is used in Passport's Local Strategy

passport.serializeUser(User.serializeUser()) //generates a function that is used by passport to serialize users into the session. Refers to how we store a user in the session
passport.deserializeUser(User.deserializeUser())//generates a function that is used by Passport to deserialize users into the session. How do you get user out of session?

//used for storing a flash to a local key 
app.use((req, res, next) => {
    //if (!['/login', '/'].includes(req.originalUrl)) {
    //    req.session.returnTo = req.originalUrl;
    //}
    //console.log(req.session)
    res.locals.currentUser = req.user; //gets user info on every route, so long as there is a user
    res.locals.success = req.flash('success'); //on every single route we're going to take whatever is in the flash under success and have access to it in our locals under the key success
    res.locals.error = req.flash('error');
    next();
})

app.use('/fakeUser', async (req, res) => {
    const user = new User({ email: 'fahid@gmail.com', username: 'fahid' });
    const newUser = await User.register(user, 'chicken') //takes in instance of user model, and password. this registers a user
    res.send(newUser);
})

app.use('/', userRoutes);
app.use('/attractions', attractions);
app.use('/attractions/:id/reviews', reviews);
app.get("/", (req, res) => { //placeholder home
    res.render('home.ejs');
})
/*app.get('/logout', catchAsync(async (req, res, next) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
    });
    req.flash('success', 'Welcome Back')
    console.log("Hello")
    req.flash("success", "Goodbye")
    req.flash("error", 'Error')
    res.redirect('/attractions');
}))*/
app.use('/:id', (req, res) => {
    const { id } = req.params;
    console.log("ID is", id);
    res.render('attractions/notFound', { id });
    //res.status(404).send('NOT FOUND!'); // can send 404 if request is not found, by using this at end of file
})

//error handler
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    req.flash('error', 'Could not find attraction');
    res.status(statusCode).render('attractions/error', { err })
})

app.listen(3000, () => {
    console.log("Listening on server port 3000");
})