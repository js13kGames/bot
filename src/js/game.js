var rockNames = ["Lygkos", "Lithos", "Guamedo", "Eadu", "Anoth", "Dikti", "Big Iron", "Impetu"]
var terraNames = ["Delphi", "Trapani", "Erytrae", "Gaia", "New Earth", "Jericho", "Nile", "New London"];
var gasNames = ["Bespin", "Nuvo", "New Jupiter", "Vol", "Lightbulb", "Big Boy"];
var desertNames = ["Rhodes", "New Jairo", "Jakku", "Savareen", "Arrakis", "New Sahara"]

seed = 825;
noise.seed(seed);

// Init
let previousTime = 0.0;

var time = 0.0;

var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

var ctx = canvas.getContext("2d");
var starFieldSize = Math.floor(Math.max(canvas.width, canvas.height) * (1.0 + Math.sqrt(2)));
var starFieldData = ctx.createImageData(starFieldSize, starFieldSize);
var starFieldImage;

var brightSize = 768;
var brightData = ctx.createImageData(brightSize, brightSize);
var brightImage;



var planets = Array();
var planetCount = rrg(9, 14);

var explosions = Array();
var bullets = Array();

var sun;

// Ship 0 is always the player ship
var ships = Array();
var rings = Array();

var camera = {x: 0, y: 0, zoom: 0.5};
var aimPoint = {x: 0, y: 0}
var mousePos = {x: 0, y: 0}


var thrustSpeed = 1.0;

var mapMode = 0.0;

// 0 = Combat Mode
// 1 = Maneouver Mode
var mode = 0;

var shipMass = 0.001;

var timestep = 1.0;
var dtval = 0.0;
var lockCamera = false;


generateStarfield();
generateBright();
generate();


ships.push(createShip(0, 2400));
putShipInOrbit(ships[0], 2, 800.0, 0.0, true);
ships[0].predict = new Array();
ships[0].frame = 2;

var chooseFrame = false;
var chooseFocus = false;
var predictTimer = 0.0;

var camFocus = -1;

function update()
{
	for(var nn = 0; nn < timestep; nn++)
	{
	//	console.log("Doing " + timestep + " updates");
		var dt = dtval;
		if(timestep > 1)
		{
			dt = dt * 2.0;
		}


		for(var i = 1; i < planets.length; i++)
		{
			var planet = planets[i];
	
			var cx = planets[planet.center].x;
			var cy = planets[planet.center].y;
			var cmass = planets[planet.center].mass;
	
			var planetPos = orbit(cx, cy, cmass, planet.mass, planet.orbitRadius, time + planet.orbitOffset);
			planet.x = planetPos.x; planet.y = planetPos.y;
		}

		if(dtval > 0.0)
		{
			aimShipGuns(ships[0], aimPoint, dt);
			simulateShip(ships[0], dt);
			for(var i = 0; i < explosions.length; i++)
			{
				if(updateExplosion(explosions[i], dt))
				{
					explosions.splice(i, 1);
					i--;
				}
			}

			for(var i = 0; i < bullets.length; i++)
			{
				if(updateBullet(bullets[i], dt))
				{
					bullets.splice(i, 1);
					i--;
				}
			}

			time = time + dt;			
		}

	}
	
	if(dtval > 0.0)
	{
		aimPoint = {x: mousePos.x, y: mousePos.y};
		aimPoint.x -= canvas.width / 2.0;
		aimPoint.y -= canvas.height / 2.0;

		if(lockCamera)
		{

			var rrot = ships[0].rot + Math.PI;
			var rot = rotate(aimPoint.x, aimPoint.y, rrot);
			aimPoint.x = rot.x; aimPoint.y = rot.y;
		}
		aimPoint.x *= 1.0 / camera.zoom;
		aimPoint.y *= 1.0 / camera.zoom;

		aimPoint.x += camera.x;
		aimPoint.y += camera.y;
		
		if(camFocus == -1)
		{
			camera.x = ships[0].x;
			camera.y = ships[0].y;
		}
		else
		{
			camera.x = planets[camFocus].x;
			camera.y = planets[camFocus].y;
		}
		

		if(chooseFrame)
		{
			var coll = collidesWithAny(aimPoint, time);
			if(coll != null)
			{
				ships[0].frame = coll.planet;
			}
		}

		if(chooseFocus)
		{
			var distToShip = distance(aimPoint.x, aimPoint.y, ships[0].x, ships[0].y);
			if(distToShip < 100.0)
			{
				camFocus = -1;
			}
			else 
			{
				var coll = collidesWithAny(aimPoint, time);
				if(coll != null)
				{
					camFocus = coll.planet;
				}
			}
		}

		if(predictTimer < 0.0 || ships[0].thrust.fw != 0.0 || ships[0].thrust.side != 0.0)
		{
			predictShip(ships[0], dt);
			predictTimer = 0.5;
		}
		else 
		{
			predictTimer -= dt;
		}

	


		zoomSpeed -= zoomSpeed * dtval * 3.0;
		if(Math.abs(zoomSpeed) <= 0.1)
		{
			zoomSpeed = 0.0;
		}

		camera.zoom += camera.zoom * zoomSpeed * dtval * 0.8;

		if(camera.zoom <= 0.16)
		{	
			mapMode = Math.max(Math.min(0.04 / camera.zoom, 1.0), 0.0);
		}
		else
		{
			mapMode = 0.0;
		}

	}

}

