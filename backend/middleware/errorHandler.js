// Central error handler. Any error passed to next() ends up here, so controllers
// no longer need to repeat console.error + res.status(500) in every catch block.
const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({
    message: err.message || "Server Error",
  });
};

module.exports = errorHandler;
