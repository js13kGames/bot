seed = 100;
noise.seed(seed);

// Init
let previousTime = 0.0;

var time = 0.0;

var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

var ctx = canvas.getContext("2d");
var backdropScale = 1.0;
var starFieldData = ctx.createImageData(canvas.width * backdropScale, canvas.height * backdropScale);
var starFieldImage;

var brightSize = 768;
var brightData = ctx.createImageData(brightSize, brightSize);
var brightImage;

var sun = createStar(0, 0, 5000, "rgb(255, 240, 200)", "White");
sun.mass = 5.0 * Math.PI * sun.radius * sun.radius;

var planets = Array();
var planetCount = rrg(5, 11);

// Ship 0 is always the player ship
var ships = Array();

var rings = Array();

var camera = {x: 0, y: 0, zoom: 0.5};

var aimPoint = {x: 0, y: 0}

generateStarfield();
generateBright();
generate();

ships.push(createShip(2, 32400));
ships[0].x = 100000.0;
ships[0].y = 100000.0;

function update(dt)
{
	for(var i = 0; i < planets.length; i++)
	{
		var planet = planets[i];

		var cx, cy, cmass;
		if(planet.center == -1)
		{
			cx = 0; cy = 0; cmass = sun.mass;
		}
		else
		{
			cx = planets[planet.center].x;
			cy = planets[planet.center].y;
			cmass = planets[planet.center].mass;
		}

		var planetPos = orbit(cx, cy, cmass, planet.orbitRadius, time + planet.orbitOffset);
		planet.x = planetPos.x; planet.y = planetPos.y;
	}

	ships[0].rot += dt * 0.4;
	var pos = orbit(planets[1].x, planets[1].y, planets[0].mass, 1200, time + 1000);
	ships[0].x = pos.x;
	ships[0].y = pos.y;
	//ships[0].rot = Math.PI * 0.0;
	//setShipThrust(ships[0], 1.0, 1.0);
	aimPoint.x = ships[0].x + Math.sin(time * 0.1) * 150.0;
	aimPoint.y = ships[0].y + Math.cos(time * 0.1) * 150.0;
	//aimPoint.x = ships[0].x;
	//aimPoint.y = ships[0].y + 100.0;

	aimShipGuns(ships[0], aimPoint, dt);
	camera.x = ships[0].x;
	camera.y = ships[0].y;


	time = time + dt * 10.0;
}

function render()
{
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	ctx.putImageData(starFieldData, 0, 0);

	doCameraTransform();

	for(var i = 0; i < rings.length; i++)
	{
		drawRing(rings[i], time);
	}

	drawBright(0, 0, 125);

	for(var i = 0; i < planets.length; i++)
	{
		drawPlanet(planets[i]);
	}

	for(var i = 0; i < ships.length; i++)
	{
		drawShip(ships[i]);
	}

	for(var i = 0; i < planets.length; i++)
	{
		drawPlanetShadow(planets[i]);
	}

	drawBright(aimPoint.x, aimPoint.y, 0.1);

	drawStar(sun);


}

const loop = time => 
{
	const dt = time - previousTime;
	previousTime = time;
	update(dt / 1000.0);
	render();
	window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(time => 
{
	previousTime = time;
	loop(time);
});

document.onkeydown = function(evt)
{
	
}

document.getElementById("canvas").addEventListener("wheel", onwheel)

function onwheel(evt)
{
	camera.zoom -= camera.zoom * 0.02 * evt.deltaY;

	if(camera.zoom <= 0.5)
	{	
		// Map mode
	}
	else
	{
		// Normal mode
	}
}