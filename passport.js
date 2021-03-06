exports = module.exports = function(app, passport) {
	var LocalStrategy = require('passport-local').Strategy,
		FacebookStrategy = require('passport-facebook').Strategy;

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

	passport.use(new FacebookStrategy({
	    clientID: "462105547228530",
	    clientSecret: "4bb0a8afb7d8351852b10894b86286c3",
	    callbackURL: "http://localhost:3000/auth/facebook/callback"
	  },
	  function(accessToken, refreshToken, profile, done) {
	  	app.db.models.User.findOne({facebook_id: profile.id}, function(err, user) {
	  		if (err) { return done(err); }

    		if (!user) {
      		new app.db.models.User({
				    username: profile.username.replace(".", ""),
				    password: "",     
				    fullname: (profile.name.givenName+" "+profile.name.familyName+" "+profile.name.middleName).replace(/undefined/g, "").trim(),
				    facebook_id: profile.id,
				    avatar: "https://1.gravatar.com/avatar/a13b9d1fc146fc072c60d55dd348ddb6?d=https%3A%2F%2Fidenticons.github.com%2F456925e5b42509e868df6466fdf9cef5.png&r=x&s=440",
				    groups: []
				  }).save(function(err, user){
				  	if (err) { return done(err); }

				  	return done(null, user);
  				});
    		} else {
  				return done(null, user);
    		}
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