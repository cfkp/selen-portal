var HttpError = require('error').HttpError;

module.exports = function (req, res, next) {
    if (!req.session.user) {
         if (req.method == 'GET') {
            return res.redirect('./login?returnUrl=' + encodeURIComponent(req.url));
        } else {
            return res.status(500).json({
                'error': 'not_authorized',
                'msg': 'Ошибка авторизации. '
            });
        }
    }

    next();
};
