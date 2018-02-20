//var User = require('models/user').User;
var db = require('../db/db');

var current_user,
    request;

module.exports.setCurrentUser = function (req, res, next) {
    //console.log('set CurrentUser' );
    req.user = res.locals.user = null;
    current_user = null;
    if (!req.session.user) return next();
    var dbloc = db.get();

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

        req.user = res.locals.user = rows[0];
        request = req;
        current_user = rows[0];
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
        current_user = rows[0];
        next(null);
    });

};


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
};
