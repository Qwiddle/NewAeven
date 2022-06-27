export class ViewLoader {
	constructor() {
		this.fadeInTime = 450;
		this.fadeOutTime = 450;
		this.currentView = "";
		this.previousView = "";
	}

	static loadView(view, fade, callback) {
		if(ViewLoader.currentView == view) { 
			return; 
		}

		$("<div>").load("views/" + view + ".html", function() {
			if(fade) {
				$("#views").append($(this).html()).hide().fadeIn(this.fadeInTime);
			} else {
				$("#views").append($(this).html());
			}

			if(callback)
				callback();
		});

		ViewLoader.previousView = ViewLoader.currentView;
		ViewLoader.currentView = view;
	}

	static removeView(view, fade, callback) {
		if(fade) {
			$('#' + view).fadeOut(this.fadeOutTime).promise().done(() => {
				$("#" + view).detach();

				if(callback)
					callback();
			});
		} else {
			$("#" + view).detach();
		}
	}

	static showView(view, fade, callback) {
		if(fade) {
			$("#" + view).fadeIn(this.fadeInTime).promise().done(function() {
				if(callback)
					callback();
			});
		} else {
			$("#" + view).show();
		}

		ViewLoader.previousView = ViewLoader.currentView;
		ViewLoader.currentView = view;
 	}

	static hideView(view, fade, callback) {
		if(fade) {
			$("#" + view).fadeOut(this.fadeOutTime).promise().done(function() {
				if(callback)
					callback();
			});
		} else {
			$("#" + view).hide();	
		}
	}
}