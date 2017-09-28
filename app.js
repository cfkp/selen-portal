var express = require('express');
var morganlogger = require('morgan')


var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');



var http = require('http');
var path = require('path');
var config = require('config');
var log = require('libs/log')(module);
var mongoose = require('libs/mongoose');
var HttpError = require('error').HttpError;

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.engine('ejs', require('ejs-locals'));
app.set('views', __dirname + '/template');
app.set('view engine', 'ejs');

const session = require('express-session');
const MongoStore = require('connect-mongo')(session);



var index = require('./routes/index');
//var generateForm = require('./routes/generateForm');

app.use(session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser'));

app.use(function(err, req, res, next) {
  if (typeof err == 'number') { // next(404);
    err = new HttpError(err);
  }

  if (err instanceof HttpError) {
    res.sendHttpError(err);
  } else {
    if (app.get('env') == 'development') {
     express.errorHandler()(err, req, res, next);
      //res.status(err.status || 500);
      //res.render('error', {
      //  message: err.message,
      //  error: err});
    } else {
     // log.error(err );
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  }
});

var db = require('./db/db');
var login= require('./routes/login');
var api= require('./routes/api');
var view= require('./routes/view');
var upload= require('./routes/fileupload');
var report= require('./routes/report');

var config = require('config');

db.connect(config.get('mongoose:uri'), function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.')
    process.exit(1)
  } else {
      console.log('Connecting db')
    }
  }
)


app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'publicapp')));
app.use('/', index);
//app.use('/generateForm', generateForm);
app.use('/login', login);
app.use('/api', api);
app.use('/view', view);
app.use('/load', upload);
app.use('/report', report);

module.exports = app;
