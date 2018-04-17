var MongoClient = require('mongodb').MongoClient
var ObjectID = require('mongodb').ObjectID;
var sess = require('../middleware/session');

var dbconnection = null; // глобальная переменная не обнуляется при запросах  

exports.connect = function (url, done) {

    console.log('connect  dbconnection_ ' + dbconnection);

    if (dbconnection) return done()
    MongoClient.connect(url, {
            autoReconnect: true,
            reconnectTries: 100,
            poolSize: 10
        },
        function (err, dbres) {
            if (err) return done(err);
            dbconnection = dbres;
            done();
        })
}

exports.get = function () {

    return dbconnection
}

exports.close = function (done) {
    if (dbconnection) {
        dbconnection.close(function (err, result) {
            dbconnection = null
            done(err)
        })
    }
}

exports.audit = function (userid, meta_class, meta_method, obj_id, data) {
    var id = new ObjectID().toString();
    var sysdate = new Date().toISOString();

    var row = {
        "_id": id,
        "created": sysdate,
        "this_meta_class": "audit",
        "user_createid": userid,
        "meta_class": meta_class,
        "meta_method": meta_method,
        "object_id": obj_id,
        "data": data
    };

    dbconnection.collection("audit").save(row, function (err, docs) {

    });


};


exports.findone = function (meta_class, search_filter, nextfunc) {
    dbconnection.collection(meta_class).findOne(
        search_filter, nextfunc
    );
};


exports.save_obj_hist = function (userid, meta_class, obj) {
    var id = new ObjectID().toString();
    var sysdate = new Date().toISOString();

    if (obj) {
        var row = {
            "_id": id,
            "created": sysdate,
            this_meta_class: "object_history",
            "user_createid": userid,
            "meta_class": meta_class,
            "object_id": obj._id,
            "object": obj
        };

        dbconnection.collection("object_history").save(row, function (err, docs) {

        });
    };

};


exports.save_obj = function (userid, meta_class, collection, data, callback) {
    //console.log('save_obj curuser ' + userid);
    //console.log('save_obj1  ' + JSON.stringify(data, 4, 4));

    var id = new ObjectID().toString();
    var sysdate = new Date().toISOString();

    if (data) {
        var row = {
            "_id": id, 
            "__v": 0,
            "created": sysdate,
            this_meta_class: meta_class,
            "user_createid": userid,
            "meta_class": meta_class,
            "state": "Новый",
            "data": data
        };
        if (collection && collection.meta_parent_field) {
            row[collection.meta_parent_field] = collection.meta_parent_value;
        }


        dbconnection.collection(meta_class).save(row, function (err, docs) {
   // console.log('save_obj2  ' + JSON.stringify(row, 4, 4));

            callback(err, row)

        });

    } else callback({
        'err': 'NO_DATA_SAVE',
        'msg': 'Нет данных для сохранения'
    });

};

exports.update_obj = function (userid, meta_class, meta_method, obj_id, set$, callback) {
    //console.log('update_obj ' + obj_id + ' set ' + JSON.stringify(set$));
    if (set$) {
        //	set$["user_updateid"]=sess.CurrentUserId();
        dbconnection.collection(meta_class).findOneAndUpdate({
            "_id": obj_id
        }, {

            $set: set$,

            $inc: {
                "__v": 1
            },
            $currentDate: {
                "updated": true
            }
        }, {
            returnOriginal: false
        }, function (err, docs) {
            //        console.log('update doc ' + JSON.stringify(docs, 4, 4))
            if (!err && docs && docs.value && docs.ok == 1)
                exports.audit(userid, meta_class, meta_method, obj_id, {
                    set: set$
                });
            else {
                err = {
                    'err': 'ERROR_UPDATE',
                    'msg': 'ошибка сохранения документа',
                    error_detail: {
                        err: err,
                        doc: docs
                    }
                }
            };
            callback(err, docs.value);

        });

    } else callback({
        'err': 'NO_DATA_SAVE',
        'msg': 'Нет данных для изменения'
    });

};


exports.sequence_get_next = function (seqname, callback) {
    console.log('sequence_get_next ' + seqname);
    //	set$["user_updateid"]=sess.CurrentUserId();
    dbconnection.collection('sequence').findAndModify({
        "_id": seqname
    }, [], {

        $inc: {
            sequence: 1
        }

    }, {
        new: true,
        upsert: true

    }, function (err, docs) {
        console.log('sequence_get_next doc ' + JSON.stringify(docs, 4, 4))
        if (!err && docs && docs.value && docs.ok == 1) {} else {
            err = {
                'err': 'ERROR_UPDATE',
                'msg': 'ошибка получения следующего значения ',
                error_detail: {
                    err: err,
                    doc: docs
                }
            }
        };
        callback(err, docs.value.sequence);

    });


};
