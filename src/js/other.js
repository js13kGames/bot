
function generateBright()
{
	for(var y = 0; y < brightSize; y++)
	{
		for(var x = 0; x < brightSize; x++)
		{
			var i = y * brightSize + x;

			var xabs = (x - brightSize / 2.0);
			var yabs = (y - brightSize / 2.0);

			var factor = brightSize / ((xabs * xabs + yabs * yabs) / 6.0);

			var b = factor;
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
	for(var y = 0; y < starFieldSize; y++)
	{
		for(var x = 0; x < starFieldSize; x++)
		{
			var i = y * starFieldSize + x;

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

			if(rrg(0, 10000) >= 9995)
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


function generatePlanet(type, radiusScale, id, moon)
{
	var newPlanet;
	var name;

	if(type == 0)
	{
		// Rocky planet
		var radius = rrg(250, 850) * radiusScale;
		newPlanet = createPlanet(rrg(25, 60), rrg(140, 150), radius, 0.0, 
		randomColor(0, 1.0), randomColor(0, 0.5), randomColor(0, 1.0),
		'0, 0, 0', rrg(0, 10000), 64);
		name = rockNames[id % (rockNames.length)];
	}
	else if(type == 1)
	{
		// Terra planet
		var radius = rrg(300, 600) * radiusScale;

		newPlanet = createPlanet(rrg(25, 30), rrg(90, 160), 
		radius, radius + rrg(120, 170), randomColor(1, 1.0), randomColor(1, 0.5), randomColor(1, 1.0),
		'120, 120, 255', rrg(0, 10000), 64);

		name = terraNames[id % (terraNames.length)];
	}
	else if(type == 2)
	{
		// Desert planet
		var radius = rrg(350, 900) * radiusScale;

		newPlanet = createPlanet(rrg(15, 25), rrg(80, 120), 
		radius, radius + rrg(120, 170), randomColor(2, 1.0), randomColor(2, 0.5), randomColor(2, 1.0),
		'255, 120, 120', rrg(0, 10000), 64);

		name = desertNames[id % (desertNames.length)];
	}
	else if(type == 3)
	{
		// Gas giant
		var radius = rrg(700, 1800) * radiusScale;

		var themeColor = randomColor(3, 1.0);
	
		newPlanet = createGasPlanet(radius, radius + rrg(50, 300),
		makeColorAlpha(themeColor), themeColor, randomColor(3, 1.0));

		name = gasNames[id % (gasNames.length)];
	}
	else if(type == 4)
	{
		let letters = ['A', 'E', 'I', 'O', 'U', 'N', 'G', 'R', 'J', 'R'];
		// Asteroid
		var radius = rrg(40, 120) * radiusScale;
		newPlanet = createPlanet(rrg(25, 60), rrg(140, 150), radius, 0.0, 
		randomColor(2, 1.0), randomColor(2, 0.5), randomColor(2, 1.0),
		'0, 0, 0', rrg(0, 10000), 32);

		name = letters[rrg(0, letters.length - 1)] + letters[rrg(0, letters.length - 1)] + id;
	}

	newPlanet.mass = 4.0 * Math.PI * newPlanet.radius * newPlanet.radius;

	newPlanet.orbitColor = randomColor(-1, 2.0);

	if(moon != -1)
	{
		name = planets[moon].name + ' ' + id;
	}


	newPlanet.name = name;

	return newPlanet;
}


function generate()
{
	sun = createStar(0, 0, 5000, "rgb(255, 240, 200)", "White");

	sun.mass = 5.0 * Math.PI * sun.radius * sun.radius;
	sun.sun = true;
	// Planet 0 is sun
	planets.push(sun);

	// Create a set of random planets
	for(var i = 0; i < planetCount; i++)
	{
		var type = rrg(0, 4);
		
		var orbitRadius = rrg(9000, 80000);

		if(type == 1 && (orbitRadius <= 40000 || orbitRadius >= 80000))
		{
			// Terras can only exist in the goldilocks zone
			type = 2;
		}

		var newPlanet = generatePlanet(type, 1.0, i, -1);

		newPlanet.orbitRadius = orbitRadius
		newPlanet.orbitOffset = rrg(-50000, 50000);
		newPlanet.center = 0;
		newPlanet.type = type;

		planets.push(newPlanet);

	}

	// Create some moons and rings
	for(var i = 1; i < planetCount + 1; i++)
	{
		var moons = rrg(0, planets[i].radius / 300);
		for(var j = 0; j < moons; j++)
		{
			var type = rrg(0, 4);
			if(type == 3)
			{
				type = 0;
			}
			var newPlanet = generatePlanet(type, rrg(25, 60) * 0.01, j + 1, i);

			if(newPlanet.radius >= planets[i].radius * 0.6)
			{
				newPlanet.radius *= 0.5;
			}

			var minOrbit = planets[i].radius + newPlanet.radius * 5.0;
			var maxOrbit = planets[i].orbitRadius / 16000;

			newPlanet.orbitRadius = rrg(minOrbit, minOrbit + planets[i].radius * maxOrbit);
			newPlanet.orbitOffset = rrg(0, 500000);
			newPlanet.center = i;
			newPlanet.type = type;

			planets.push(newPlanet);
		}

		if(rrg(0, 1000) >= 900 && planets[i].radius >= 150)
		{
			var minRadius = rrg(planets[i].radius * 1.5, planets[i].radius * 8.0);
			var maxRadius = minRadius + rrg(50, 300) * 0.01 * planets[i].radius;
			var density = rrg(80, 400) * 0.0000003;

			var ring = createRing(i, minRadius, maxRadius, density);
			rings.push(ring);

		}
	}

	update(0.0);

	var foundTerra = false, foundGas = false, foundDesert = false, foundAsteroid = false, minDist = false;

	for(var i = 1; i < planets.length; i++)
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

		if(i < planetCount)
		{
			for(var j = 1; j < planetCount; j++)
			{
				if(j != i)
				{
					var dist = distance(planets[i].x, planets[i].y, planets[j].x, planets[j].y);
					if(dist <= 9000.0)
					{
						minDist = true;
					}
				}
			}
		}
	}

	if(foundTerra == false || foundGas == false || foundDesert == false || foundAsteroid == false || rings.length <= 1 || minDist)
	{
		planets = [];
		seed += rrg(1, 5000);
		generate();
	}

	//console.log("Bodies: " + planets.length + ", planets: " + planetCount + ", Moons: " + (planets.length - planetCount));

}
