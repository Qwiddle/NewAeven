export const global = {
    //server settings
    numMaps: 1,
    messageCap: 180,

    serverTick: 20,
    physicsTick: 40,

    //player settings
		defaultPosition: {
			map: 0,
			x: 15,
			y: 15
		},

		defaultDir: 0,

    //game constants
    direction: {
        left: 0,
        right: 1,
        up: 2,
        down: 3,
        none: 4,
        staticLeft: 5,
        staticRight: 6,
        staticUp: 7,
        staticDown: 8
    },

    key: {
        attack: 9
    },

    chatState: {
        none: 'none', 
        public: 'public', 
        global: 'global', 
        command: 'command'
    },

    tilePlayer: 9,
    tileEmpty: 0,
};