exports = module.exports = function(app, mongoose) {
	var Schema = mongoose.Schema;

	var groupSchema = new Schema({
		group_name: { type: String, required: true },
		users: [
			{
				_id: { type: Schema.Types.ObjectId, ref: 'users' },
				fullname: String
			}
		]
	});

	app.db.models.Group = mongoose.model('groups', groupSchema);
};