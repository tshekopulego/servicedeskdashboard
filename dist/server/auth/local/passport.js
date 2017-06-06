var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

exports.setup = function (User, config) {
	passport.use(new LocalStrategy({
		usernameField: 'email',
			passwordField: 'password' // this is the virtual field on the model
		},
		function(email, password, done) {
			User.findOne({
				$or: [
					{email: email.toLowerCase()},
					{phoneNumber: email},
				]
			}, function(err, user) {
				if (err) return done(err);

				if (!user) {
					return done(null, false, { message: 'This email is not registered.' });
				}
				if (!user.authenticate(password)) {
					return done(null, false, { message: 'Wrong email or password.' });
				}
				if(!user.activated(email)) {
					return done(null, false, { message: 'Your account is not activated. Please contact the administrator.' });
				}
				return done(null, user);
			});
		}
		));
};
