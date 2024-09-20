/**
 * Catches errors and passes them to the next middleware
*/
exports.catchError = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => next(err));
  };
};
