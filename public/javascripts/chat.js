var server = io.connect('http://localhost');

$("#chat-form").submit(function(e){
	var message = $("#chat-input").val();
	server.emit('updatechat', message);
	return false;
});

server.on('connect', function() {
	server.emit('user join', currentUser, currentGroup);
});

server.on('updatechat', function(data) {
	$("#chat-room").append("<div>"+data+"</div>");
});