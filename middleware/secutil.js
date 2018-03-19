var crypto = require('crypto');

function hashpass(password, salt) {


    return crypto.createHmac('sha1', salt).update(password).digest('hex');
};

function hash_id(_id, key) {


    return crypto.createHmac('sha1', key).update(_id).digest('hex');
};


var calc_view_hash = function (key,rows) { 
    for (var i = 0, n = rows.length; i < n; ++i) {
        var row = rows[i];
        if (row&&row._id) {
        row._hshid= hash_id(row._id, key) ;
        }
    }
};


exports.calc_view_hash= calc_view_hash;