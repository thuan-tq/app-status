
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var socket = require('./routes/socket.js');
var jsonServer = require('json-server'); 
var socketio = require('socket.io');
var forever = require('forever-monitor');
var _log = require('./lib/logger');
var os = require('os');

var cookieParser = require('cookie-parser'); // used for session cookie
// simple in-memory session is used here. use connect-redis for production!!
var session = require('express-session');

//Initializing application modules
var app =  express();
app.use(cookieParser('predixsample'));
app.use(express.static(__dirname + '/public'));
app.use(session({
	secret: 'predixsample',
	name: 'cookie_name',
	proxy: true,
	resave: true,
	saveUninitialized: true}));

var server = app.listen(process.env.VCAP_APP_PORT || 3000, function () {
     console.log ('Server started on port: ' + server.address().port);
});

// Hook Socket.io into Express
var io = socketio(server);
io.on('connection', socket);

var healthcheck_interval = process.env.VCAP_HEALTHCHECK_INTERVAL || 60000


//montor config
var monitorcfg = require('./config/monitor_cfg');
app.get('/monitors', function(req,res) {
  return res.json(monitorcfg);
});

app.get('/health', function(req, res) {
	var data = {
		status: 'UP',
		interval: healthcheck_interval,
		numcpu:  os.cpus().length,
		totalmem: os.totalmem(),
		freemem: os.freemem()
	}
	return res.json(data);
});


//child process for healthcheck worker
_log.ok("Health check interval: " + healthcheck_interval);
var child = new (forever.Monitor)('worker.js', {
    max: 10,
    silent: false,
    args: [server.address().port, healthcheck_interval]
  });

child.on('exit', function () {
    _log.error('worker.js has exited after 10 restarts');
  });
child.start()
  
 
 module.exports = app;
