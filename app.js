var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//app.get('/', function (req, res) {
//  res.send('Hello World!');
//});

//app.use("/cljsketch", express.static("/Users/mbp/cljsketch/resources/public"));
app.use("/", express.static("/Users/mbp/cljsketch/resources/public"));

var user = "embeepea";

app.get('/who', function (req, res) {
  res.send(user);
});

app.post("/save-sketch", function(req, res) {
    console.log('POST');
    console.log(req.body);
    //console.log(Object.keys(req));
    //console.log(req);
    res.send("OK\n");
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
