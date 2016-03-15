module.exports = function(app) {

    var express = require('express');
    var bodyParser = require('body-parser');
    var fs = require('fs');
    var MongoClient = require('mongodb').MongoClient;
    var passport = require('passport');
    var session = require( 'express-session' );
    var google_credentials = require('./google-credentials');
    var url = 'mongodb://localhost:27017/cljsketch';
    var db = undefined;

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    MongoClient.connect(url, function(err, _db) {
        db = _db;
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.use("/", express.static("../cljsketch/resources/public"));

    app.get('/login', function(req, res) {
        res.send("You must <a href='/auth/google'>login</a>.");
    });

    app.get('/logged-in', function(req, res) {
        res.send("You are logged in as Local Mark");
    });

    app.get('/logout', function(req, res){
        res.redirect('/');
    });




    function current_user_obj(req) {
        return google_credentials.GOOGLE_USER;
    }

    app.get('/who', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(current_user_obj(req)));
    });

    app.post("/save-sketch", ensureAuthenticated, function(req, res) {
        db.collection("sketches").findOne({
            'name': req.body.name,
            'user.auth-provider': 'google',
            'user.id': google_credentials.GOOGLE_USER.id
        }, function(err,sketch) {
            if (sketch) {
                db.collection("sketches").update({'name': req.body.name,
                                                  'user.auth-provider': 'google',
                                                  'user.id': google_credentials.GOOGLE_USER.id},
                                                 {$set: {sketch: req.body.sketch}});
            } else {
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
            }
        });
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ status: "OK" }));
    });

    app.post("/delete-sketch", ensureAuthenticated, function(req, res) {
        db.collection("sketches").deleteOne({
            'name': req.body.name,
            'user.auth-provider': 'google',
            'user.id': google_credentials.GOOGLE_USER.id
        });
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({ status: "OK" }));
    });

    app.post("/list-sketches", ensureAuthenticated, function(req, res) {
        var sketches = [];
        var user = current_user_obj(req);
        db.collection("sketches")
            .find({ 'user.auth-provider': 'google', 'user.id': google_credentials.GOOGLE_USER.id })
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
            'user.id': google_credentials.GOOGLE_USER.id
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
        return next();
    }

};
