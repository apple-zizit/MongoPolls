'use strict';

var express = require('express'),
    path = require('path'),
    fs = require('fs'),
    mongoose = require('mongoose'),
    http = require('http');

    //avner: should better be in the route
    var api = require('./lib/controllers/api');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

// Connect to database
var db = mongoose.connect(config.mongo.uri, config.mongo.options);

// Bootstrap models
var modelsPath = path.join(__dirname, 'lib/models');
fs.readdirSync(modelsPath).forEach(function (file) {
  if (/(.*)\.(js$|coffee$)/.test(file)) {
    require(modelsPath + '/' + file);
  }
});

// Populate empty DB with sample data
require('./lib/config/dummydata');

var app = express();

var server = http.createServer(app);
var io = require('socket.io').listen(server);

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

//avner: should better be in the route
 io.sockets.on('connection', api.vote);

//  // Start server
// app.listen(config.port, function () {
//   console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
// });

server.listen(config.port, function () {
  console.log('Express server running on http://localhost:%d in %s mode', config.port, app.get('env'));
});

// Expose app
exports = module.exports = app;