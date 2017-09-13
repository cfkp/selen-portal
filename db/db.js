var MongoClient = require('mongodb').MongoClient

var state = {
  db: null,
}

exports.connect = function(url, done) {
  if (state.db) return done()
console.log('Connect');
  MongoClient.connect(url,
{
/*    server:{
        auto_reconnect: true,
        poolSize: 10,
        socketOptions:{
            keepAlive: 1
        }
    },
    db: {
        numberOfRetries: 10,
        retryMiliSeconds: 1000
    }*/

        autoReconnect: true,

	reconnectTries:100,
        poolSize: 10
    

}, 
function(err, db) {
    if (err) return done(err)
    state.db = db
    done()
  })
}

exports.get = function() {
console.log('Get_connection');
//if (state.db)
 // {
  return state.db
  //} else
  //{connect('mongodb://selen-it.ru:27017/userdb')} 
}

exports.close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      done(err)
    })
  }
}