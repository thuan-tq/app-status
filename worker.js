var io = require('socket.io-client');
var _log = require('./lib/logger');
var _healthCheck = require('./lib/healthcheck')();

var port = process.argv[2];
var interval = process.argv[3]
var socket = io.connect("http://localhost:" + port);
socket.emit('send:system', "connected");


var doHealthCheck = function() {
	var monitorscfg = require('./config/monitor_cfg')
	_log.info("Start health check....");
	monitorscfg.forEach(function(region) {
		region.applications.forEach(function(app) {
				app.modules.forEach(function(module) {
					   _healthCheck.healthcheck(module.endpoint).then(
							function(res) {
								data = {regionName: region.name, appName: app.name, moduleName: module.name, status: res}
								socket.emit('send:message', data);
							}
						).catch(
							function(res) {
								data = {regionName: region.name, appName: app.name, moduleName: module.name, status: res}
								socket.emit('send:message', data);
							}
						)
				})
		});
	});
	socket.emit('send:system', "end healthcheck");
}

//Do health heck after start
doHealthCheck();

//Periodically do health check
setInterval(doHealthCheck, interval);
