

function srandom() {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function orbit(cx, cy, cmass, radius, time)
{
	
	var orbitLength = 2.0 * Math.PI * radius;
	var speed = orbitSpeed(cmass, radius) / orbitLength;

	return {x: Math.cos(time * speed) * radius + cx, y: Math.sin(time * speed) * radius + cy};
}

function orbitSpeed(cmass, radius)
{
	var grav = G() * cmass;
	var speed = Math.sqrt(grav / radius);

	return speed;
}

// Computes gravity from all attractors
function gravity(point)
{
	var forceTotal = {x: 0.0, y: 0.0};

	// Sun gravity
	var force = gravityFrom(point, 0, 0, sun.mass);
	forceTotal.x += force.x;
	forceTotal.y += force.y;

	for(var i = 0; i < planets.length; i++)
	{
		var force = gravityFrom(point, planets[i].x, planets[i].y, planets[i].mass);
		forceTotal.x += force.x;
		forceTotal.y += force.y;
	}
}

function gravityFrom(point, cx, cy, cmass)
{
	var dist2 = distance2(point.x, point.y, cx, cy, cmass);
	var diff = normalize(cx - point.x, cy - point.y)
	var force = G() * (cmass / dist2);

	return {x: diff.x * force, y: diff.y * force};
}

function G()
{
	return 0.5;
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
		r = 255;
		g = 0;
		b = 255;
	}

	return 'rgb(' + r * mult + ',' + g * mult + ',' + b * mult + ')';
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