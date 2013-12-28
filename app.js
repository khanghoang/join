
/**
 * Module dependencies.
 */

var express = require('express');
var mongoose = require('mongoose');
var routes = require('./routes');
var user = require('./routes/user');
var group = require('./routes/group');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');

var app = express();
mongoose.connect('mongodb://localhost/join_development');

var passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy;

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({secret: "secret key"}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res){
  res.status(400);
  res.render('404.jade');
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// production only
app.configure('production', function(){
  app.enable('view cache');
});

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    user.Model.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

var auth = function(req, res, next){
  if (!req.isAuthenticated())
    res.render('401.jade');
  else
    next();
};

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(_id, done) {
  user.Model.findById(_id, function(err, user) {
    done(err, user);
  });
});

app.get('/', routes.index);
app.get('/users', auth, user.list);
app.get('/users/:username.:format?', auth, user.show);
app.post('/users', user.post);
app.post('/login',
  passport.authenticate('local', { failureRedirect: '/',
                                   failureFlash: 'Invalid username or password.' }),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/users/' + req.user.username);
});
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.post('/users/:username/groups', group.post);
app.post('/users/:username/groups/add', group.add);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
