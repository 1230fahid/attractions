const User = require('../models/user');
module.exports.index = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res) => {
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
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login')
}

module.exports.login = (req, res) => { //authenticate passport on localhost with certain parameters
    req.flash('success', 'Welcome Back');
    console.log(req.session);
    const redirectUrl = req.session.returnTo || '/attractions/';
    //res.redirect('/attractions')
    console.log('redirect URL is', redirectUrl);
    req.session.returnTo = '' //had to add this because it stopped changing
    res.redirect(redirectUrl);
}

module.exports.logout = async (req, res) => {
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
}