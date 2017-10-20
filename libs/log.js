//var winston = require('winston');
var bunyan= require('bunyan');
var ENV = process.env.NODE_ENV;

// can be much more flexible than that O_o
/*function getLogger(module) {

  var path = module.filename.split('/').slice(-2).join('/');

  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        colorize: true,
        level: (ENV == 'development') ? 'debug' : 'error',
        label: path
      })
    ]
  });
}

*/

function reqSerializer(req) {
    return {
        method: req.method,
        url: req.url,
        headers: req.headers ,
	params:req.params,
	query:req.query,
	session:req.session,
	body:req.body
    };
}

function getLogger(module) {

  var path = module.filename.split('/').slice(-2).join('/');

var log = bunyan.createLogger({   name: path,
 serializers: {
        req: reqSerializer
    },
 streams: [
    {
	type: 'rotating-file',
        path: 'log/selen-info.log',
        period: '1d'  }/*,
    {
      level: 'error',
      path: '/var/tmp/myapp-error.log'  // log ERROR and above to a file
    }  */
  ]
});
return log;
}

module.exports = getLogger;