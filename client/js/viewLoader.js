export default class ViewLoader {
	constructor() {
		this.fadeInTime = 750;
		this.fadeOutTime = 750;
		this.currentView = "";
	}

	loadView(view, fade, callback) {
		console.log(view);
		if(this.currentView == view) { return; }

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
			console.log(view);
			$('#' + view).fadeOut(this.fadeOutTime).promise().done(function() {
				$("#" + view).detach();

				if(callback)
					callback();
			});
		} else {
			$("#" + view).detach();
		}

		this.currentView = view;
	}

	showView(view, fade, callback) {
		if(fade) {
			$("#" + view).fadeIn(this.fadeInTime).promise().done(function() {
				if(callback)
					callback();
			});
		} else {
			$("#" + view).show();
		}

		this.currentView = view;
 	}

	hideView(view, fade, callback) {
		if(fade) {
			$("#" + view).fadeOut(this.fadeOutTime).promise().done(function() {
				if(callback)
					callback();
			});
		} else {
			$("#" + view).hide();	
		}

		this.currentView = view;
	}
}