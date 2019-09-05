

function srandom() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function planetAtTime(planetid, gtime)
{
	var planet = planets[planetid];

	if(planetid == 0)
	{
		return {x: 0.0, y: 0.0};
	}

	if(planet.center == 0)
	{
		return orbit(0, 0, planets[planet.center].mass, planet.mass, planet.orbitRadius, gtime + planet.orbitOffset);
	}
	else 
	{
		var child = planetAtTime(planet.center, gtime);
		return orbit(child.x, child.y, planets[planet.center].mass, planet.mass, planet.orbitRadius, gtime + planet.orbitOffset);
	}
}

function orbit(cx, cy, cmass, omass, radius, gtime)
{
	var speed = orbitSpeed(cmass, omass, radius) / radius;

	return {x: Math.cos(gtime * speed) * radius + cx, y: Math.sin(gtime * speed) * radius + cy};
}

function orbitSpeed(cmass, omass, radius)
{
	var grav = G() * (cmass + omass);
	var speed = Math.sqrt(grav / radius);

	return speed;
}

function orbitVelocityLow(cx, cy, cmass, omass, radius, ntime)
{
	var a = orbit(cx, cy, cmass, omass, radius, ntime);
	var b = orbit(cx, cy, cmass, omass, radius, ntime + 0.01);
	var sumX = b.x - a.x; 
	var sumY = b.y - a.y;
	var out = normalize(sumX, sumY);
	var speed = orbitSpeed(cmass, omass, radius);
	out.x *= speed;
	out.y *= speed;

	return out;
}

// Gets accumulated orbit velocity
function orbitVelocity(id, omass, radius, time, offset)
{
	if(id == 0)
	{
		if(radius == 0.0)
		{

			return {x: 0.0, y: 0.0};
		}
		else
		{
			return orbitVelocityLow(0, 0, planets[0].mass, omass, radius, time + offset);
		}
	}
	else
	{
		var planet = planets[id];
		var cx = planets[planet.center].x;
		var cy = planets[planet.center].y;
		var cmass = planets[planet.center].mass;

		var ourVel = orbitVelocityLow(cx, cy, cmass, planet.mass, planet.orbitRadius, time + planet.orbitOffset);
		var childVel = orbitVelocity(planet.center, omass, 0.0, time, offset);

		var sum0 = {x: ourVel.x + childVel.x, y: ourVel.y + childVel.y};


		if(radius == 0.0)
		{
			return sum0;
		}
		else
		{
			var topVel = orbitVelocityLow(planet.x, planet.y, planet.mass, omass, radius, time + offset);
			var sum1 = {x: sum0.x + topVel.x, y: sum0.y + topVel.y}
			return sum1;
		}
	}
}

// Computes gravity from all attractors
function gravity(point, ntime)
{
	var forceTotal = {x: 0.0, y: 0.0};

	if(ntime === -1.0)
	{
		for(var i = 0; i < planets.length; i++)
		{
			var pos = planets[i];
			var force = gravityFrom(point, pos.x, pos.y, planets[i].mass);
			forceTotal.x += force.x;
			forceTotal.y += force.y;
		}
	}
	else 
	{
		for(var i = 0; i < planets.length; i++)
		{
			var pos = planetAtTime(i, ntime);
			var force = gravityFrom(point, pos.x, pos.y, planets[i].mass);
			forceTotal.x += force.x;
			forceTotal.y += force.y;
		}
	}

	return forceTotal;
}

function collidesWithPlanet(point, ntime)
{
	for(var i = 0; i < planets.length; i++)
	{
		var pos = planetAtTime(i, ntime);
		var dist = distance(point.x, point.y, pos.x, pos.y);
		if(dist <= planets[i].radius * 1.02)
		{
			var diff = {x: point.x - pos.x, y: point.y - pos.y}
			var diffNrm = normalize(diff.x, diff.y);
			var x = diffNrm.x * planets[i].radius * 1.02;
			var y = diffNrm.y * planets[i].radius * 1.02;
			var xn = diffNrm.x;
			var yn = diffNrm.y;

			return {planet: i, sx: x, sy: y, nx: xn, ny: yn};
		}
	}

	return null;
}


