//var User = require('models/user').User;
var db = require('../db/db');

 
module.exports.setCurrentUser = function (req, res, next) {
  //   console.log('set CurrentUser'+req.url );
    req.user = res.locals.user = null;
     if (!req.session.user) return next();
    if (req.session.userdata){   
        req.user =  res.locals.user=req.session.userdata; return next()};
    var dbloc = db.get();
console.log('CurrentUser not exists' );
    dbloc.collection('users').aggregate([

        {
            $match: {
                "_id": req.session.user
            }
        },
        {
            $lookup: {
                from: "roles",
                localField: "data.role",
                foreignField: "_id",
                as: "role"
            }
        },
        {
            $addFields: {
                "role": {
                    $arrayElemAt: ["$role", 0]
                }
            }
        }
	]).toArray(function (err, rows) {
        if (err) return next(err);
        
        req.session.userdata = rows[0];
        req.user =  res.locals.user = rows[0];
        req.session.save();
        next();
    });

};

module.exports.setCurrentUserbyID = function (userid, next) {
    var dbloc = db.get();

    dbloc.collection('users').aggregate([

        {
            $match: {
                "_id": userid
            }
        },
        {
            $lookup: {
                from: "roles",
                localField: "data.role",
                foreignField: "_id",
                as: "role"
            }
        },
        {
            $addFields: {
                "role": {
                    $arrayElemAt: ["$role", 0]
                }
            }
        }
	]).toArray(function (err, rows) {
        if (err) return next(err);
        next(null, rows[0]);
    });

};

/*
module.exports.CurrentUser = function () {
    //console.log('CurrentUser'+current_user);

    return current_user;
};


module.exports.CurrentUserId = function () {
    if (current_user) {
        return current_user._id;
    } else {
        return undefined;
    }
};*/
