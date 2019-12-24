import BootScene from './scenes/bootScene.js';
import LoadScene from './scenes/loadScene.js';
import HomeScene from './scenes/homeScene.js';
import GameScene from './scenes/gameScene.js';
import Client from './client.js';

window.onload = function() {
    var config = {
        type: Phaser.AUTO,
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
    const client = new Client();
    client.connect();

    $('#loginbutton').click(function() {
        let username = $('#username').val();
        let password = $('#password').val();

        client.login(username, password);
    });
}

