
function generateBright()
{
	for(var y = 0; y < brightSize; y++)
	{
		for(var x = 0; x < brightSize; x++)
		{
			var b = 0.0;

			var i = y * brightSize + x;

			var xabs = (x - brightSize / 2.0);
			var yabs = (y - brightSize / 2.0);

			var factor = brightSize / ((xabs * xabs + yabs * yabs) / 6.0);

			b = factor;
			var polar = Math.atan2(yabs, xabs);
			b += noise.perlin2(polar * 15.0, 0.0) * 0.6;
			b -= 1.0 - Math.pow(factor, 0.03);

			var abbrf = Math.max(1.0 - ((factor - 1.0) * (factor - 1.0)), 0.0);
			var abbgf = Math.max(1.0 - ((factor - 1.2) * (factor - 1.2)), 0.0);
			var abbbf = Math.max(1.0 - ((factor - 1.4) * (factor - 1.4)), 0.0);

			var abbr = noise.perlin2(polar * 8.0, 1.0) * abbrf + abbrf;
			var abbg = noise.perlin2(polar * 16.0, 7.0) * abbgf + abbgf;
			var abbb = noise.perlin2(polar * 32.0, 15.0) * abbbf + abbbf;

			brightData.data[i * 4 + 0] = b * 200 + abbr * 128;
			brightData.data[i * 4 + 1] = b * 160 + abbg * 118;
			brightData.data[i * 4 + 2] = b * 128 + abbb * 98;
			brightData.data[i * 4 + 3] = b * 255;
		}
	}

	brightImage = imageDataToImage(brightData);
}

function generateStarfield()
{
	for(var y = 0; y < canvas.height * backdropScale; y++)
	{
		for(var x = 0; x < canvas.width * backdropScale; x++)
		{
			var i = y * canvas.width * backdropScale + x;

			var r = 0;
			var g = 0;
			var b = 0;

			var noise0 = noise.perlin2(x * 0.001, y * 0.001);
			var noise1 = noise.perlin2(x * 0.01 + noise0, y * 0.01 + noise0);
			var noise2 = noise.perlin2(x * 0.05, y * 0.05);
			var noise3 = noise.perlin2(x * 0.01 + 5.0, y * 0.01 + 5.0);
			
			r = (noise1 + noise2 + noise0) * 255;
			g = r * 0.7 + noise3 * 60;
			b = r * 0.5 + noise3 * 128;

			if(randomIntRange(0, 10000) >= 9995)
			{
				r = 255; g = 255; b = 255;
			}
			else
			{
				var factor = 0.25;
				r = r * factor; g = g * factor; b = b * factor;
			}

			starFieldData.data[i * 4 + 0] = r;
			starFieldData.data[i * 4 + 1] = g;
			starFieldData.data[i * 4 + 2] = b;
			starFieldData.data[i * 4 + 3] = 255;
		}
	}

	starFieldImage = imageDataToImage(starFieldData);
}


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

		newPlanet = createPlanet(randomIntRange(25, 30), randomIntRange(90, 160), 
		radius, radius + randomIntRange(120, 170), randomColor(1, 1.0), randomColor(1, 0.5), randomColor(1, 1.0),
		'120, 120, 255', randomIntRange(0, 10000), 64);
	}
	else if(type == 2)
	{
		// Desert planet
		var radius = randomIntRange(350, 900) * radiusScale;

		newPlanet = createPlanet(randomIntRange(15, 25), randomIntRange(80, 120), 
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
	else if(type == 4)
	{
		// Asteroid
		var radius = randomIntRange(40, 120) * radiusScale;
		newPlanet = createPlanet(randomIntRange(25, 60), randomIntRange(140, 150), radius, 0.0, 
		randomColor(2, 1.0), randomColor(2, 0.5), randomColor(2, 1.0),
		'0, 0, 0', randomIntRange(0, 10000), 32);
	}

	newPlanet.mass = 4.0 * Math.PI * newPlanet.radius * newPlanet.radius;

	return newPlanet;
}


function generate()
{
	
	// Create a set of random planets
	for(var i = 0; i < planetCount; i++)
	{
		var type = randomIntRange(0, 4);
		
		var orbitRadius = randomIntRange(9000, 120000);

		if(type == 1 && (orbitRadius <= 40000 || orbitRadius >= 80000))
		{
			// Terras can only exist in the goldilocks zone
			type = 2;
		}

		var newPlanet = generatePlanet(type, 1.0);

		newPlanet.orbitRadius = orbitRadius
		newPlanet.orbitOffset = randomIntRange(-50000, 50000);
		newPlanet.center = -1;
		newPlanet.type = type;

		planets.push(newPlanet);

	}

	// Create some moons and rings
	for(var i = 0; i < planetCount; i++)
	{
		var moons = randomIntRange(0, planets[i].radius / 350);
		for(var j = 0; j < moons; j++)
		{
			var type = randomIntRange(0, 4);
			if(type == 3)
			{
				type = 0;
			}
			var newPlanet = generatePlanet(type, randomIntRange(25, 60) * 0.01);

			if(newPlanet.radius >= planets[i].radius * 0.6)
			{
				newPlanet.radius *= 0.5;
			}

			var minOrbit = planets[i].radius + newPlanet.radius * 5.0;
			var maxOrbit = planets[i].orbitRadius / 4000;

			newPlanet.orbitRadius = randomIntRange(minOrbit, minOrbit + planets[i].radius * maxOrbit);
			newPlanet.orbitOffset = randomIntRange(0, 500000);
			newPlanet.center = i;
			newPlanet.type = type;

			planets.push(newPlanet);
		}

		if(randomIntRange(0, 1000) >= 900 && planets[i].radius >= 600)
		{
			var minRadius = randomIntRange(planets[i].radius * 1.5, planets[i].radius * 6.0);
			var maxRadius = minRadius + randomIntRange(0, 400) * 0.01 * planets[i].radius;
			var density = randomIntRange(80, 400) * 0.00000003;

			var ring = createRing(i, minRadius, maxRadius, density);
			rings.push(ring);

		}
	}

	var foundTerra = false, foundGas = false, foundDesert = false, foundAsteroid = false;

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

		if(planets[i].type == 4)
		{
			foundAsteroid = true;
		}
	}

	if(foundTerra == false || foundGas == false || foundDesert == false || foundAsteroid == false || rings.length <= 1)
	{
		planets = [];
		seed += randomIntRange(1, 5000);
		generate();
	}

}
