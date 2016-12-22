
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var socket = require('./routes/socket.js');
var jsonServer = require('json-server'); 
var socketio = require('socket.io');
var forever = require('forever-monitor');


//Initializing application modules
var app =  express();
app.use(express.static(__dirname + '/public'));

var server = app.listen(process.env.VCAP_APP_PORT || 3000, function () {
     console.log ('Server started on port: ' + server.address().port);
});

// Hook Socket.io into Express
var io = socketio(server);
io.on('connection', socket);


//montor config
var monitorcfg = require('./config/monitor_cfg');
app.get('/monitors', function(req,res) {
  return res.json(monitorcfg);
});


//child process for healthcheck worker
var child = new (forever.Monitor)('worker.js', {
    max: 10,
    silent: false,
    args: []
  });

child.on('exit', function () {
    console.log('worker.js has exited after 10 restarts');
  });
child.start()
  
 
 module.exports = app;