function render()
{
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	ctx.translate(canvas.width / 2.0, canvas.height / 2.0);
	
	if(lockCamera)
	{
		ctx.rotate(-ships[0].rot - Math.PI);
	}

	ctx.translate(-starFieldSize / 2.0 - canvas.height / 2.0, -starFieldSize / 2.0 - canvas.width / 2.0);

	ctx.drawImage(starFieldImage, 0.0, 0.0);

	ctx.setTransform(1, 0, 0, 1, 0, 0);
	doCameraTransform();

	for(var i = 0; i < rings.length; i++)
	{
		drawRing(rings[i], time);
	}

	drawBright(0, 0, 125);

	for(var i = 1; i < planets.length; i++)
	{
		drawPlanet(planets[i]);
	}

	for(var i = 0; i < ships.length; i++)
	{
		drawShip(ships[i]);
	}

	for(var i = 1; i < planets.length; i++)
	{
		drawPlanetOver(planets[i]);
	}

	for(var i = 1; i < planets.length; i++)
	{
		drawPlanetShadow(planets[i]);
	}

	for(var i = 0; i < ships.length; i++)
	{
		drawShipExhaust(ships[i]);
	}

	for(var i = 0; i < explosions.length; i++)
	{
		drawExplosion(explosions[i]);
	}

	for(var i = 0; i < bullets.length; i++)
	{
		drawBullet(bullets[i]);
	}

	drawStar(sun);


	if(mapMode > 0.0)
	{
		ctx.globalAlpha = mapMode;

		for(var i = 1; i < planets.length; i++)
		{
			drawPlanetMap(planets[i]);
		}

		drawShipMap(ships[0]);

		ctx.globalAlpha = 1.0;
	}

	drawShipHud(ships[0]);

	ctx.setTransform(1, 0, 0, 1, 0, 0);
	// Static GUI
}

const loop = time => 
{
	const ndt = time - previousTime;
	previousTime = time;
	dtval = ndt / 1000.0;
	update();
	render();
	window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(time => 
{
	previousTime = time;
	loop(time);
});


function onkey(evt)
{
	var release = evt.type == "keyup";
//	console.log("Key: " + evt.code);

	var key = evt.code;
	var thrust = ships[0].thrust;

	var val = 1.0;
	if(release)
	{
		val = 0.0;
	}

	if(mode == 0)
	{
		if(key == 'KeyW')
		{
			thrust.fw = val;
		}
		else if(key == 'KeyS')
		{
			thrust.fw = -val;
		}
		else if(key == 'KeyA')
		{
			thrust.rot = -val;
		}
		else if(key == 'KeyD')
		{
			thrust.rot = val;
		}
		else if(key == 'KeyQ')
		{
			thrust.side = -val;
		}
		else if(key == 'KeyE')
		{
			thrust.side = val;
		}
	}


	if(!release)
	{
		if(key == 'KeyL')
		{
			lockCamera = !lockCamera;
		}

		if(key == 'KeyU')
		{
		}

		if(key == 'KeyP')
		{
			timestep = timestep + 1;
		}

		if(key == 'KeyO')
		{
			timestep = timestep - 1;
		}
	}
}

var zoomSpeed = 0.0;

function onwheel(evt)
{
	zoomSpeed -= Math.sign(evt.deltaY);
}

function onmouse(evt)
{
	var down = evt.type == "mousedown";

	if(evt.which == 1) // Left click
	{
		ships[0].firing = down;
	}
	else if(evt.which == 2) // Center click
	{
		chooseFocus = down;
	}
	else if(evt.which == 3)	// Right click
	{
		chooseFrame = down;
	}
}

function mousemove(evt)
{
	var pos = getMousePos(canvas, evt);
	mousePos.x = pos.x;
	mousePos.y = pos.y;
}

function getMousePos(canvas, evt) 
{
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

canvas.addEventListener("wheel", onwheel);
canvas.addEventListener("mousemove", mousemove, false);
canvas.addEventListener("mousedown", onmouse, false);
canvas.addEventListener("mouseup", onmouse, false);
document.onkeydown = document.onkeyup = onkey;
