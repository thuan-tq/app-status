
// export function for listening to the socket
module.exports = function (socket) {

  var monitorcfg = require('../config/monitor_cfg');
  var overallStatus = "All Applications Operational";
  // broadcast a user's message to other users
  socket.on('send:message', function (data) {

    module = updateStatus(data);
    if (module) {
        data.status = module.status;
        data.lastcheck = module.lastcheck
        socket.broadcast.emit('send:message', data);
    }
  });

  var updateRegionStatus = function(regionName) {
      var region = monitorcfg.find(function(region) {
         return region.name === regionName;
      });  

      var pOutageCount = 0;
      var outageCount = 0;
      var operationalCount = 0;
      var regionStatus = "Operational";
      region.applications.forEach(function(app) {
          if (app.status === 'Partial Outage') {
            pOutageCount++;
          } else if(app.status === 'Outage') {
            outageCount++;
          } else if(app.status === 'Operational') {
            operationalCount++;
          }
      });
      if (pOutageCount > 0 || outageCount > 0) {
          if (pOutageCount > 0) {
            regionStatus = "Partial Outage";
          }  else if (operationalCount > 0){
            regionStatus = "Partial Outage";
          } else {
            regionStatus = "Outage"
          }
      }
      region.status = regionStatus;
  }

  var updateAppStatus = function(app) {

      var pOutageCount = 0;
      var outageCount = 0;
      var operationalCount = 0;
      var appStatus = "Operational";
      app.modules.forEach(function(module) {
          if (module.status === 'Partial Outage') {
            pOutageCount++;
          } else if(module.status === 'Outage') {
            outageCount++;
          } else if(module.status === 'Operational') {
            operationalCount++;
          }
      });
      if (pOutageCount > 0 || outageCount > 0) {
          if (pOutageCount > 0) {
            appStatus = "Partial Outage";
          }  else if (operationalCount > 0){
            appStatus = "Partial Outage";
          } else {
            appStatus = "Outage";
          }
      }
      app.status = appStatus;
  }

  var updateStatus = function(message) {
      obj = null;
      var modulestatus = 'Operational';
      if (message.status) {
          for (var k in message) {
             if (message[k]['status'] === 'DOWN') {
                modulestatus = 'Partial Outage'
             }
          }
      } else {
        modulestatus = 'Outage'
      }
      monitorcfg.forEach(function(region) {
          if (region.name == message.regionName) {
              region.applications.forEach(function(app) {
                  if (app.name ==  message.appName) {
                      app.modules.forEach(function(module) {
                          if (module.name == message.moduleName) {
                              if (module.status !== modulestatus) {
                                  module.status = modulestatus;
                              }
                              obj = module;
                              module.lastcheck = new Date();
                          }
                      });
                      updateAppStatus(app);
                  }
              });
              updateRegionStatus(region.name);
          } 
      });

      return obj;
  }
};
