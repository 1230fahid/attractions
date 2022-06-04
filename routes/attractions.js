const mongoose = require('mongoose');
const express = require('express')
const AppError = require('../utils/AppError.js');
const catchAsync = require('../utils/catchAsync.js');
const Attraction = require('../models/attractions');
const { attractionSchema } = require('../utils/schemas.js');
const router = express.Router();
const { isLoggedIn, isAuthor } = require('../middleware.js');
//make sure to include everything you needed to include originally in app.js for these routes

const { storage } = require('../cloudinary'); //node automatically looks for an index.js in a folder, if no specific file in a folder is given

const { validateAttraction } = require('../middleware')
const multer = require('multer');
//const upload = multer({ dest: 'uploads/' })
const upload = multer({ storage }) //change new upload to storage

const attractions = require('../controllers/attractions');

router.route('/')
    .get(catchAsync(attractions.index))
    .post(isLoggedIn, upload.array('images'), validateAttraction, catchAsync(attractions.newAttraction))
/*.post(upload.single('image'), (req, res) => { //'image' is the input name. must match the name of an input
    console.log(req.body, req.file);
    res.send("IT WORKED!");
})*/

//can do upload.array for multiple images

router.get('/new', isLoggedIn, attractions.renderNewForm)

router.route('/:id')
    .get(isLoggedIn, catchAsync(attractions.showAttraction))
    .put(isLoggedIn, isAuthor, upload.array('images'), validateAttraction, catchAsync(attractions.updateAttraction))
    .delete(isAuthor, catchAsync(attractions.destroyAttraction))

//router.get("/", catchAsync(attractions.index));


//router.post('/', isLoggedIn, validateAttraction, catchAsync(attractions.newAttraction))

//router.get('/:id', isLoggedIn, catchAsync(attractions.showAttraction))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(attractions.renderEditForm))

//router.put('/:id', isLoggedIn, isAuthor, validateAttraction, catchAsync(attractions.updateAttraction))

//router.delete('/:id', isAuthor, catchAsync(attractions.destroyAttraction))

module.exports = router;