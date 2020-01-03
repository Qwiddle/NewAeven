export default class LoadScene extends Phaser.Scene {
    constructor () {
        super({key: 'load'});
        this.label = "text";
    }

    init(data) {
        this.client = data.client;
    }

    preload () {
        this.loadAssets(this.cache.json.get('assets'));
        this.label = this.add.text(this.centerX(), this.centerY(), 'Loading...', { fontFamily: 'Verdana', align: 'center' });
        this.label.setOrigin(0.5);
        this.createProgressbar(this.centerX(), this.centerY() + 50);
    }

    createProgressbar (x, y) {
        const self = this;
        let width = 400;
        let height = 20;
        let xStart = x - width / 2;
        let yStart = y - height / 2;

        let borderOffset = 2;

        let borderRect = new Phaser.Geom.Rectangle(
            xStart - borderOffset,
            yStart - borderOffset,
            width + borderOffset * 2,
            height + borderOffset * 2);

        let border = this.add.graphics({
            lineStyle: {
                width: 5,
                color: 0xaaaaaa
            }
        });

        border.strokeRectShape(borderRect);

        let progressbar = this.add.graphics();

        let updateProgressbar = function (percentage) {
            progressbar.clear();
            progressbar.fillStyle(0x007f00, 1);
            progressbar.fillRect(xStart, yStart, percentage * width, height);

        };

        this.load.on('progress', updateProgressbar);

        this.load.on('load', function (file) {
            self.label.setText("Loading... " + file.url);
            console.log(file);
        }, this);

        this.load.once('complete', function () {
            this.load.off('progress', updateProgressbar);
            this.scene.start('home', { client: self.client} );
        }, this);
    }

    loadAssets (json) {
        const self = this;
        Object.keys(json).forEach(function (group) {
            Object.keys(json[group]).forEach(function (key) {
                let value = json[group][key];

                if (group === 'bitmapFont' || group === 'spritesheet') {
                    this.load[group](key, value[0], value[1]);
                }
                else if (group === 'audio') {
                    if (value.hasOwnProperty('opus') && this.sys.game.device.audio.opus) {
                        this.load[group](key, value['opus']);

                    }
                    else if (value.hasOwnProperty('webm') && this.sys.game.device.audio.webm) {
                        this.load[group](key, value['webm']);

                    }
                    else if (value.hasOwnProperty('ogg') && this.sys.game.device.audio.ogg) {
                        this.load[group](key, value['ogg']);

                    }
                    else if (value.hasOwnProperty('wav') && this.sys.game.device.audio.wav) {
                        this.load[group](key, value['wav']);
                    }
                }
                else if (group === 'html') {
                    this.load[group](key, value[0], value[1], value[2]);
                } else {     
                    this.load[group](key, value);
                }

            }, this);
        }, this);
    }

    centerX () {
        return this.sys.game.config.width / 2;
    }
    centerY () {
        return this.sys.game.config.height / 2;
    }
}