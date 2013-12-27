
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var user = require('../routes/user');
	
var groupSchema = new Schema({
	group_name: { type: String, required: true },
	users: [{ type: Schema.Types.ObjectId, ref: 'users' }]
});

var Group = mongoose.model('groups', groupSchema);

/*
 * export
 */

module.exports.Model = Group;

exports.post = function(req, res){
	user.Model.findOne({username: req.params.username}, function(err, user){
        new Group({
			group_name: req.body.group_name,
			users: [
				user._id
			]
		}).save(function(err, group){
			// update current user
			user.groups.push(group._id);
	        user.save(function(err, user){
				// res.send(group);
				res.redirect('/users/' + user.username);
	        });
		});
    });
};