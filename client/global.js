const global = {
	numMaps: 2,
	serverTick: 45,
	physicsTick: 45,

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

export default global;