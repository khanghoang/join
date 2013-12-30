
var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;

var group = require('../routes/group');
	
var userSchema = new Schema({
	username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
	fullname: String,
    avatar: String,
	created_at: { type: Date, default: Date.now },
    groups: [{ type: Schema.Types.ObjectId, ref: 'groups' }]
});

userSchema.methods.validPassword = function(password){
	return bcrypt.compareSync(password, this.password);
}

var User = mongoose.model('users', userSchema);

/*
 * export
 */

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
    if (req.body.password != req.body.confirm_password) {
        res.render('index', { messages: "Password does not match." });
    } else {
        new User({
        	username: req.body.username,
        	password: req.body.password,
        	fullname: req.body.fullname,
            avatar: "https://1.gravatar.com/avatar/a13b9d1fc146fc072c60d55dd348ddb6?d=https%3A%2F%2Fidenticons.github.com%2F456925e5b42509e868df6466fdf9cef5.png&r=x&s=440",
            groups: []
        }).save(function(err, user){
        	res.send(user);
        });
    }
};

exports.show = function(req, res){
    // User.findOne({username: req.params.username}, function(err, user){
    //     group.Model.find({users: {
    //         _id: user._id,
    //         fullname: user.fullname
    //     }}, function(err, groups){
    //         res.render('user', {user: user, groups: groups});
    //         // res.send([{user: user, groups: groups}]);
    //     });
    // });

    group.Model.find({users: {
        _id: req.user._id,
        fullname: req.user.fullname
    }}, function(err, groups){
        res.render('user', {user: req.user, groups: groups});
    });
};