function collidesWithCity(point, ntime)
{
	var planetC = collidesWithPlanet(point, ntime);
	if(planetC != null)
	{
		var planet = planets[planetC.planet];
		if(planet.cities != undefined)
		{
			for(var i = 0; i < planet.cities.length; i++)
			{
				var city = planet.cities[i];
				var rx = city.x * planet.radius * 0.98 + planet.x;
				var ry = city.y * planet.radius * 0.98 + planet.y;
				if(distance(rx, ry, point.x, point.y) <= city.size * 2.0)
				{
					return {city: city, idx: i, planet: planetC.planet, rx: rx, ry: ry};
				}
			}
		}
	}

	return null;
}

function collidesWithShip(point, side = -1, extraRadius = 1.0)
{
	for(var i = 0; i < ships.length; i++)
	{
		if(isEnemy(ships[i].side, side) || side == -1)
		{
			var size = 5.0;
			if(ships[i].type == 1)
			{
				size = 14.0;
			}
			else if(ships[i].type == 2)
			{
				size = 24.0;
			}

			if(distance(point.x, point.y, ships[i].x, ships[i].y) <= size * extraRadius)
			{
				ships[i].idx = i;
				return ships[i];
			}
		}
	}

	return null;
}

function collidesWithAny(point, ntime, side = -1, extraRadius = 1.0)
{
	var city = collidesWithCity(point, ntime);
	var planet = collidesWithPlanet(point, ntime);
	var ship = collidesWithShip(point, side, extraRadius);
	return {city: city, planet: planet, ship: ship};
}

function gravityFrom(point, cx, cy, cmass)
{
	var dist2 = distance2(point.x, point.y, cx, cy);
	var diff = normalize(cx - point.x, cy - point.y)
	var force = G() * (cmass / dist2);

	return {x: diff.x * force, y: diff.y * force};
}

function G()
{
	return 2.5;
}

function putShipInOrbit(ship, id, radius, offset, prograde)
{
	var pos = orbit(planets[id].x, planets[id].y, planets[id].mass, shipMass, radius, time + offset);
	var vel = orbitVelocity(id, shipMass, radius, time, offset);
	ship.x = pos.x; ship.y = pos.y;
	ship.speed.x = vel.x; ship.speed.y = vel.y;
	
}

// 5/10 -> Fighters
// 4/10 -> Freighters
// 1/10 -> Destroyer
function randomShip(side)
{
	var value = rrg(0, 100);
	var level = rrg(0, 5);

	if(value <= 50)
	{
		return createShip(0, srandom(), side, level);
	}
	else if(value <= 90)
	{
		return createShip(1, srandom(), side, level);
	}
	else 
	{
		return createShip(2, srandom(), side, level);
	}
}


function randomColor(type, mult)
{
	var r, g, b;

	if(type == 0)
	{
		// Rocky
		var val = rrg(128, 180);
		r = val; g = val; b = val;
	}
	else if(type == 1)
	{
		// Terra ground
		if(rrg(0, 100) >= 50)
		{
			// Grassy 
			r = rrg(50, 170);
			g = rrg(90, 200);
		 	b = rrg(80, 170);
		}
		else
		{
			// Muddy
			r =  rrg(100, 200);
			g = rrg(80, 170);
			b = rrg(50, 100);	
		}

	}
	else if(type == 2)
	{
		// Desert ground
		r = rrg(100, 250);
		g = rrg(40, 100);
		b = rrg(50, 100);
	}
	else if(type == 3)
	{
		// Gas planet
		r = rrg(50, 200);
		g = rrg(50, 200);
		b = rrg(50, 200);
	}
	else
	{
		r = rrg(0, 255);
		g = rrg(0, 255);
		b = rrg(0, 255);
	}

	return 'rgb(' + r * mult + ',' + g * mult + ',' + b * mult + ')';
}

