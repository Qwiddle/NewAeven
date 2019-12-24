$("<div>").load("views/home.html", function() {
	$("#game_elements").append($(this).html());
});