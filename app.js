
/**
 * Module dependencies.
 */

var express = require('express');
var socket = require('socket.io');
var mongoose = require('mongoose');
var routes = require('./routes');
var user = require('./routes/user');
var group = require('./routes/group');
var http = require('http');
var path = require('path');
var flash = require('connect-flash');

var app = express();
var server = http.createServer(app);
var io = socket.listen(server);
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

var authz = function(req, res, next){
  if (req.user && req.user.username == req.params.username) {
    next();
  } else {
    res.render('401.jade');
  }
};

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(_id, done) {
  user.Model.findById(_id, function(err, user) {
    done(err, user);
  });
});



app.get('/', 
  function(req, res, next){
    if (req.isAuthenticated())
      res.redirect('/users/' + req.user.username);
    else
      next();
  }, routes.index);
app.get('/register', 
  function(req, res, next){
    if (req.isAuthenticated())
      res.redirect('/users/' + req.user.username);
    else
      next();
  }, routes.index);
app.get('/users', auth, user.list);
app.get('/users/:username.:format?', authz, user.show);
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
app.get('/users/:username/groups/:group_id', authz, group.show);
app.post('/users/:username/groups/add', group.add);



io.sockets.on('connection', function(socket) {
  socket.on('user join', function (user, group) {
    socket.username = user.username;
    socket.room = group.group_name;
    socket.join(group.group_name);
    socket.broadcast.to(group.group_name).emit('updatechat', user.fullname + ' has connected to this room');
  });
  socket.on('updatechat', function (data) {
    io.sockets.in(socket.room).emit("updatechat", data);
  });
  socket.on('disconnect', function() {
    socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
    socket.leave(socket.room);
  });
});



server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
