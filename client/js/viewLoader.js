export default class ViewLoader {
	constructor() {
		this.fadeInTime = 750;
		this.fadeOutTime = 750;
		this.currentView = "";
	}

	loadView(view, fade, callback) {
		$("<div>").load("views/" + view + ".html", function() {
			if(fade) {
				$("#game_elements").append($(this).html()).hide().fadeIn(this.fadeInTime);
			} else {
				$("#game_elements").append($(this).html());
			}

			if(callback)
				callback();
		});


		this.currentView = view;
	}

	removeView(view, fade, callback) {
		if(fade) {
			$("#" + view).fadeOut(this.fadeOutTime).promise().done(function() {
				$("#" + view).detach();

				if(callback)
					callback();
			});
		} else {
			$("#" + view).detach();
		}
	}

	hideView(view, fade, callback) {
		if(fade) {
			$("#" + view).fadeOut(this.fadeOutTime).done(function() {
				if(callback)
					callback();
			});
		} else {
			$("#" + view).hide();	
		}
	}
}