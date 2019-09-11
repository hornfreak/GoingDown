// game.js for Perlenspiel 3.0

// The following comment lines are for JSLint. Don't remove them!

/*jslint nomen: true, white: true */
/*global PS */

///////////////////////////
// Title: Going Down? /////
// Author: Andrew Hudson //
// Date: 1/12/14-1/19/14 //
///////////////////////////

///////////////////////////////////////////////////
// Below are global variables & custom functions //
///////////////////////////////////////////////////

function block(x, y, color, data, glyph, gColor) {
	this.x = x;
	this.y = y;
	this.data = data;
	this.color = color;
	this.glyph = glyph;
	this.gColor = gColor;
};

block.prototype.put = function() {
	PS.color(this.x, this.y, this.color);
	PS.data(this.x, this.y, this.data);
};

block.prototype.del = function() {
	PS.color(this.x, this.y, PS.COLOR_BLUE);
	PS.data(this.x, this.y, 0);
};

block.prototype.rotate = function(i) {
	i = typeof i !== 'undefined' ? i : 1;
	for (var c = 0; c < i; c++) {
		var oldX = this.x;
		var oldY = this.y;
		this.x = oldY;
		this.y = 30 - oldX;
	}
};

var player_starts = [new block(13,15,PS.COLOR_GREEN), new block(12,15,PS.COLOR_GREEN),new block(3,3,PS.COLOR_GREEN), new block(2,7,PS.COLOR_GREEN), new block(5,4,PS.COLOR_GREEN), new block(9,2,PS.COLOR_GREEN)];

function loadLevel(lStr) {
	var ret = [];
	//print(lStr);
	var level = JSON.parse(lStr);
	for (var x = 0; x < level.length; x++) {
		ret.push(new block(level[x]['x'], level[x]['y'], level[x]['color'], level[x]['data']));
	}

	return ret;
}

function print(msg, lwe) {
	lwe = typeof lwe !== 'undefined' ? lwe : 0;
	switch(lwe) {
		case 0:
			console.log(msg);
			break;
		case 1:
			console.warn(msg);
			break;
		case 2:
			console.error(msg);
			break;
	}
}

var PUZZLE = {
	width : 31,
	height : 31,
	bgColor : PS.COLOR_BLUE,
	FRAME_RATE : 5,
	level_counter : 0,

	player : new block(13, 15, PS.COLOR_GREEN, "player"),
	allsquares : [],
	current_level : [],
	auto_rotate : false,
	timer_rotate : false,
	allow_input : false,

	paintBG : function() {
		PS.color(PS.ALL, PS.ALL, PS.COLOR_BLUE);
		PS.data(PS.ALL, PS.ALL, 0);
    PS.border(PS.ALL, PS.ALL, 0);
	},

	setup : function() {
		PS.gridSize(PUZZLE.width, PUZZLE.height);
		PS.gridColor(PUZZLE.bgColor);
		PUZZLE.paintBG();
		PS.border(PS.ALL, PS.ALL, 1);
		PS.statusText("");
		//print(level_string);
		PUZZLE.current_level = loadLevel(level_string[PUZZLE.level_counter]);
		for (var x = 0; x < PUZZLE.current_level.length; x++) {
			PUZZLE.current_level[x].put();
		}
		PUZZLE.player = player_starts[PUZZLE.level_counter];
		PUZZLE.player.put();
	},

	rotateLevel : function() {
		PUZZLE.paintBG();
		for (var x = 0; x < PUZZLE.current_level.length; x++) {
			// PUZZLE.current_level[x].del();
			PUZZLE.current_level[x].rotate();
			PUZZLE.current_level[x].put();
		}
		PUZZLE.player.rotate();
		PUZZLE.player.put();
	},

	applyStartingBlock: function(i){
		PUZZLE.player = player_starts[i];
	},

	applyNewLevel: function(){
		PS.audioPlay("fx_tada");
		PUZZLE.level_counter++;
		PUZZLE.current_level = loadLevel(level_string[PUZZLE.level_counter]);
		PUZZLE.paintBG();
		for (var x = 0; x < PUZZLE.current_level.length; x++) {
			PUZZLE.current_level[x].put();
		}
		PUZZLE.applyStartingBlock(PUZZLE.level_counter);
	},

	applyGravity : function() {
		var dataAtPlayer = PS.data(PUZZLE.player['x'], PUZZLE.player['y'] + 1);
		if (dataAtPlayer == 'wall') {
			//PS.audioPlay("fx_drip2");
			PUZZLE.allow_input = true;
			return;
		} else if (dataAtPlayer == "exit") {
			PUZZLE.applyNewLevel();
		} else {
			PUZZLE.allow_input = false;
		}
		PUZZLE.player.del();
		PUZZLE.player['y'] += 1;
		PUZZLE.player.put();
	},

	tick : function() {
		PUZZLE.applyGravity();
	}
};

/////////////////////////////////////////
// Below are the required PS functions //
/////////////////////////////////////////

PS.init = function(system, options) {"use strict";
	PUZZLE.setup();
	PS.timerStart(PUZZLE.FRAME_RATE, PUZZLE.tick);
	PS.audioLoad("fx_tada");
	PS.audioLoad("fx_drip2");
};

// Used to be PS.Click()
PS.touch = function(x, y, data, options) {"use strict";

    //console.log("x = " + x + " y = " + y + " data = " + data);

    if (x > 15) {
        if (PUZZLE.allow_input) {
            PUZZLE.rotateLevel();
            PUZZLE.rotateLevel();
            PUZZLE.rotateLevel();
        }
    } else {
        if (PUZZLE.allow_input) {
            PUZZLE.rotateLevel();
        }
    }
};
PS.release = function(x, y, data, options) {"use strict";
};

PS.enter = function(x, y, data, options) {"use strict";
};

//Used to be PS.Leave()
PS.exit = function(x, y, data, options) {"use strict";
};

// PS.exitGrid ( options )
// Called when the mouse cursor/touch exits the grid perimeter
// It doesn't have to do anything
// [options] = an object with optional parameters; see documentation for details

PS.exitGrid = function(options) {"use strict";

	// Uncomment the following line to verify operation
	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid
};

PS.keyDown = function(key, shift, ctrl, options) {"use strict";
};

PS.keyUp = function(key, shift, ctrl, options) {"use strict";
	switch(key) {
		case 112:
			// p
			auto_rotate = !auto_rotate;
			if (auto_rotate) {
				timer_rotate = PS.timerStart(30, rotateLevel);
			} else {
				PS.timerStop(timer_rotate);
			}
			break;
		case 97:
			// a
			if (PUZZLE.allow_input) {
				PUZZLE.rotateLevel();
			}
			break;
		case 100:
			// d
			if (PUZZLE.allow_input) {
				PUZZLE.rotateLevel();
				PUZZLE.rotateLevel();
				PUZZLE.rotateLevel();
			}
			break;
		case PS.KEY_ESCAPE:
			location.reload();
			break;
		default:
			console.log("You broke it! " + key);
	}
};

PS.input = function(sensors, options) {"use strict";

	// Uncomment the following block to inspect parameters

	//PS.debug("PS.input() called\n");
};

