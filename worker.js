var io = require('socket.io-client');
var _log = require('./lib/logger');
var _healthCheck = require('./lib/healthcheck')();

//TODO  temporary hardcode
var socket = io.connect("http://127.0.0.1:3000");


var doHealthCheck = function() {
	var monitorscfg = require('./config/monitor_cfg')
	monitorscfg.forEach(function(region) {
		//_log.ok('Checking for region: ' + region.name);
		region.applications.forEach(function(app) {
				app.modules.forEach(function(module) {
						//_log.ok('Checking for endpoint: ' + module.endpoint);
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
}
setInterval(doHealthCheck, 30000);