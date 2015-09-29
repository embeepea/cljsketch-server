module.exports = function(app, proxy_server) {
    var url = require('url');
    var proxy = require('express-http-proxy');

    function proxy_route(path) {
        app.use(path, proxy(proxy_server, {
            forwardPath: function(req, res) {
                return path;
                console.log("forwarding request for '"+req.url+"' to "+proxy_server);
                console.log("   url.parse(req.url).path = " + url.parse(req.url).path);
                return url.parse(req.url).path;
            }
        }));
    }

    // get:
    proxy_route('/login');
    proxy_route('/logged-in');
    proxy_route('/ltest');
    proxy_route('/logout');
    proxy_route('/auth/google');
    proxy_route('/auth/google/callback');
    proxy_route('/who');

    // post:
    proxy_route('/save-sketch');
    proxy_route('/list-sketches');
    proxy_route('/get-sketch');

};
