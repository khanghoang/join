UserClass = require("./routes/user");

exports = module.exports = function(app, passport) {
	var LocalStrategy = require('passport-local').Strategy;
	var FacebookStrategy = require('passport-facebook').Strategy;

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

	passport.use(new FacebookStrategy({
	    clientID: "462105547228530",
	    clientSecret: "4bb0a8afb7d8351852b10894b86286c3",
	    callbackURL: "http://localhost:3000/auth/facebook/callback"
	  },
	  function(accessToken, refreshToken, profile, done) {

	    console.log(profile);

	    UserClass.checkUserFacebookIsSignupAlr(app, profile, function(user){
	    	if (!user) {
				UserClass.createUserFacebook(app, profile, function(user){
			    	if (!user) {
						console.log(user);
					}

					return done(null, user);	
			    });	    		
			    return;
	    	};

	    	return done(null, user);
	    });
	  }
	));
};