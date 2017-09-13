var mongoose = require('libs/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema( {
    name:{
        type:String,
        required:true
    },
    json:{
        type:Object,
        required: true
    },
    description:{
        type: String
    },
    created: {
        type: Date,
        default: Date.now
    }
});

exports.Component = mongoose.model('Component', schema);
