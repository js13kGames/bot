

// Init
let previousTime = 0.0;

var time = 0.0;

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var backdropScale = 1.0;
var starFieldData = ctx.createImageData(canvas.width * backdropScale, canvas.height * backdropScale);
var starFieldImage;

var brightSize = 512;
var brightData = ctx.createImageData(brightSize, brightSize);
var brightImage;

var sun = createStar(0, 0, 5000, "rgb(255, 240, 200)", "White");

var planets = Array();
var planetCount = randomIntRange(5, 11);

var camera = {x: 0, y: 0, zoom: 0.007};

generateStarfield();
generateBright();
generate();

function generatePlanet(type, radiusScale)
{
	var newPlanet;

	if(type == 0)
	{
		// Rocky planet
		var radius = randomIntRange(250, 850) * radiusScale;
		newPlanet = createPlanet(randomIntRange(25, 60), randomIntRange(140, 150), radius, 0.0, 
		randomColor(0, 1.0), randomColor(0, 0.5), randomColor(0, 1.0),
		'0, 0, 0', randomIntRange(0, 10000), 64);

	}
	else if(type == 1)
	{
		// Terra planet
		var radius = randomIntRange(300, 600) * radiusScale;

		newPlanet = createPlanet(randomIntRange(25, 30), randomIntRange(60, 140), 
		radius, radius + randomIntRange(120, 170), randomColor(1, 1.0), randomColor(1, 0.5), randomColor(1, 1.0),
		'120, 120, 255', randomIntRange(0, 10000), 64);
	}
	else if(type == 2)
	{
		// Desert planet
		var radius = randomIntRange(350, 900) * radiusScale;

		newPlanet = createPlanet(randomIntRange(15, 25), randomIntRange(40, 80), 
		radius, radius + randomIntRange(120, 170), randomColor(2, 1.0), randomColor(2, 0.5), randomColor(2, 1.0),
		'255, 120, 120', randomIntRange(0, 10000), 64);
	}
	else if(type == 3)
	{
		// Gas giant
		var radius = randomIntRange(700, 1800) * radiusScale;

		var themeColor = randomColor(3, 1.0);
	
		newPlanet = createGasPlanet(radius, radius + randomIntRange(50, 300),
		makeColorAlpha(themeColor), themeColor, randomColor(3, 1.0));
	}

	return newPlanet;
}


function generate()
{
	
	// Create a set of random planets
	for(var i = 0; i < planetCount; i++)
	{
		var type = randomIntRange(0, 3);
		
		var orbitRadius = randomIntRange(9000, 120000);

		if(type == 1 && (orbitRadius <= 20000 || orbitRadius >= 30000))
		{
			// Terras can only exist in the goldilocks zone
			type = 2;
		}

		var newPlanet = generatePlanet(type, 1.0);

		newPlanet.orbitRadius = orbitRadius
		newPlanet.orbitOffset = randomIntRange(0, 500000);
		newPlanet.center = -1;
		newPlanet.type = type;

		planets.push(newPlanet);

	}

	// Create some moons for planets
	for(var i = 0; i < planetCount; i++)
	{
		var moons = randomIntRange(0, planets[i].radius / 500);
		for(var j = 0; j < moons; j++)
		{
			var type = randomIntRange(0, 2);
			var newPlanet = generatePlanet(type, randomIntRange(25, 60) * 0.01);

			var minOrbit = planets[i].radius + newPlanet.radius * 2.5;
			var maxOrbit = planets[i].orbitRadius / 2000;

			newPlanet.orbitRadius = randomIntRange(minOrbit, minOrbit + planets[i].radius * maxOrbit);
			newPlanet.orbitOffset = randomIntRange(0, 500000);
			newPlanet.center = i;
			newPlanet.type = type;

			planets.push(newPlanet);
		}
	}

	var foundTerra = false, foundGas = false, foundDesert = false;

	for(var i = 0; i < planets.length; i++)
	{
		if(planets[i].type == 1)
		{
			foundTerra = true;
		}

		if(planets[i].type == 2)
		{
			foundDesert = true;
		}

		if(planets[i].type == 3)
		{
			foundGas = true;
		}
	}

	if(foundTerra == false || foundGas == false || foundDesert == false)
	{
		planets = [];
		seed += randomIntRange(1, 5000);
		console.log("Regenerating, did not find a must have planet");
		generate();
	}

}

function update(dt)
{
	for(var i = 0; i < planets.length; i++)
	{
		var planet = planets[i];

		var cx, cy;
		if(planet.center == -1)
		{
			cx = 0; cy = 0;
		}
		else
		{
			cx = planets[planet.center].x;
			cy = planets[planet.center].y;
		}

		var planetPos = orbit(cx, cy, planet.orbitRadius, time + planet.orbitOffset);
		planet.x = planetPos.x; planet.y = planetPos.y;
	}


	time = time + dt;
}

function render()
{
	ctx.setTransform(1, 0, 0, 1, 0, 0);

	//ctx.fillStyle = 'black';
	//ctx.fillRect(0,0,canvas.width, canvas.height);

	ctx.putImageData(starFieldData, 0, 0);

	ctx.translate(canvas.width / 2.0, canvas.height / 2.0);
	ctx.scale(camera.zoom, camera.zoom);
	ctx.translate(-camera.x, -camera.y);

	drawBright(0, 0, 125);

	for(var i = 0; i < planets.length; i++)
	{
		var planet = planets[i];
		drawPlanet(planet);
	}
	drawStar(sun);


}

const loop = time => 
{
	const dt = time - previousTime;
	previousTime = time;
	update(dt);
	render();
	window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(time => 
{
	previousTime = time;
	loop(time);
});