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
var planetCount = randomIntRange(5, 11);

var rings = Array();

var camera = {x: 0, y: 0, zoom: 0.5};

generateStarfield();
generateBright();
generate();


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

	camera.x = planets[2].x;
	camera.y = planets[2].y;
	camera.zoom = 0.05;


	time = time + dt * 10.0;
}

function render()
{
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	ctx.putImageData(starFieldData, 0, 0);

	ctx.translate(canvas.width / 2.0, canvas.height / 2.0);
	ctx.scale(camera.zoom, camera.zoom);
	ctx.translate(-camera.x, -camera.y);

	for(var i = 0; i < rings.length; i++)
	{
		drawRing(rings[i], time);
	}

	drawBright(0, 0, 125);

	for(var i = 0; i < planets.length; i++)
	{
		drawPlanet(planets[i]);
	}

	for(var i = 0; i < planets.length; i++)
	{
		drawPlanetShadow(planets[i]);
	}

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