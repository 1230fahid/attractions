const mongoose = require('mongoose');
const express = require('express')
const AppError = require('../utils/AppError.js');
const catchAsync = require('../utils/catchAsync.js');
const Attraction = require('../models/attractions');
const { attractionSchema } = require('../utils/schemas.js');
const router = express.Router();
const { isLoggedIn, isAuthor } = require('../middleware.js');
//make sure to include everything you needed to include originally in app.js for these routes

const { validateAttraction } = require('../middleware')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

const attractions = require('../controllers/attractions');

router.route('/')
    .get(catchAsync(attractions.index))
    .post(isLoggedIn, validateAttraction, catchAsync(attractions.newAttraction))

router.get('/new', isLoggedIn, attractions.renderNewForm)

router.route('/:id')
    .get(isLoggedIn, catchAsync(attractions.showAttraction))
    .put(isLoggedIn, isAuthor, validateAttraction, catchAsync(attractions.updateAttraction))
    .delete(isAuthor, catchAsync(attractions.destroyAttraction))

//router.get("/", catchAsync(attractions.index));


//router.post('/', isLoggedIn, validateAttraction, catchAsync(attractions.newAttraction))

//router.get('/:id', isLoggedIn, catchAsync(attractions.showAttraction))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(attractions.renderEditForm))

//router.put('/:id', isLoggedIn, isAuthor, validateAttraction, catchAsync(attractions.updateAttraction))

//router.delete('/:id', isAuthor, catchAsync(attractions.destroyAttraction))

module.exports = router;