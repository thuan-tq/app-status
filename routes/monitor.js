exports.monitors = function (req, res) {
  var name = req.params.name;
  var monitorcfg = require('./config/monitor_cfg');
  return res.json(monitorcfg);
};