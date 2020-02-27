import MapEditor from './mapEditor.js';

class Main {
	constructor() {
		this.mapEditor = new MapEditor();

		this.addHandlers();
	}

	addHandlers() {
		$(document).on('click', '.allow-focus', function (e) {
			e.stopPropagation();
		});

		$(window).on('beforeunload', function (e) {
			//this.mapEditor.saveMap();

			e.preventDefault();
			e.returnValue = '';

			return e.returnValue;
		});

		$(".checkbox-menu").on("change", "input[type='checkbox']", function() {
			$(this).closest("li").toggleClass("active", this.checked);
		});
	}
}

new Main();