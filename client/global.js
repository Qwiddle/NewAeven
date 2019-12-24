let global = {
	numMaps: 1,
	serverTick: 130,
	physicsTick: 115,

	Direction: {
        LEFT: 0,
        RIGHT: 1,
        UP: 2,
        DOWN: 3,
        NONE: 4,
        STATIC_LEFT: 5,
        STATIC_RIGHT: 6,
        STATIC_UP: 7,
        STATIC_DOWN: 8
    },

    tilePlayer: 9,
    tileEmpty: 0,
};

module.exports = global;