var crypto = require('crypto');

function hashpass(password,salt) {


return crypto.createHmac('sha1', salt).update(password).digest('hex') ;
};