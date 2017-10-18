var HttpError = require('error').HttpError;

module.exports = function(req, res, next) {
    //console.log(req.session.user);
///    console.log("asas");
    if (!req.session.user) {
        // next(new HttpError(404, "Player not found"));

        return res.redirect("./login");
     //   return next(new HttpError(401, "Вы не авторизованы"));
    }

    next();
};