module.exports.isLoggedIn = (req, res, next) => { //log in middleware
    console.log("REQ.USER...", req.user);
    if (!req.isAuthenticated()) {
        console.log(req.path, req.originalUrl) //print path, and the original Url
        req.session.returnTo = req.originalUrl; //store the URL they are requesting, by adding the originalUrl to a new parameter 'returnTo'!
        console.log('req.session.returnTo in isLoggedIn is', req.session.returnTo);
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    else {
        next();
    }
    //next();
}

//req.user tells us info about the user.