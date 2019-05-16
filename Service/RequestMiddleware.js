const log = require('../Config/winston');
 
module.exports = function(req, res, next){ 
    log.info(`Request ${req.method} ${req.url}, IP: ${req.ip}`);
    
    res.on('finish', () => {        
        log.info(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`);
        log.info(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent for Request ${req.method} ${req.url}, IP: ${req.ip} `);
    })

    next();
}