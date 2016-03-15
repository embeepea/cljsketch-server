var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;
var passport = require('passport');
var session = require( 'express-session' );
var cookieParser  = require( 'cookie-parser' );
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var google_credentials = require('./google-credentials');

var port = process.argv[2];

var local_auth = false;
var proxy_server = undefined;

if (process.argv.length > 3) {
    if (process.argv[3] === "local") {
        local_auth = true;
    } else {
        proxy_server = process.argv[3];
    }
}

var app = express();
var auth;

app.use("/", express.static(google_credentials.CLJSKETCH_PUBLIC));

if (proxy_server) {
    console.log("proxying authenticated requests through " + proxy_server);
    var proxy = require('./proxy.js');
    proxy(app, proxy_server);
} else {
    if (local_auth) {
        console.log("bypassing google auth to run local");
        auth = require('./local-auth.js');
    } else {
        auth = require('./auth.js');
    }
    auth(app);
}

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
