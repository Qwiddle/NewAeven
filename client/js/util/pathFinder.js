import global from '../global.js';

export default class PathFinder {
	constructor(grid) {
		this.grid = grid;
		this.paths = new Map();
		this.x = 0;
		this.y = 0;
	}

	setGrid(grid) {
		this.grid = grid;
		this.paths = new Map();
	}

	setTarget(x, y) {
		this.x = x;
		this.y = y;
	}

	adjacentCells(x, y) {
		let adj = [
			{x: x + 1, y: y},
			{x: x, y: y + 1},
			{x: x - 1, y: y},
			{x: x, y: y - 1}
		];

		adj = adj.filter((pos) => {
			if(pos.x < 0 || pos.y < 0 || pos.x >= this.grid.length || pos.y >= this.grid[0].length) {
				return false;
			}

			if(pos.x === this.x && pos.y === this.y) {
				return true;
			}

			/*if (this.grid[pos.x][pos.y] === global.tile.wall) {
				return false;
			}*/

			return true;
		});

		return adj;
	}

	hasPath(x, y) {
		return this.paths.has(JSON.stringify({x: x, y: y}));
	}

	getPath(x, y) {
		if(this.hasPath(x, y)) {
			let pathStack = [];
			let target = JSON.stringify({x: x, y: y});
			let p1 = JSON.parse(target);
			target = this.paths.get(target);
			let p2 = JSON.parse(target);

			while (target != null) {
				let dir = 0;
				if(p1.x != p2.x) {
					if(p1.x - p2.x > 0) {
						dir = global.direction.right;
					} else {
						dir = global.direction.left;
					}
				} else {
					if(p1.y - p2.y > 0) {
						dir = global.direction.down;
					} else {
						dir = global.direction.up;
					}
				}

				pathStack.push(dir);

				p1 = p2;
				target = this.paths.get(target);
				p2 = JSON.parse(target);
			}

			return pathStack;
		} else {
			return [];
		}
	}

	search(x, y, fx, fy) {
		let frontier = [];
		this.setTarget(fx, fy);
		frontier.push({x: x, y: y});

		let visited = new Map();
		let key = {x: x, y: y};
		visited.set(JSON.stringify(key), null);

		while(frontier.length > 0) {
			let curr = frontier.shift();

			if(curr.x == fx && curr.y == fy) {
				break;
			}

			let adj = this.adjacentCells(curr.x, curr.y);

			for(let i = 0; i < adj.length; ++i) {
				if(!visited.has(JSON.stringify(adj[i]))) {
					frontier.push(adj[i]);
					visited.set(JSON.stringify(adj[i]), JSON.stringify(curr));
				}
			}
		}

		this.paths = visited;
		return visited;
	}

	research(x, y) {
		/*if(this.grid[this.x][this.y] !== global.tile.empty) {
			return [];
		}*/

		this.search(x, y, this.x, this.y);
		return this.getPath(this.x, this.y);
	}
}