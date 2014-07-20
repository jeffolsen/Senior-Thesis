var actors = { 
	'a1': {
		type: "snail", 
		image: "img/Sprite-Snail.png",
		action: function(id) {
			var y = $('#' + id).position().top / tileSize;
			var x = $('#' + id).position().left / tileSize;

			var hasLight = false;
			var keepLight = 0;

			var position = [];
			position.push(y);
			position.push(x);
			var inFrontY;
			var inFrontX;
			var underY;
			var underX;

			var rotation = 0;
			var rotateUp = -90;
			var rotateDown = 90;
	 
			var move = function () {
				if (keepLight > 0) {
					keepLight--;
				}

				var forwardTheta = rotation * (Math.PI / 180);
				inFrontY = Math.round(position[0] + 1 * Math.sin(forwardTheta));
				inFrontX = Math.round(position[1] + 1 * Math.cos(forwardTheta));				

				var downTheta = (rotation + rotateDown) * (Math.PI / 180);
				underY = Math.round(inFrontY + 1 * Math.sin(downTheta));
				underX = Math.round(inFrontX + 1 * Math.cos(downTheta));

				if (solidGround[inFrontY][inFrontX] != '..') {
					rotation += rotateUp;

				} else if (solidGround[underY][underX] != '..') {
					position[0] = inFrontY;
					position[1] = inFrontX;

				} else {
					rotation += rotateDown;
					position[0] = underY;
					position[1] = underX;
				}

				$('#' + id).animate({
					rotate: rotation + 'deg',
					top: (position[0] * tileSize) + 'px',
					left: (position[1] * tileSize) + 'px' 
				}, 2000, move);//3500
			}
      
      			move.id = function() {
        			return id;
      			}

			move.position = function() {
				return position;
			}

			move.hasLight = function() {
				return hasLight;
			}

			move.takeLight = function() {
				hasLight = true;
				keepLight = 4;
			}

			move.giveLight = function() {
				hasLight = false;
			}

			move.keepLight = function() {
				return keepLight;
			}
			
			return move;
		}
	},
	'a2': {
		type: "spider", 
		image: "img/Sprite-Spider.png",
		action: function(id) {
			var y = $('#' + id).position().top / tileSize;
			var x = $('#' + id).position().left / tileSize;

			var hasLight = false;
			var keepLight = 0;

			var position = [];
			position.push(y);
			position.push(x);

			var orientation = 0;
			var ceiling = 0;
			var floor = 180;
			var ground = -1;

			var direction = 1;
	 
			var move = function () {
				if (keepLight > 0) {
					keepLight--;
				}

				var nextPosition = [];
				var jumpPosition = [];
				var walkPosition = [];
				jumpPosition[0] = position[0];
				jumpPosition[1] = position[1];
				walkPosition[0] = position[0];
				walkPosition[1] = position[1];
				var distance = 0;
				
				for (var step = 0; step < 7; step++) {
					jumpPosition[0] -= ground;
					distance++;

					if (solidGround[jumpPosition[0]][jumpPosition[1]] != '..') {
						jumpPosition[0] += ground;
						distance--;
						break;
					}			
				}

				if (solidGround[jumpPosition[0] - ground][jumpPosition[1]] == '..') {
					jumpPosition[0] = position[0];
				} else if (Math.random() < .15){
					ground *= -1;
					position[0] = jumpPosition[0];
					position[1] = jumpPosition[1];

					$('#' + id).animate({
						top: (jumpPosition[0] * tileSize) + 'px',
						left: (jumpPosition[1] * tileSize) + 'px'
					}, distance * 1000, move);//2000
					
					return;
				}

				if (solidGround[walkPosition[0]][walkPosition[1] + direction] != '..'
				|| solidGround[walkPosition[0] + ground][walkPosition[1] + direction] == '..') {

					if (jumpPosition[0] != walkPosition[0]) {
						nextPosition[0] = jumpPosition[0];
						
						if (solidGround[jumpPosition[0]][jumpPosition[1] + direction] != '..') {
							direction *= -1;
						}
					} else {
						direction *= -1;
					}
				}
				walkPosition[1] += direction;

				if (nextPosition[0] == jumpPosition[0] ) { 
					nextPosition[1] = jumpPosition[1];
					ground *= -1;
				}
				else {
					nextPosition[0] = walkPosition[0];
					nextPosition[1] = walkPosition[1];
					distance = 2;
				}

				position[0] = nextPosition[0];
				position[1] = nextPosition[1];

				$('#' + id).animate({
					top: (nextPosition[0] * tileSize) + 'px',
					left: (nextPosition[1] * tileSize) + 'px'
				}, distance * 1000, move);//2000	
			}

      			move.id = function() {
        			return id;
      			}

			move.position = function() {
				return position;
			}

			move.hasLight = function() {
				return hasLight;
			}

			move.takeLight = function() {
				hasLight = true;
				keepLight = 4;
			}

			move.giveLight = function() {
				hasLight = false;
			}

			move.keepLight = function() {
				return keepLight;
			}
			
			return move;
		}
	},
	'a3': {
		type: "fly", 
		image: "img/Sprite-Fly.png",
		action: function(id) {
			var y = $('#' + id).position().top / tileSize;
			var x = $('#' + id).position().left / tileSize;

			var hasLight = false;
			var keepLight = 0;
			
			var position = [];
			position.push(y);
			position.push(x);
			
			var directions = {
				0: [0, 1],
				1: [1, 0] ,
				2: [0, -1] ,
				3: [-1, 0]
			};

			var move = function() {
				if (keepLight > 0) {
					keepLight--;
				}

				var destinations = [];
				destinations[0] = { y: 0, x: 0, steps: 0 };
				destinations[1] = { y: 0, x: 0, steps: 0 };
				destinations[2] = { y: 0, x: 0, steps: 0 };
				destinations[3] = { y: 0, x: 0, steps: 0 };

				for (var i = 0; i < destinations.length; i++) {
					destinations[i]['y'] += position[0];
					destinations[i]['x'] += position[1];
				}

				for (var i = 0; i < destinations.length; i++) {
					for (var step = 0; step < 3; step++) {

						if (Math.random() > .75
						||  solidGround[destinations[i]['y'] + directions[i][0]]
						    [destinations[i]['x'] + directions[i][1]] != '..') {
							break;
						}

						destinations[i]['y'] += directions[i][0];
						destinations[i]['x'] += directions[i][1];
						destinations[i]['steps']++;
					}
				}				

				for(var j, x, i = destinations.length; i; j = Math.floor(Math.random() * i),
				x = destinations[--i], destinations[i] = destinations[j], destinations[j] = x);	

				destinations.sort(function(a, b) {
					if (a.steps < b.steps) {
						return -1;
					}
					if (a.steps > b.steps) {
						return 1;
					}
					return 0;
				});		
				
				position[0] = destinations[3]['y'];
				position[1] = destinations[3]['x'];

				$('#' + id).animate({
					top: (destinations[3]['y'] * tileSize) + 'px',
					left: (destinations[3]['x'] * tileSize) + 'px'
				}, 3000, move);	//5000
			}

      			move.id = function() {
        			return id;
      			}

			move.position = function() {
				return position;
			}

			move.hasLight = function() {
				return hasLight;
			}

			move.takeLight = function() {
				hasLight = true;
				keepLight = 4;
			}

			move.giveLight = function() {
				hasLight = false;
			}
			
			move.keepLight = function() {
				return keepLight;
			}

			return move;
		}
	},

	'b1': {
		type: "water", 
		image: "img/Sprite-WaterSurface.png"
	},

	'b2': {
		type: "water", 
		image: "img/Sprite-Water.png"
	},

	'b3': {
		type: "water", 
		image: "img/Sprite-WaterFall.png"
	},

	's1': {
		type: "sky", 
		image: "img/Sprite-Sky.png"
	},	 
 
	'g1': {
		type: "grass", 
		image: "img/Sprite-Grass.png"
	},
	'g2': {
		type: "grass", 
		image: "img/Sprite-GrassLeft.png"
	},

	'g3': {
		type: "grass", 
		image: "img/Sprite-GrassRight.png"
	},

	'c1': {
		type: "grass", 
		image: "img/Sprite-Cliff.png"
	},
	'c2': {
		type: "grass", 
		image: "img/Sprite-CliffLeft.png"
	},

	'c3': {
		type: "grass", 
		image: "img/Sprite-CliffRight.png"
	},

	'd1': {
		type: "grass", 
		image: "img/Sprite-BrickTop.png"
	},
	'd2': {
		type: "grass", 
		image: "img/Sprite-BrickTopLeft.png"
	},

	'd3': {
		type: "grass", 
		image: "img/Sprite-BrickTopRight.png"
	},	

	'e1': {
		type: "snow", 
		image: "img/Sprite-Snow.png"
	},

	'e2': {
		type: "snow", 
		image: "img/Sprite-SnowLeft.png"
	},

	'e3': {
		type: "snow", 
		image: "img/Sprite-SnowRight.png"
	},

	'e4': {
		type: "snow", 
		image: "img/Sprite-IceTop.png"
	},

	'e5': {
		type: "snow", 
		image: "img/Sprite-SnowTopLeft.png"
	},

	'e6': {
		type: "snow", 
		image: "img/Sprite-SnowTopRight.png"
	},

	'e7': {
		type: "snow", 
		image: "img/Sprite-SnowBottom.png"
	},

	'e8': {
		type: "snow", 
		image: "img/Sprite-SnowBottomLeft.png"
	},

	'e9': {
		type: "snow", 
		image: "img/Sprite-SnowBottomRight.png"
	},

	'e0': {
		type: "snow", 
		image: "img/Sprite-SnowMiddle.png"
	},

	'h1': {
		type: "snow", 
		image: "img/Sprite-SnowCliff.png"
	},

	'h2': {
		type: "snow", 
		image: "img/Sprite-SnowCliffLeft.png"
	},

	'h3': {
		type: "snow", 
		image: "img/Sprite-SnowCliffRight.png"
	},

	't1': {
		type: "leaf", 
		image: "img/Sprite-LeafBottom.png"
	},

	't2': {
		type: "leaf", 
		image: "img/Sprite-LeafBottomLeft.png"
	},

	't3': {
		type: "leaf", 
		image: "img/Sprite-LeafBottomRight.png"
	},

	't4': {
		type: "leaf", 
		image: "img/Sprite-Leaf.png"
	},

	'f1': {
		type: "foliage", 
		image: "img/Sprite-Foliage.png"
	},

	'f2': {
		type: "foliage", 
		image: "img/Sprite-FoliageTop.png"
	},

	'f3': {
		type: "foliage", 
		image: "img/Sprite-FoliageTopLeft.png"
	},

	'f4': {
		type: "foliage", 
		image: "img/Sprite-FoliageTopRight.png"
	},

	'f5': {
		type: "foliage", 
		image: "img/Sprite-FoliageBottom.png"
	},

	'f6': {
		type: "foliage", 
		image: "img/Sprite-FoliageBottomLeft.png"
	},

	'f7': {
		type: "foliage", 
		image: "img/Sprite-FoliageBottomRight.png"
	},

	'p1': {
		type: "dirt", 
		image: "img/Sprite-Dirt.png"
	},

	'p2': {
		type: "dirt", 
		image: "img/Sprite-DirtBottom.png"
	},

	'p3': {
		type: "dirt", 
		image: "img/Sprite-DirtTop.png"
	},

	'p4': {
		type: "dirt", 
		image: "img/Sprite-DirtTopLeft.png"
	},

	'p5': {
		type: "dirt", 
		image: "img/Sprite-DirtTopRight.png"
	},

	'p6': {
		type: "dirt", 
		image: "img/Sprite-DirtBottomLeft.png"
	},

	'p7': {
		type: "dirt", 
		image: "img/Sprite-DirtBottomRight.png"
	},

	'm1': {
		type: "marble", 
		image: "img/Sprite-Brick.png"
	},

	'm2': {
		type: "marble", 
		image: "img/Sprite-CastleTop.png"
	},

	'm3': {
		type: "marble", 
		image: "img/Sprite-CastleDown.png"
	},

	'm4': {
		type: "marble", 
		image: "img/Sprite-CastleLeft.png"
	},

	'm5': {
		type: "marble", 
		image: "img/Sprite-CastleRight.png"
	},

	'm6': {
		type: "marble", 
		image: "img/Sprite-CastleTopRight.png"
	},

	'm7': {
		type: "marble", 
		image: "img/Sprite-CastleTopLeft.png"
	},

	'm8': {
		type: "marble", 
		image: "img/Sprite-CastleDownRight.png"
	},

	'm9': {
		type: "marble", 
		image: "img/Sprite-CastleDownLeft.png"
	},

	'o1': {
		type: "marble", 
		image: "img/Sprite-PillarLeft.png"
	},

	'o2': {
		type: "marble", 
		image: "img/Sprite-PillarRight.png"
	},

	'n1': {
		type: "cave", 
		image: "img/Sprite-GrassCave.png"
	},

	'n2': {
		type: "cave", 
		image: "img/Sprite-HotCave.png"
	},

	'n3': {
		type: "cave", 
		image: "img/Sprite-ColdCave.png"
	},

	'n4': {
		type: "cave", 
		image: "img/Sprite-MushroomCave.png"
	},

	'n5': {
		type: "cave", 
		image: "img/Sprite-CeilingMushroomCave.png"
	},

	'n6': {
		type: "cave", 
		image: "img/Sprite-CandleCave.png"
	},

	'n7': {
		type: "cave", 
		image: "img/Sprite-SnowMan.png"
	},

	'l1': {
		type: "lava", 
		image: "img/Sprite-Lava.png"
	}
};
