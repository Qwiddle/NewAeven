class GetController {

    static getPlayer(mysql, player, loadPlayerData, createNewPlayer) {
        const self = this;
        mysql.query('SELECT * FROM players WHERE players.username=?', [player.username], (error, rows, fields) => {
            if (rows.length === 1) {            
                const data = rows.shift();
                self._logUsernameMismatch(data, player, 'player');
                loadPlayerData(player, data);
            } else {
                createNewPlayer(player);
            }
        });
    }

    static getInventory(mysql, player, loadInventoryData, createNewInventory) {
        const self = this;
        mysql.query('SELECT * FROM player_inventory WHERE player_inventory.username=?', [player.username], (error, rows, fields) => {
            if (rows.length === 1) {            
                const data = rows.shift();
                self._logUsernameMismatch(data, player, 'player');
                loadInventoryData(player, data);
            } else {
                createNewInventory(player);
            }
        });
    }

    static getAccount(mysql, username, onSuccess, onFail) {
        const self = this;
        mysql.query('SELECT * FROM accounts WHERE accounts.account_name=?', [username], (error, rows, fields) => {
            if (rows.length === 1) {
                const data = rows.shift();
                onSuccess(data);  
            } else {
                onFail();
            }
        });
    }

    static getPlayer(mysql, username, onSuccess, onFailure) {
        const self = this;
        mysql.query('SELECT * FROM players WHERE players.username=?', [username], (error, rows, fields) => {
            if (rows.length === 1) {
                const data = rows.shift();
                onSuccess(data);  
            } else {
                onFailure();
            }
        });
    }

    static getCharacters(mysql, accountName, onCharactersExist, onNoCharacters) {
        const self = this;
        mysql.query('SELECT * FROM players WHERE players.account_name=?', [accountName], (error, rows, fields) => {
            if (rows.length > 0) {
                onCharactersExist(rows);
            } else {
                onNoCharacters();
            }
        });
    }
    

    static getStats(mysql, username) {
        const self = this;
        mysql.query('SELECT * FROM `player_stats` WHERE `player_stats.username`=?', [username], (error, rows, fields) => {
            const data = rows.shift();

            self._logUsernameMismatch(data, player, 'player_stats');

        });
    }

    static getAllPlayerData(mysql, player, loadPlayer) {
        const self = this;
        mysql.query('SELECT * FROM players INNER JOIN player_inventory ON players.username = player_inventory.username INNER JOIN player_stats ON players.username = player_stats.username INNER JOIN player_equipment ON player_equipment.username = players.username WHERE players.username=?', [player.username], (error, rows, fields) => {
            if (rows.length === 1) {            
                const data = rows.shift();
                self._logUsernameMismatch(data, player, 'all_player_data');
                loadPlayer(player, data);
            }
        });
    }

    static _logUsernameMismatch(data, player, dataType) {
        if (data.username !== player.username) {
            console.log('Mismatch while retrieving ' + dataType + ' data for: ' + player.username);
        }
    }
}

module.exports = GetController;