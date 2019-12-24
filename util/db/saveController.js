class SaveController {

    static savePlayerState(mysql, player) {
        const self = this;
        const playerData = this._getFormattedPlayerData(player);
        const playerStats = this._getFormattedPlayerStats(player);
        const playerEquipment = this._getFormattedEquipmentData(player);
        
        mysql.query('INSERT INTO `players` SET ? ON DUPLICATE KEY UPDATE ?', [playerData, playerData], self._handleSaveError);
        mysql.query('INSERT INTO `player_stats` SET ? ON DUPLICATE KEY UPDATE ?', [playerStats, playerStats], self._handleSaveError);
        mysql.query('INSERT INTO `player_equipment` SET ? ON DUPLICATE KEY UPDATE ?', [playerEquipment, playerEquipment], self._handleSaveError);
    }

    static createNewPlayer(mysql, playerData, playerStats, playerEquipment, onSuccess) {
        const self = this;
        mysql.beginTransaction(function(err) {
            if (err) {
                throw err;
            }
            mysql.query('INSERT INTO `players` SET ? ON DUPLICATE KEY UPDATE ?', [playerData, playerData], function(err, res) {
                if (err) {
                    this.rollback(function() {
                        throw err;
                    })
                }
            });
            mysql.query('INSERT INTO `player_stats` SET ? ON DUPLICATE KEY UPDATE ?', [playerStats, playerStats],  function(err, res) {
                if (err) {
                    mysql.rollback(function() {
                        throw err;
                    })
                }
            });
            mysql.query('INSERT INTO `player_equipment` SET ? ON DUPLICATE KEY UPDATE ?', [playerEquipment, playerEquipment], function(err, res) {
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
            mysql.query('INSERT INTO `player_inventory` SET ? ON DUPLICATE KEY UPDATE ?', [inventoryData, inventoryData], function(err, res) {
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
        const self = this;
        const formattedData = this._getFormattedInventoryData(player, inventory);
        mysql.query('INSERT INTO `player_inventory` SET ? ON DUPLICATE KEY UPDATE ?', [formattedData, formattedData], self._handleSaveError);
    }

    static saveAccountState(mysql, formattedAccountData) {
        const self = this;
        mysql.query('INSERT INTO `accounts` SET ? ON DUPLICATE KEY UPDATE ?', [formattedAccountData, formattedAccountData], self._handleSaveError);        
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
            hair_color: player.hair.color,
            hair_style: player.hair.style,
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
            curr_hp: player.stats.curr_hp,
            max_hp: player.stats.max_hp
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
            shirtId: player.equipment.shirt.id,
            shirtName: player.equipment.shirt.name,
            pantsId: player.equipment.pants.id,
            pantsName: player.equipment.pants.name,
            weaponId: player.equipment.weapon.id,
            weaponName: player.equipment.weapon.name
        }
    }
}

module.exports = SaveController;