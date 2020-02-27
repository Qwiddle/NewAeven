const global = {
    //server settings
    numMaps: 1,
    serverTick: 35,
    physicsTick: 45,

    //player settings
    startMapID: 0,
    startMapX: 15,
    startMapY: 15,

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

export default global;