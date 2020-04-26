module.exports = class CombatManager {
	static attack(source, target) {
		//get formulas for health
		target.stats.hp--;

		if(this.isDead(target)) {
			//handle death
		}
	}

	static isDead(entity) {
		return entity.stats.hp <= 0;
	}
}