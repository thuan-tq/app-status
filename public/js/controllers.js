'use strict';

/* Controllers */

function AppCtrl($scope, socket, $http) {

  // Socket listeners
  socket.on('init', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
  });

  socket.on('send:message', function (message) {
    console.log("Received Message  " + JSON.stringify(message));
    updateStatus(message);
  });

  $scope.monitors = [];

  $http.get('/monitors').then(
    function(res) {
      $scope.monitors = res.data;
      updateOverallStatus();
      console.log(JSON.stringify($scope.monitors))
    }, 
    function(res) {
      $scope.monitors = [];});

 


  $scope.messages = [];

  $scope.overallStatus = "All Applications Operational";

  

  $scope.toggleGroup = function(regionName) {
      $scope.monitors.forEach(function(region) {
            if (region.name === regionName) {
               region.show = !region.show;
            }
      }); 
     
  }

 $scope.toggleApp = function(app) {
               app.show = !app.show;
     
  }

  var updateRegionStatus = function(regionName) {
      var region = $scope.monitors.find(function(region) {
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
      $scope.monitors.forEach(function(region) {
          if (region.name == message.regionName) {
              region.applications.forEach(function(app) {
                  if (app.name ==  message.appName) {
                      app.modules.forEach(function(module) {
                          if (module.name == message.moduleName) {
                                  module.status = message.status;
                                  module.lastcheck = message.lastcheck;
                          }
                      });
                      updateAppStatus(app);
                  }
              });
              updateRegionStatus(region.name);
          } 
      });
  }
}
