export class CreateController { 
	static _createTableIfNotExists(mysql, tableName, ifNotExists) {
		let exists = 0;

		mysql.query('SELECT count(*) as count FROM information_schema.TABLES WHERE (TABLE_SCHEMA = ?) AND (TABLE_NAME = ?)', [mysql.config.database, tableName], (err, rows) => {
			if (err) {
				console.error(err);
				throw err;
			}

			exists = rows[0].count;

			if (exists === 0) {
				ifNotExists();
			}
		});
	}

	static _handleCreateTableError(tableName) {
		return (error) => {
			if (error) {
				console.log('mysql:: failed to created table ' + tableName + ' : ' + error);
				throw error;
			} else {
				console.log('mysql:: created table ' + tableName);
			}
		}
	}

	static _createTable(mysql, name, query) {
		this._createTableIfNotExists(mysql, name, () => {
			mysql.query(query), this._handleCreateTableError(name)
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
			'admin INT unsigned NOT NULL DEFAULT 0,' +
			'sex INT unsigned NOT NULL,' +
			'race INT unsigned NOT NULL,' +
			'hairColor INT unsigned NOT NULL,' +
			'hairStyle INT unsigned NOT NULL,' +
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
			'hp INT unsigned NOT NULL,' +
			'maxhp INT unsigned NOT NULL,' + 
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
			'armorID VARCHAR(36),' +
			'bootsID VARCHAR(36),' +
			'weaponID VARCHAR(36),' +
			'PRIMARY KEY (username));'
		);
	}
}