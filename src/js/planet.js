

function createPlanet(nspeed, nheight, radius, atmoRadius, colorInner, colorOuter, colorDetail, colorAtmo, nseed, ncount)
{

	var heights = Array(ncount);
	var bheights = Array(ncount);

	noise.seed(nseed);

	// Generate heights
	for(var i = 0; i < ncount; i++)
	{
		var height0 = noise.perlin2(i / ncount * nspeed * 1.0, 0.0) * nheight;
		var height1 = noise.perlin2(i / ncount * nspeed * 2.0, 5.0) * nheight * 0.5;
		var height2 = noise.perlin2(i / ncount * nspeed * 4.0, 8.0) * nheight * 0.25;
		heights[i] = Math.max(height0 + height1, 0.0) * 1.5;
		bheights[i] = (noise.perlin2(i / ncount * nspeed, 40.0) * nheight + height2) * 0.2;
	}

	

	return {x: 0, y: 0, radius:radius, atmoRadius: atmoRadius, 
		colorInner:colorInner, colorOuter:colorOuter, colorDetail: colorDetail, colorAtmo: colorAtmo,
		 heights: heights, bheights: bheights, isGasPlanet: false, cities: [], ore: 0, fuel: 0};
}

function getMaxForces(planet)
{
	var humanShips = 0;
	var aiShips = 0;
	for(var i = 0; i < planet.cities.length; i++)
	{
		if(planet.cities[i].side == 0)
		{
			humanShips += planet.cities[i].size / 20.0;
		}
		else
		{
			aiShips += planet.cities[i].size / 20.0;
		}
		
	}

	humanShips = Math.min(Math.floor(humanShips), 26);
	aiShips = Math.min(Math.floor(aiShips), 26);

	return {human: humanShips, ai: aiShips};
}

function createForces(planet)
{
	var maxForces = getMaxForces(planet);

	planet.humanForces = [];
	planet.aiForces = [];

	for(var i = 0; i < maxForces.human / 2.0 + maxForces.ai; i++)
	{

		if(i < maxForces.human / 2.0)
		{
			planet.humanForces.push(randomShip(0));
		}
		else 
		{
			planet.aiForces.push(randomShip(1));
		}
	}

	planet.maxForces = maxForces;
	planet.deployed = [];
	planet.warTime = 0.0;
	planet.aiTime = 0.0;
	planet.humanTime = 0.0;
}

// efactor = 0 -> 50%  Enemies
// efactor = 1 -> 100% Enemies
// efactor = -1 -> 0% Enemies
function createCities(planet, efactor, seed)
{
	noise.seed(seed);
	var step = 1.0 / (planet.radius / 34.0);
	// Generate cities for each side
	for(var i = 0; i < 2.0 * Math.PI; i+=step)
	{
		var side = noise.perlin2(i, 0.0) * 1.2;
		if(Math.abs(side) >= 0.2)
		{

			nside =  Math.max(Math.min(side + efactor, 1.0), -1.0);

			var side = 1;
			var size = Math.min(Math.max(Math.abs(side) * 0.07 * planet.radius, 16.0), 40.0);

			if(nside >= 0.0)
			{
				// Human city
				side = 0;
			}

			planet.cities.push({x: Math.cos(i), y: Math.sin(i), size: size, side: side, tone: rrg(80, 200), health: size, mhealth: size});
		}
	}

	createForces(planet);
	planet.humanAggro = rrg(5, 35) * 0.01;
}

var anyAtWar = false;

function updateWar(planet, dt)
{

	if(planet.warTime != undefined)
	{
		planet.warTime -= dt;
		if(planet.warTime <= 0.0)
		{
			// Make forces come back
			for(var i = 0; i < planet.deployed.length; i++)
			{
				shipBehaviourLand(planet.deployed[i], planet.idx);
			}

			planet.deployed = [];
		}
		else 
		{
			anyAtWar = true;
			function spawn(array, count)
			{
				for(var i = 0; i < count; i++)
				{
					if(array.length <= 0)
					{
						return;
					}

					var idx = rrg(0, array.length - 1);
					var force = array[idx];
					array.splice(idx, 1);

					var pos = normalize(rrg(0, 1000) - 500, rrg(0, 1000) - 500);
					pos.x *= planet.radius * 1.02;
					pos.y *= planet.radius * 1.02;
					force.x = planet.x + pos.x;
					force.y = planet.y + pos.y;
					force.rot = Math.atan2(pos.y, pos.x) - Math.PI / 2.0;
					force.speed = getPlanetSpeed(planet, time);

					force.frame = planet.idx;
					shipBehaviourOrbit(force, planet.idx, rrg(60, planet.radius));

					ships.push(force);
					planet.deployed.push(force);

				}
			}

			if(planet.firstWave || planet.wave <= 0.0)
			{
				var aiSpawn = rrg(1, planet.aiForces.length / 2.0);
				var humanSpawn = aiSpawn * planet.humanAggro;

				spawn(planet.aiForces, aiSpawn);
				spawn(planet.humanForces, humanSpawn);
				planet.firstWave = false;
			}


		}
	}
}

