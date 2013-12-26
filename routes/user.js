
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;
	
var userSchema = new Schema({
	username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
	fullname: String,
	created_at: { type: Date, default: Date.now }
});

userSchema.methods.validPassword = function(password){
	console.log(bcrypt.compareSync(password, this.password));
	return bcrypt.compareSync(password, this.password);
}

// userSchema.methods.comparePassword = function(candidatePassword, cb) {
//     bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
//         if (err) return cb(err);
//         cb(null, isMatch);
//     });
// };

var User = mongoose.model('users', userSchema);

module.exports.Model = User;

userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password along with our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

exports.list = function(req, res){
	User.find(function(err, users){
		res.send(users);
	});
};

exports.post = function(req, res){
    new User({
    	username: req.body.username,
    	password: req.body.password,
    	fullname: req.body.fullname
    }).save(function(err, user){
    	res.send(user);
    });
};

exports.show = function(req, res){
	User.findOne({username: req.params.username}, function(err, user){
		res.render('sidebar', { user: user });
	});
};