function getPlanetSpeed(planet, time)
{
	if(planet == planets[0])
	{
		return {x: 0.0, y: 0.0};
	}
	else
	{
		return orbitVelocity(planet.center, planet.mass, planet.orbitRadius, time, planet.orbitOffset);
	}
}

function showEvent(str, time)
{
	eventStr = str
	eventTimer = time;
}

// 2 = player side
function sideColor(side)
{
	var r, g, b;

	if(side == 0)
	{
		// Human ships, blueish grey
		r = rrg(80, 160);
		g = r * rrg(80, 100) * 0.01;
		b = r * rrg(100, 130) * 0.01;
	}
	else if(side == 1)
	{
		// Soft reds
		r = rrg(120, 210);
		g = r * rrg(70, 80) * 0.01;
		b = r * rrg(40, 50) * 0.01;
		r *= rrg(100, 150) * 0.01;
		g *= rrg(60, 90) * 0.01;
		b *= rrg(60, 90) * 0.01;
	}
	else 
	{
		// Grey
		r = rrg(80, 110);
		g = r;
		b = r;
	}

	return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function makeColorAlpha(color)
{
	var colorCopy = color;
	colorCopy = colorCopy.splice(0, 4, "");
	colorCopy = colorCopy.splice(color.length - 5, 2, "");
	return colorCopy;
}

function rrg(min, max) 
{
	return Math.floor(min + srandom()*(max + 1 - min))
}

if (!String.prototype.splice) {
	String.prototype.splice = function(start, delCount, newSubStr) {
		return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
	};
}

function imageDataToImage(data)
{
	var tmpCanvas = document.createElement("canvas");
	var tmpctx = tmpCanvas.getContext("2d");
	tmpCanvas.width = data.width;
	tmpCanvas.height = data.height;
	tmpctx.putImageData(data, 0, 0);

	var image = new Image();
	image.src = tmpCanvas.toDataURL();

	tmpCanvas.innerHTML = "";

	return image;
}

function drawBright(x, y, size, alpha)
{
	var old = ctx.globalCompositeOperation;
	ctx.globalCompositeOperation = 'lighter';

	ctx.translate(x, y);
	ctx.scale(size, size);
	ctx.drawImage(brightImage, -brightData.width / 2.0, -brightData.height / 2.0);
	ctx.scale(1.0 / size, 1.0 / size);
	ctx.translate(-x, -y);

	ctx.globalCompositeOperation = old;
}

function doCameraTransform()
{
	ctx.translate(canvas.width / 2.0, canvas.height / 2.0);

	if(lockCamera)
	{
		ctx.rotate(-ships[0].rot - Math.PI);
	}

	ctx.scale(camera.zoom, camera.zoom);
	ctx.translate(-camera.x, -camera.y);
}

function sanitizeAngle(angle)
{
	var a = angle;
	if(Math.abs(a) >= Math.PI * 2.0)
	{
		a = a % (Math.PI * 2.0);
	}

	if(a <= 0.0)
	{
		a = Math.PI * 2.0 + a;
	}

	return a;
}

function angleDiff(a, b)
{
	var diff = (a - b);

	if(diff > Math.PI)
	{
		diff = -2.0 * Math.PI + diff;
	}

	return diff;
}

function normalize(x1, y1)
{
	var length = Math.sqrt(x1 * x1 + y1 * y1);
	return {x: x1 / length, y: y1 / length};
}

function distance2(x1, y1, x2, y2)
{
	let xdiff = x1 - x2;
	let ydiff = y1 - y2;
	return xdiff * xdiff + ydiff * ydiff;
}

function distance(x1, y1, x2, y2)
{
	return Math.sqrt(distance2(x1, y1, x2, y2));
}

function rotate(x, y, angle)
{
	var polar = Math.atan2(y, x);
	var radius = Math.sqrt(x * x + y * y);
	polar += angle;
	return {x: radius * Math.cos(polar), y: radius * Math.sin(polar)}
}