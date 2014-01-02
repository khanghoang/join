var validate = require('mongoose-validator').validate,
	bcrypt = require('bcrypt'),
  SALT_WORK_FACTOR = 10;

exports = module.exports = function(app, mongoose) {
  var Schema = mongoose.Schema;

  var userSchema = new Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true, validate: validate({message: "Password should be at least 8."}, 'len', 8) },
    fullname: { type: String, required: true },
    avatar: String,
    created_at: { type: Date, default: Date.now },
    groups: [{ type: Schema.Types.ObjectId, ref: 'groups' }]
  });

  userSchema.methods.validPassword = function(password){
  	return bcrypt.compareSync(password, this.password);
  };

  userSchema.pre('save', function(next) {
    var user = this;

    //only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    //generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
      if (err) return next(err);

      //hash the password along with our new salt
      bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);

        //override the cleartext password with the hashed one
        user.password = hash;
        next();
      });
    });
  });

  //app.db.model('users', userSchema);
  app.db.models.User = mongoose.model('users', userSchema);
};