function createGasPlanet(radius, atmoRadius, colorAtmo, color0, color1)
{
	return {x: 0, y: 0, radius: radius, atmoRadius: atmoRadius, 
		colorAtmo: colorAtmo, color0: color0, color1: color1, isGasPlanet: true}
}

function drawAtmosphere(x, y, radius, atmoRadius, colorAtmo)
{
	var grd = ctx.createRadialGradient(
		x, y, radius, 
		x, y, atmoRadius);

	grd.addColorStop(0, 'rgba(' + colorAtmo + ',0.5)');
	grd.addColorStop(1, 'rgba(' + colorAtmo + ', 0)');

	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(x, y, atmoRadius, 0.0, 2.0 * Math.PI);
	ctx.fill();
}

function drawPlanetShadow(planet)
{
	var dist2 = (planet.x * planet.x + planet.y * planet.y);
	var td = Math.sqrt(dist2 + planet.radius * planet.radius);
	var xangle = Math.PI / 2.0 - Math.atan2(-planet.y, -planet.x);
	var angle = Math.acos(planet.radius / td);
	var alpha = xangle - angle;
	var beta = xangle + angle;
	// Draw shadow


	var radius = planet.radius * 1.0;
	if(planet.atmoRadius != 0.0)
	{
		radius = planet.atmoRadius;
	}

	var t0xpos = planet.x + Math.sin(alpha) * radius;
	var t0ypos = planet.y + Math.cos(alpha) * radius;
	var t1xpos = planet.x + Math.sin(beta) * radius;
	var t1ypos = planet.y + Math.cos(beta) * radius;

	var offdist = planet.radius * 32.0;

	var t0l = Math.sqrt(t0xpos * t0xpos + t0ypos * t0ypos);
	var t1l = Math.sqrt(t1xpos * t1xpos + t1ypos * t1ypos);
	var pl = Math.sqrt(dist2);

	var t0xoff = t0xpos / t0l;
	var t0yoff = t0ypos / t0l;
	var t1xoff = t1xpos / t1l;
	var t1yoff = t1ypos / t1l;

	var shgrd = ctx.createLinearGradient(planet.x, planet.y, 
		planet.x + planet.x / pl * offdist, planet.y + planet.y / pl * offdist);

	var ext = 0.005 + Math.max((planet.atmoRadius - planet.radius) / 32000.0, 0.0);

	shgrd.addColorStop(0, 'rgba(0, 0, 0, 0)');
	shgrd.addColorStop(ext, 'rgba(0, 0, 0, 0.8)');
	shgrd.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

	ctx.fillStyle = shgrd;
	ctx.beginPath();

	ctx.moveTo(t0xpos, t0ypos)
	ctx.lineTo(t0xpos + t0xoff * offdist, t0ypos + t0yoff * offdist);
	ctx.lineTo(t1xpos + t1xoff * offdist, t1ypos + t1yoff * offdist);
	ctx.lineTo(t1xpos, t1ypos);
	ctx.closePath();
	ctx.fill();
}

function drawPlanetHeights(planet, array)
{
	ctx.beginPath();

	var ncount = array.length;

	for(var i = 0; i < ncount; i++)
	{
		var ifloat = (i / ncount) * 2.0 * Math.PI;
		var x = Math.cos(ifloat); var y = Math.sin(ifloat);
		var height = array[i] + 15.0;
		x = x * planet.radius + x * height + planet.x; 
		y = y * planet.radius + y * height + planet.y;

		if(i == 0)
		{
			ctx.moveTo(x, y);
		}
		else
		{
			ctx.lineTo(x, y);
		}
	}

	ctx.fill();
}

