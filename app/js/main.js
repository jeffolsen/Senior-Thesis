var tileSize = 16;
var worldHeight = 40;
var worldWidth = 60;

var monsters = [];
var solidGround = [];
var backGround = [];
var currentDarkness = [];

var light;
var animate;

$(document).ready(function() {
	init();
});

function init() {

	//********* Initialize solidGround, currentDarkness; Build Darkness Tiles ********//

	var source = $('#dark-template').html();
	var template = Handlebars.compile(source);

	for (var y = 0; y < worldHeight; y++) {
		var s = [];
		var d = [];
		var b = [];

		for (var x = 0; x < worldWidth; x++) {
			s.push('..');
			b.push('..');
			d.push(1.0);

			$('#world').append(template({
				id: '3_' + y + '_' + x + '_dark',
				y: y + 'y',
				x: x + 'x',
				tilesize: tileSize + 'px',
				zindex: 4,
				top: (y * tileSize) + 'px',
				left: (x * tileSize) + 'px',
				opacity: '1.0'
			}));
		}
		solidGround.push(s);
		backGround.push(b);
		currentDarkness.push(d);	
	} 
	
	light = new Light();
	animate = new Animate();
//	songs = new SoundPlayer();


	//**************** Build World Tiles, assign lightSources *****************//

	source = $('#tile-template').html();
	template = Handlebars.compile(source);
	var blockSize = 20;
	var lightSources = 4;

	for (var layer in level) {
		for (var block in level[layer]) {
			for (var y = 0; y < level[layer][block].length; y++) {

				var row = level[layer][block][y].split(' ');

				for (var x = 0; x < row.length; x++) {

					// register with jquery and dom
					if (row[x] != '..') {
						var zPosition = parseInt(layer);
						var yPosition = (parseInt(block[0]) * blockSize + y);
						var xPosition = (parseInt(block[1]) * blockSize + x); 
						//console.log(row[x]);
						//console.log(actors);
						var image = actors[row[x]].image;
						var type = actors[row[x]]['type'];
						var id = zPosition + '_' + yPosition + '_' + xPosition;

						$('#world').append(template({
							id: id,
							z: zPosition + 'z',
							y: yPosition + 'y',
							x: xPosition + 'x',
							type: type,
							zindex: zPosition,
							tilesize: tileSize + 'px',
							top: (yPosition * tileSize) + 'px',
							left: (xPosition * tileSize) + 'px',
							graphic: image
						}));

						// add to monsters 1D array
						if (layer == '1') {
							
							var monster = actors[row[x]].action(id);
							monsters.push(monster);
							
							if(lightSources > 0) {
								if (Math.random() < .45) {
									light.addSource(monster);
									lightSources--;
								}
							}
						}

						// add to solidground 2D array
						if (layer == '2') {
							solidGround[yPosition][xPosition] = row[x];
						}

						if (layer == '0') {
							backGround[yPosition][xPosition] = row[x];
						}
					}
				}
			}
		}
	}
		
	//************************* Start Loops **************************//

	setInterval(light.update, 500);
	setInterval(light.draw, 250);
	setInterval(animate, 1500);
//	songs();
	
	for (var i = 0; i < monsters.length; i++) {
		monsters[i]();
	}
}

