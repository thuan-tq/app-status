'use strict';

/* Controllers */

function AppCtrl($scope, socket, $http) {

  // Socket listeners
  socket.on('init', function (data) {
    $scope.name = data.name;
    $scope.users = data.users;
  });

  socket.on('send:message', function (message) {
    updateStatus(message);
  });

  socket.on('send:system', function (data) {
    console.log("Received Sys Message  " + data);
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

  var updateOverallStatus = function() {
      var pOutageCount = 0;
      var outageCount = 0;
      var operationalCount = 0;
      $scope.monitors.forEach(function(region) {
          if (region.status === 'Operational') {
            operationalCount++;
          } else if (region.status === 'Partial Outage') {
            pOutageCount++;
          } else if (region.status === 'Outage') {
            outageCount++;
          }
      });

      if (pOutageCount > 0 || outageCount > 0) {
          if (pOutageCount > 0) {
            $scope.overallStatus = 'Application Partial Outage';
          }  else if (operationalCount > 0){
            $scope.overallStatus = 'Application Partial Outage';
          } else {
            $scope.overallStatus = 'Application Partial Outage';
          }
      } else {
          $scope.overallStatus = "All Applications Operational";
      }
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

      updateOverallStatus();
  }
}
