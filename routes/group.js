
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var user = require('../routes/user');
	
var groupSchema = new Schema({
	group_name: { type: String, required: true },
	users: [
		{
			_id: { type: Schema.Types.ObjectId, ref: 'users' },
			fullname: String
		}
	]
});

var Group = mongoose.model('groups', groupSchema);

/*
 * export
 */

module.exports.Model = Group;

exports.show = function(req, res){
	Group.findOne({_id: req.params.group_id}, function(err, group){
		res.render('group', {user: req.user, group: group});
	});
}
exports.post = function(req, res){
	user.Model.findOne({username: req.params.username}, function(err, user){
        new Group({
			group_name: req.body.group_name,
			users: [
				{
					_id: user._id,
					fullname: user.fullname
				}
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
exports.add = function(req, res){
	user.Model.findOne({username: req.body.username}, function(err, user){
		user.groups.push(req.body.group_id);
		user.save(function(err, user){
			Group.findOne({_id: req.body.group_id}, function(err, group){
				group.users.push({
					_id: user._id,
					fullname: user.fullname
				});
				group.save(function(err, group){
					res.send(group);
					// res.redirect('/users/' + user.username);
				});
			});
		});
    });
};