function Light() {
	var sources = [];
	var lastDarkness = [];
	var diagonals = [];

	for (var y = 0; y < worldHeight; y++) {
		lastDarkness[y] = [];

		for (var x = 0; x < worldWidth; x++) {
			lastDarkness[y][x] = 1.0;
		}
	}
	
	this.sources = function() {
		return sources;
	}	

	this.addSource = function(monster) {
		monster.takeLight();
		sources.push(monster);
	}

	this.swapSource = function(index, giver, receiver) {
		giver.giveLight();
		receiver.takeLight();
		sources[index] = receiver;
	}

  	var phase = 0;
  
	this.update = function() {
    		phase++;
    		phase %= 6;
		for (var y = phase; y < currentDarkness.length; y += 6) {
			var pointPositionY = y;

			for (var x = 0; x < currentDarkness[y].length; x++) {
				var pointPositionX = x;
				currentDarkness[y][x] = 1.0;

				for (var source = 0; source < sources.length; source++) {
					var darkness = 1.0;

					var sourceCenter = sources[source].position();

					var pointToCenter = Math.sqrt(
							(pointPositionX - sourceCenter[1]) *
							(pointPositionX - sourceCenter[1]) + 
							(pointPositionY - sourceCenter[0]) *
							(pointPositionY - sourceCenter[0])
							);

					var radius = 4.25;

					if (pointToCenter < radius) {
						darkness = 0;
					} else if (pointToCenter < radius + 1.35) {
						darkness = .5;
					} 

					if (currentDarkness[y][x] > darkness) {
						currentDarkness[y][x] = darkness;
					}
				}
			}
		}
	}
	var pointer = 0;
	this.draw = function() {
		if (diagonals.length == 0) {
			pointer += tileSize % (tileSize * 4);
			for (var i = 0; i < worldWidth; i++) {
				diagonals[i] = i;
			}
		}

		for (var i = 0; i < 10; i++) {
			var x = diagonals.splice(Math.floor(Math.random() * diagonals.length), 1);
			
			for (var y = 0; y < worldHeight; y++) {

				if (lastDarkness[y][x] != currentDarkness[y][x]) {
					$('#3_' + y + '_' + x + '_dark').css('opacity', currentDarkness[y][x]);
				}

				if(lastDarkness[y][x] != 1.0) {
					$('#0_' + y + '_' + x).css('background-position', pointer);
					$('#2_' + y + '_' + x).css('background-position', pointer);
				}

				lastDarkness[y][x] = currentDarkness[y][x];

				if (x == 0) {
					x = worldWidth - 1;
					continue;
				}
				x--;
			}
		}
	}
}

function Animate() {
	var pointer = 0;
	var normal = 0;
	var ice = 32;
	var fire = 16;

	dance = function() {
		if (pointer == 0) {
			pointer = tileSize * 1;
		} else if (pointer == tileSize * 1) {
			pointer = tileSize * 2;
		} else if (pointer == tileSize * 2) {
			pointer = tileSize * 3;
		} else if (pointer == tileSize * 3) {
			pointer = 0;
		}

		var monstersInLight = [];

		for (var m = 0; m < monsters.length; m++) {
			var pixelPosition = monsters[m].position();
			var monsterY = pixelPosition[0];
			var monsterX = pixelPosition[1];

			if (currentDarkness[monsterY][monsterX] != 1.0) {
				if (monsters[m].hasLight() == false) {
					monstersInLight.push(monsters[m]);
				}

				if (backGround[monsterY][monsterX] == 'b1'
				||  backGround[monsterY][monsterX] == 'b2'
				||  backGround[monsterY][monsterX] == 'b3'
				||  backGround[monsterY][monsterX] == 'n3'
				||  backGround[monsterY][monsterX] == 'n7') {

					$('#' + monsters[m].id()).css('background-position', pointer + 'px ' + ice + 'px');

				} else if (backGround[monsterY][monsterX] == 'l1'
				       ||  backGround[monsterY][monsterX] == 'n2'
				       ||  backGround[monsterY][monsterX] == 'n6') {

					$('#' + monsters[m].id()).css('background-position', pointer + 'px ' + fire + 'px');

				} else {

					$('#' + monsters[m].id()).css('background-position', pointer + 'px ' + normal + 'px');

				}
			}
		}
		
		for (var source = 0; source < light.sources().length; source++) {

			if (light.sources()[source].keepLight() == 0) {
				var sourcePosition = light.sources()[source].position();

				for (var inLight = 0; inLight < monstersInLight.length; inLight++) {

					var inLightPosition = monstersInLight[inLight].position();
					var distance = Math.sqrt(
								(sourcePosition[0] - inLightPosition[0]) * 
								(sourcePosition[0] - inLightPosition[0]) +
								(sourcePosition[1] - inLightPosition[1]) * 
								(sourcePosition[1] - inLightPosition[1]) 
								);
					if (distance < 2) {
						light.swapSource(source, light.sources()[source], monstersInLight[inLight]);
					}
				}
			}
		}
	}	

	return dance;
}