function drawPlanet(planet)
{
	if(planet.isGasPlanet == true)
	{
		// Draw main circle
		ctx.fillStyle = planet.color0;
		ctx.beginPath();
		ctx.arc(planet.x, planet.y, planet.radius, 0.0, 2.0 * Math.PI);
		ctx.fill();

		drawAtmosphere(planet.x, planet.y, planet.radius, planet.atmoRadius, planet.colorAtmo);
	}
	else
	{

		// Outer circle
		ctx.fillStyle = planet.colorOuter;
		drawPlanetHeights(planet, planet.heights);
	}

	

	if(planet.cities != undefined && planet.cities.length > 0)
	{
		// Draw cities
		for(var i = 0; i < planet.cities.length; i++)
		{

			var city = planet.cities[i];
			var rx = city.x * planet.radius * 0.98 + planet.x;
			var ry = city.y * planet.radius * 0.98 + planet.y;
			var px = -city.y;
			var py = city.x;
			var height = city.size * 3.0;

			if(city.side == 0)
			{
				totalHuman++;
				ctx.fillStyle = 'rgb(' + city.tone + ', ' + city.tone + ', ' + city.tone + ')';
				ctx.strokeStyle = 'rgb(200, 200, 200)';
				ctx.beginPath();
				// Human city, rect
				ctx.moveTo(rx - px * city.size, ry - py * city.size);
				ctx.lineTo(rx + px * city.size, ry + py * city.size);
				ctx.lineTo(rx + px * city.size + city.x * height, ry + py * city.size + city.y * height);
				ctx.lineTo(rx - px * city.size + city.x * height, ry - py * city.size + city.y * height);
				ctx.lineTo(rx - px * city.size, ry - py * city.size);
				ctx.fill();
				ctx.stroke();
			}
			else 
			{
				totalAI++;
				ctx.fillStyle = 'rgb(' + city.tone + ', ' + city.tone * 0.5 + ', ' + city.tone * 0.5 + ')';
				ctx.strokeStyle = 'rgb(200, 128, 128)';

				ctx.beginPath();
				ctx.moveTo(rx - px * city.size * 0.5, ry - py * city.size * 0.5);
				ctx.lineTo(rx + px * city.size * 0.5, ry + py * city.size * 0.5);
				ctx.lineTo(rx + px * city.size * 0.5 + city.x * height, ry + py * city.size * 0.5 + city.y * height);
				ctx.lineTo(rx - px * city.size * 0.5 + city.x * height, ry - py * city.size * 0.5 + city.y * height);
				ctx.fill();

				ctx.beginPath();
				// AI city, ball + 2 rects
				ctx.arc(rx, ry, city.size * 1.0, 0.0, Math.PI * 2.0);
				ctx.stroke();

			}


		}
	}

	
}

function drawPlanetOver(planet)
{
	if(!planet.isGasPlanet)
	{
		// Draw heights
		ctx.fillStyle = planet.colorInner;
		drawPlanetHeights(planet, planet.bheights);

		// Draw inner circle
		// TODO: Could be removed
		ctx.fillStyle = planet.colorDetail;
		ctx.beginPath();
		ctx.arc(planet.x, planet.y, planet.radius, 0.0, 2.0 * Math.PI);
		ctx.fill();
	}

	if(planet.atmoRadius >= 0.0)
	{
		drawAtmosphere(planet.x, planet.y, planet.radius, planet.atmoRadius, planet.colorAtmo);
	}


}

function drawPlanetMap(planet)
{
	
	var center = planets[planet.center];

	ctx.strokeStyle = planet.orbitColor;
	ctx.fillStyle = planet.orbitColor;
	ctx.lineWidth = 1.0 / camera.zoom;

	// Orbit circle
	ctx.beginPath();
	ctx.arc(center.x, center.y, planet.orbitRadius, 0.0, Math.PI * 2.0);
	ctx.stroke();

	// Planet point
	ctx.beginPath();
	ctx.arc(planet.x, planet.y, planet.radius, 0.0, Math.PI * 2.0);
	ctx.fill();

	var textSize = 2.0 / camera.zoom;
	if(planet.center != 0)
	{
		if(camera.zoom <= 0.02)
		{	
			textSize = 0.0;
		}
		else 
		{
			textSize = 1.3 / camera.zoom;
		}
	}

	if(textSize > 0.0)
	{
		var textLength = planet.name.length * 4.0 * textSize;
		drawText(planet.name, planet.x - (textLength / 2.0), planet.y + Math.max(planet.atmoRadius, planet.radius * 1.1), textSize, planet.orbitColor);
	}
}


