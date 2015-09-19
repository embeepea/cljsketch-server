var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/cljsketch';

var db = undefined;

MongoClient.connect(url, function(err, _db) {
    db = _db;
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", express.static("../cljsketch/resources/public"));

var user = "embeepea";

app.get('/who', function (req, res) {
  res.send(user);
});

app.post("/save-sketch", function(req, res) {
    db.collection("sketches").insertOne({
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

app.post("/list-sketches", function(req, res) {
    var sketches = [];
    db.collection("sketches")
        .find()
        .each(function(err, sketch) {
            if (sketch) {
                sketches.push(sketch.name);
            } else {
                res.setHeader('Content-Type', 'application/json');
                res.send(JSON.stringify(sketches));
            }
        });
});

app.post("/get-sketch", function(req, res) {
    db.collection("sketches").findOne({ name: req.body.name }, function(err,sketch) {
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

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
