import BootScene from './scenes/bootScene.js';
import LoadScene from './scenes/loadScene.js';
import HomeScene from './scenes/homeScene.js';
import GameScene from './scenes/gameScene.js';
import ViewLoader from './viewLoader.js';
import Client from './client.js';

const client = new Client();
const viewLoader = new ViewLoader();

window.onload = function() {
    var config = {
        type: Phaser.CANVAS,
        width: 1024,
        height: 768,
        parent: 'cvs',
        pixelArt: true,
        physics: {
            default: 'arcade',
        },
        scene: [
            BootScene, LoadScene, HomeScene, GameScene
        ]
    }

    const game = new Phaser.Game(config);

    client.connect();

    viewLoader.loadView("home", true);
    loadHandlers();
}

const loadHandlers = function() {
    $('#game_elements').on('click', '#loginbutton', function() {
        let username = $('#username').val();
        let password = $('#password').val();

        client.login(username, password);
    });

    $('#game_elements').on('click', '#ok_button', function() {
        let name = $('#name').val();

        client.createCharacter(name, 0, 0, 0, 0);
    });

    $('#game_elements').on('click', '#cancel_button', function() {
        viewLoader.removeView("charactercreation", true, function() {
            viewLoader.loadView("home", true);
        })
    });

    $('#page').on('click', '#create_button', function() {
        if(viewLoader.currentView == "register") return;

        viewLoader.removeView(viewLoader.currentView, false);
        viewLoader.loadView("register", false);
    });

    $('#page').on('click', '#play_button', function() {
        if(viewLoader.currentView == "home") return;

        viewLoader.removeView(viewLoader.currentView, false);
        viewLoader.loadView("home", false);
    });

    $('#page').on('click', '#credits_button', function() {
        if(viewLoader.currentView == "home") return;

        viewLoader.removeView(viewLoader.currentView, false);
        viewLoader.loadView("home", false);
    });

    $('#page').on('click', '#settings_button', function() {
        if(viewLoader.currentView == "home") return;

        viewLoader.removeView(viewLoader.currentView, false);
        viewLoader.loadView("home", false);
    });
}

