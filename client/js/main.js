import ViewLoader from './viewLoader.js';
import Client from './client.js';

const client = new Client();
const viewLoader = new ViewLoader();

window.onload = function() {
    loadHandlers();
    //require('nw.gui').Window.get().showDevTools();
}

const loadHandlers = function() {
    $('#game_elements').on('click', '#loginbutton', function() {
        let username = $('#username').val();
        let password = $('#password').val();

        client.login(username, password);
        //client.register(username, password, 'test@test.com');
    });

    $('#game_elements').on('click', '#charactercreation #ok_button', function() {
        let name = $('#name').val();

        client.createCharacter(name, 0, 0, 0, 0);
    });

    $('#game_elements').on('click', '#charactercreation #cancel_button', function() {
        viewLoader.removeView("charactercreation", true, function() {
            viewLoader.showView("navbuttons", true);
            viewLoader.loadView("home", true);
        })
    });

    $('#game_elements').on('click', '#register #cancel_button', function() {
        viewLoader.removeView("register", true, function() {
            viewLoader.showView("navbuttons", true);
            viewLoader.loadView("home", true);
        })
    });

     $('#game_elements').on('click', '#settings #close', function() {
        viewLoader.hideView("settings", true);
    });

     $('#game_elements').on('click', '#register #ok_button', function() {
        let username = $('#accountname').val();
        let password = $('#password').val();
        let email = $('#email').val();
        client.register(username, password, email);
    });

    $('#game_elements').on('click', '#settingsbutton', function() {
        viewLoader.showView("settings", true);

        $('#settings').draggable({
            drag: function () {
                    $(this).css("opacity", "0.5"); 
            },

            stop: function (event, ui) {
               var perc = ui.position.left / ui.helper.parent().width() * 100;
                ui.helper.css('left', perc + '%');
                $(this).css("opacity", "0.9");
            },

            cursor: "move",
            scroll: false,
            containment: "#cvs"
        }).disableSelection().css("position", "absolute");
    });

    $('#game_elements').on('click', '#chatbutton', function() {
        viewLoader.showView("chat", true);

        $('#chat').draggable({
            drag: function () {
                    $(this).css("opacity", "0.5"); 
            },

            stop: function (event, ui) {
               var perc = ui.position.left / ui.helper.parent().width() * 100;
                ui.helper.css('left', perc + '%');
                $(this).css("opacity", "0.9");
            },

            cursor: "move",
            scroll: false,
            containment: "#cvs"
        }).disableSelection().css("position", "absolute");
    });

    $('#page').on('click', '#create_button', function() {
        if(viewLoader.currentView == "register") return;

        viewLoader.removeView(viewLoader.currentView, true, function() {
            viewLoader.loadView("register", true);
        });
        
    });

    $('#page').on('click', '#play_button', function() {
        if(viewLoader.currentView == "home") return;

        viewLoader.removeView(viewLoader.currentView, true, function() {
           viewLoader.loadView("home", true); 
        }); 
    });

    $('#page').on('click', '#credits_button', function() {
        if(viewLoader.currentView == "credits") return;

        viewLoader.removeView(viewLoader.currentView, true, function() {
            viewLoader.loadView("credits", true);
        });
    });

    $('#page').on('click', '#settings_button', function() {
        if(viewLoader.currentView == "settings") return;

        viewLoader.removeView(viewLoader.currentView, true, function() {
                viewLoader.loadView("setting", true);
        });
    });
}

