module.exports.localVeriables = function (req, res, next) {
    req.app.locals = {
      OTP: null,
      resetSession: false,
    };
    next();
  };