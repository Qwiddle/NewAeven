export default class SaveController {
	static savePlayerState(mysql, player) {
		const playerData = this._getFormattedPlayerData(player);
		const playerStats = this._getFormattedPlayerStats(player);
		const playerEquipment = this._getFormattedEquipmentData(player);
		
		mysql.query('INSERT INTO `players` SET ? ON DUPLICATE KEY UPDATE ?', [playerData, playerData], this._handleSaveError);
		mysql.query('INSERT INTO `player_stats` SET ? ON DUPLICATE KEY UPDATE ?', [playerStats, playerStats], this._handleSaveError);
		mysql.query('INSERT INTO `player_equipment` SET ? ON DUPLICATE KEY UPDATE ?', [playerEquipment, playerEquipment], this._handleSaveError);
	}

	static createNewPlayer(mysql, playerData, playerStats, playerEquipment, onSuccess) {
		mysql.beginTransaction((err) => {
			if (err) {
				throw err;
			}

			mysql.query('INSERT INTO `players` SET ? ON DUPLICATE KEY UPDATE ?', [playerData, playerData], (err, res) => {
				if (err) {
					mysql.rollback(function() {
						throw err;
					})
				}
			});

			mysql.query('INSERT INTO `player_stats` SET ? ON DUPLICATE KEY UPDATE ?', [playerStats, playerStats], (err, res) => {
				if (err) {
					mysql.rollback(function() {
						throw err;
					})
				}
			});

			mysql.query('INSERT INTO `player_equipment` SET ? ON DUPLICATE KEY UPDATE ?', [playerEquipment, playerEquipment], (err, res) => {
				if (err) {
					mysql.rollback(function() {
						throw err;
					})
				}
			});

			const inventoryData = {
				username: playerData.username,
				ids: '',
				names: '',
				amounts: '',
				gridNumbers: '',
			}

			mysql.query('INSERT INTO `player_inventory` SET ? ON DUPLICATE KEY UPDATE ?', [inventoryData, inventoryData], (err, res) => {
				if (err) {
					mysql.rollback(function() {
						throw err;
					})
				}
			});

			mysql.commit(function(err) {
				if (err) {
					mysql.rollback(function() {
						throw err;
					})
				}
				onSuccess();
			});
		});
	}

	static saveInventoryState(mysql, player, inventory) {
		const formattedData = this._getFormattedInventoryData(player, inventory);
		mysql.query('INSERT INTO `player_inventory` SET ? ON DUPLICATE KEY UPDATE ?', [formattedData, formattedData], this._handleSaveError);
	}

	static saveAccountState(mysql, formattedAccountData) {
		mysql.query('INSERT INTO `accounts` SET ? ON DUPLICATE KEY UPDATE ?', [formattedAccountData, formattedAccountData], this._handleSaveError);        
	}

	static _handleSaveError(error, result) {
		if (error) {
			console.log(error);
		}
	}

	static _getFormattedPlayerData(player) {
		return {
			account_name: player.accountname,
			username: player.username,
			sex: player.sex,
			race: player.race,
			hairColor: player.hair.color,
			hairStyle: player.hair.style,
			map: player.map,
			x: player.pos.x,
			y: player.pos.y,
			dir: player.dir
		};
	}

	static _getFormattedPlayerStats(player) {
		return {
			username: player.username,
			level: player.stats.level,
			hp: player.stats.hp,
			maxhp: player.stats.maxhp
		}
	}

	static _getFormattedInventoryData(player, inventory) {
		let formattedData = {
			username: player.username,
			ids: '',
			names: '',
			amounts: '',
			gridNumbers: '',
		}

		for (let i = 0; i < inventory.length; i++) {
			if (!inventory[i]) continue;
			const item = inventory[i];
			formattedData.ids += item.id + ' ';
			formattedData.names += item.name + ' ';
			formattedData.amounts += item.amount + ' ';
			formattedData.gridNumbers += item.gridNumber + ' ';
		}

		return formattedData;
	}

	static _getFormattedEquipmentData(player) {
		return {
			username: player.username, 
			armorID: player.equipment.armor.id,
			bootsID: player.equipment.boots.id,
			weaponID: player.equipment.weapon.id,
		}
	}
}