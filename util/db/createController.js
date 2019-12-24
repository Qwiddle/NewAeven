class CreateController { 

    static _createTableIfNotExists(mysql, tableName, ifNotExists) {
        const self = this;
        let exists = 0;

        mysql.query('SELECT count(*) as count FROM information_schema.TABLES WHERE (TABLE_SCHEMA = ?) AND (TABLE_NAME = ?)', [mysql.config.database, tableName], function (err, rows) {
            if (err) {
                console.log.error(err);
                throw err;
            }

            exists = rows[0].count;

            if (exists === 0) {
                ifNotExists();
            }

        });
    }

    static _handleCreateTableError(tableName) {
        return function(error) {
            if (error) {
                console.log('mysql:: failed to created table ' + tableName + ' : ' + error);
                throw error;
            } else {
                console.log('mysql:: created table ' + tableName);
            }
        }
    }

    static _createTable(mysql, name, query) {
        const self = this;
        self._createTableIfNotExists(mysql, name, () => {
            mysql.query(query), self._handleCreateTableError(name)
        });
    }

    static createTables(mysql) {
        this._createTable(mysql, 'accounts', 
            'CREATE TABLE accounts (' + 
            'id INT unsigned UNIQUE NOT NULL AUTO_INCREMENT,' + 
            'account_name VARCHAR(64) UNIQUE NOT NULL,' + 
            'password VARCHAR(64),' + 
            'email VARCHAR(254),' +
            'ip VARCHAR(16),' +
            'created DATETIME DEFAULT CURRENT_TIMESTAMP,' +
            'last_online DATETIME ON UPDATE CURRENT_TIMESTAMP,' +
            'PRIMARY KEY (id));'
        );

        this._createTable(mysql, 'players',
            'CREATE TABLE players (' +
            'account_name VARCHAR(64) NOT NULL,' + 
            'username VARCHAR(64) NOT NULL,' +
            'sex INT unsigned NOT NULL,' +
            'race INT unsigned NOT NULL,' +
            'hair_color INT unsigned NOT NULL,' +
            'hair_style INT unsigned NOT NULL,' +
            'map INT unsigned NOT NULL,' +
            'x INT signed NOT NULL,' +
            'y INT signed NOT NULL,' +
            'dir INT unsigned NOT NULL,' +
            'PRIMARY KEY (username));'
        );

        this._createTable(mysql, 'player_stats', 
            'CREATE TABLE player_stats (' + 
            'username VARCHAR(64) UNIQUE NOT NULL,' +
            'level INT unsigned NOT NULL,' +
            'curr_hp INT unsigned NOT NULL,' +
            'max_hp INT unsigned NOT NULL,' + 
            'PRIMARY KEY (username));'
        );

        this._createTable(mysql, 'player_inventory',
            'CREATE TABLE player_inventory (' + 
            'username VARCHAR(64) UNIQUE NOT NULL,' +
            'ids TEXT COLLATE utf8_unicode_ci NOT NULL,' +
            'names TEXT COLLATE utf8_unicode_ci NOT NULL,' +
            'amounts TEXT COLLATE utf8_unicode_ci NOT NULL,' +
            'gridNumbers TEXT COLLATE utf8_unicode_ci NOT NULL,' + 
            'PRIMARY KEY (username));'
        );

        this._createTable(mysql, 'player_equipment',
            'CREATE TABLE player_equipment (' + 
            'username VARCHAR(64) UNIQUE NOT NULL,' + 
            'shirtId VARCHAR(36),' +
            'shirtName VARCHAR(64),' +
            'pantsId VARCHAR(36),' +
            'pantsName VARCHAR(64),' +
            'weaponId VARCHAR(36),' +
            'weaponName VARCHAR(64),' +
            'PRIMARY KEY (username));'
        );
    }
}

module.exports = CreateController;