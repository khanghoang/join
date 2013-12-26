
function AppModel(url) {
	this.url = url;
}

AppModel.prototype.fetch = function(data) {
	data = (data) ? data : null;

	return $.ajax({
		url: this.url,
		type: "GET",
		data: data,
		dataType: "json",
		beforeSend: function(){

		},
		error: function(e){
			
		},
		success: function(fetchData){
			console.log(fetchData);
		}
	})
};

AppModel.prototype.post = function(data) {
	return $.ajax({
		url: this.url,
		type: "POST",
		dataType: "json",
		data: data
	});
}

function UserModel(url) {
	AppModel.call(this, url);
}

UserModel.prototype = Object.create(AppModel.prototype);

// var allUsers = new UserModel("/api/users");
// allUsers.fetch();
