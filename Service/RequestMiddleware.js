const log = require('../Config/winston');
 
module.exports = function(req, res){ 
    log.info(`Request ${req.method} ${req.url}, IP: ${req.ip}`);
}