var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var loginUserRouter = require('./routes/loginuser');
var accountPageRouter = require('./routes/accountpage');
var accountResultRouter = require('./routes/accountresult');
var accountSearchRouter = require('./routes/accountsearch');
var transactionsRouter = require('./routes/transactions');
var adminAccountSearchRouter = require('./routes/adminaccountsearch');
var adminAccountResultRouter = require('./routes/adminaccountresult');
var changePasswordRouter = require('./routes/changepassword');
var transferRouter = require('./routes/transfer')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/")));
app.use(express.static(path.join(__dirname, "node_modules/bootstrap-icons/")));

app.use('/', indexRouter);
app.use('/loginuser', loginUserRouter);
app.use('/accountpage', accountPageRouter);
app.use('/accountresult', accountResultRouter);
app.use('/accountsearch', accountSearchRouter);
app.use('/adminaccountsearch', adminAccountSearchRouter);
app.use('/adminaccountresult', adminAccountResultRouter);
app.use('/transactions', transactionsRouter);
app.use('/changepassword', changePasswordRouter);
app.use('/transfer', transferRouter);

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
