module.exports = function(app) {

    var express = require('express');
    var bodyParser = require('body-parser');
    var fs = require('fs');
    var MongoClient = require('mongodb').MongoClient;
    var passport = require('passport');
    var session = require( 'express-session' );
    var cookieParser  = require( 'cookie-parser' );
    var GoogleStrategy = require('passport-google-oauth2').Strategy;
    var google_credentials = require('./google-credentials');
    var url = 'mongodb://localhost:27017/cljsketch';
    var db = undefined;

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    // Use the GoogleStrategy within Passport.
    //   Strategies in Passport require a `verify` function, which accept
    //   credentials (in this case, an accessToken, refreshToken, and Google
    //   profile), and invoke a callback with a user object.
    passport.use(new GoogleStrategy({
        clientID: google_credentials.GOOGLE_CLIENT_ID,
        clientSecret: google_credentials.GOOGLE_CLIENT_SECRET,
        callbackURL: google_credentials.GOOGLE_CALLBACK_URL,
        passReqToCallback   : true
    }, function(req, accessToken, refreshToken, profile, done) {
console.log(req);
console.log(req.headers.referer);
        // asynchronous verification, for effect...
        process.nextTick(function () {
            // To keep the example simple, the user's Google profile is returned to
            // represent the logged-in user.  In a typical application, you would want
            // to associate the Google account with a user record in your database,
            // and return that user instead.
            return done(null, profile);
        });
    }));

    MongoClient.connect(url, function(err, _db) {
        db = _db;
    });

    app.use( cookieParser()); 
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use( session({ 
        secret: 'cookie_secret',
        //    name:   'kaas',
        //    store:  new RedisStore({
        //        host: '127.0.0.1',
        //        port: 6379
        //        }),
        //    proxy:  true,
        resave: true,
        saveUninitialized: true
    }));


    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/", express.static("../cljsketch/resources/public"));

    app.get('/login', function(req, res) {
        res.send("You must <a href='/auth/google'>login</a>.");
    });

    app.get('/logged-in', function(req, res) {
        console.log(req.isAuthenticated());
        console.log(req.user);
        res.send("You are logged in as " + req.user.displayName + ".  <a href='/logout'>Log Out</a>");
    });

    app.get('/ltest', ensureAuthenticated, function(req, res) {
        //console.log('ltest!');
        //console.log(req.isAuthenticated());
        console.log(req.user);
        res.send("This is ltest");
    });

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });


    // GET /auth/google
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in Google authentication will involve
    //   redirecting the user to google.com.  After authorization, Google
    //   will redirect the user back to this application at /auth/google/callback
    app.get('/auth/google',
            //passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }),
            //  passport.authenticate('google', { scope: ['https://accounts.google.com/o/oauth2/auth'] }),
            passport.authenticate('google', { scope: ['profile'] }),

            function(req, res){
                // The request will be redirected to Google for authentication, so this
                // function will not be called.
            });

    // GET /auth/google/callback
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get('/auth/google/callback', 
            passport.authenticate('google', {
                failureRedirect: '/login',
                successRedirect: '/'
            }),
            function(req, res) {
                res.redirect('/');
            });



    function current_user_obj(req) {
        return {
            name: req.user.displayName,
            "auth-provider": "google",
            id: req.user.id
        };
    }

    app.get('/who', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        if (req.isAuthenticated()) {
            res.send(JSON.stringify(current_user_obj(req)));
        } else {
            res.send(JSON.stringify({}));
        }
    });

    app.post("/save-sketch", ensureAuthenticated, function(req, res) {
        db.collection("sketches").insertOne({
            user: current_user_obj(req),
            name: req.body.name,
            sketch: req.body.sketch
        }, function(err, result) {
            if (err) {
                console.log('insert error');
                console.log(err);
            } else {
            }
        });
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ status: "OK" }));
    });

    app.post("/list-sketches", ensureAuthenticated, function(req, res) {
        var sketches = [];
        var user = current_user_obj(req);
        db.collection("sketches")
            .find({ 'user.auth-provider': 'google', 'user.id': req.user.id })
            .each(function(err, sketch) {
                if (sketch) {
                    sketches.push(sketch.name);
                } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.send(JSON.stringify(sketches));
                }
            });
    });

    app.post("/get-sketch", ensureAuthenticated, function(req, res) {
        db.collection("sketches").findOne({
            name: req.body.name,
            'user.auth-provider': 'google',
            'user.id': req.user.id
        }, function(err,sketch) {
            res.setHeader('Content-Type', 'application/json');
            res.send(JSON.stringify(sketch.sketch));
        });
    });

    //app.get(/cljsketch/, function(req, res) {
    //    var cljsketchResource = "/Users/mbp/cljsketch/resources/public/" + 
    //            req.url.replace('/cljsketch/','');
    //    cljsketchResource = cljsketchResource.replace(/\?.*$/, "");
    //    fs.readFile(cljsketchResource, function (err, data) {
    //        if (err) throw err;
    //        if (cljsketchResource.match(".*\.html$")) {
    //            res.header('Content-Type', 'text/html');
    //        } else if (cljsketchResource.match(".*\.css$")) {
    //            res.header('Content-Type', 'text/css');
    //        } else if (cljsketchResource.match(".*\.js$")) {
    //            res.header('Content-Type', 'text/javascript');
    //        } else {
    //            res.header('Content-Type', 'text/plain');
    //        }
    //        res.send(data);
    //    });
    //});

    function validate_user(user) {
        return true;
        /*
         if (user && user.emails && (user.emails[0].value === 'mbp@geomtech.com'
         || user.emails[0].value === 'andrea.fey@gmail.com'
         || user.emails[0].value === 'jrfrimme@unca.edu'
         )) {
         return true;
         } else {
         return false;
         }
         */
    }

    // Simple route middleware to ensure user is authenticated.
    //   Use this route middleware on any resource that needs to be protected.  If
    //   the request is authenticated (typically via a persistent login session),
    //   the request will proceed.  Otherwise, the user will be redirected to the
    //   login page.
    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated() && validate_user(req.user)) {
            return next();
        }
        res.redirect('/login');
    }

};
