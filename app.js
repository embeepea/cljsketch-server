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

var proxy_server = undefined;
if (process.argv.length > 3) {
    proxy_server = process.argv[3];
}

var app = express();

app.use("/", express.static("../cljsketch/resources/public"));

if (proxy_server) {
    console.log("proxying authenticated requests through " + proxy_server);
    var proxy = require('./proxy.js');
    proxy(app, proxy_server);
} else {
    var auth = require('./auth.js');
    auth(app);
}

var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
