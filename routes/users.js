const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { nextTick } = require('process');


router.get('/register', (req, res) => {
    res.render('users/register');
})

router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username })
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        //passport exposes a login() function on req (also aliased as logIn()) that can be used to establish a login session.
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/attractions')
        })
        //res.send(req.body);
    } catch (e) { //if error with getting username then flash the error and redirect to the register page
        req.flash('error', e.message);
        res.redirect('register');
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => { //authenticate passport on localhost with certain parameters
    req.flash('success', 'Welcome Back');
    console.log(req.session);
    const redirectUrl = req.session.returnTo;
    //res.redirect('/attractions')
    console.log('redirect URL is', redirectUrl);
    res.redirect(redirectUrl);
})

router.get('/logout', async (req, res) => {
    try {
        /*req.logout(function (err) {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Logged out!');
            res.redirect('/attractions')
        });*/
        req.logout(); //need this for passport 0.5.3
        req.flash('success', 'Logged out!');
        res.redirect('/attractions')
    }
    catch (e) {
        req.flash('error', e.message);
        res.redirect('/attractions')
    }
    //req.flash('success', 'Goodbye!');
    //res.redirect('/attractions');
})

module.exports = router;