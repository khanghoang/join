exports = module.exports = function(app, passport) {
	var LocalStrategy = require('passport-local').Strategy;

	passport.use(new LocalStrategy({
			usernameField: 'username',
			passwordField: 'password'
		},
		function(username, password, done) {
	    app.db.models.User.findOne({ username: username }, function(err, user) {
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

	passport.serializeUser(function(user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function(_id, done) {
		app.db.models.User.findById(_id, function(err, user) {
			done(err, user);
		});
	});
};