exports = module.exports = function(app, mongoose) {
	require('./schema/User')(app, mongoose);
	require('./schema/Group')(app, mongoose);
};