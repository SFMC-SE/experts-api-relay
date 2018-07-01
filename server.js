var createError = require('http-errors');
var logger = require('morgan');
var express = require('express');
var basicAuth = require('express-basic-auth');

var isTriggerJbRouter = require('./routes/is-trigger-jb');

var app = express();
var port = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use('/is', isTriggerJbRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

app.listen(port);
