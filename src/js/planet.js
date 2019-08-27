
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
		heights[i] = Math.max(height0 + height1, 0.0);
		bheights[i] = noise.perlin2(i / ncount * nspeed, 40.0) * nheight + height2;
	}

	return {x: 0, y: 0, radius:radius, atmoRadius: atmoRadius, 
		colorInner:colorInner, colorOuter:colorOuter, colorDetail: colorDetail, colorAtmo: colorAtmo,
		 heights: heights, bheights: bheights, isGasPlanet: false};
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
	grd.addColorStop(1, 'rgb(' + colorAtmo + ', 0)');

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
	shgrd.addColorStop(ext, 'rgba(0, 0, 0, 255)');
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
		ctx.beginPath();

		var ncount = planet.heights.length;

		for(var i = 0; i < ncount; i++)
		{
			var ifloat = (i / ncount) * 2.0 * Math.PI;
			var x = Math.cos(ifloat); var y = Math.sin(ifloat);
			var height = planet.bheights[i] + 15.0;
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

		ctx.closePath();
		ctx.fill();

		if(planet.atmoRadius >= 0.0)
		{
			drawAtmosphere(planet.x, planet.y, planet.radius, planet.atmoRadius, planet.colorAtmo);
		}

		// Draw inner circle
		ctx.fillStyle = planet.colorInner;
		ctx.beginPath();

		var ncount = planet.heights.length;

		for(var i = 0; i < ncount; i++)
		{
			var ifloat = (i / ncount) * 2.0 * Math.PI;
			var x = Math.cos(ifloat); var y = Math.sin(ifloat);
			var height = planet.heights[i] + 5.0;
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

		ctx.closePath();
		ctx.fill();
		
		ctx.fillStyle = planet.colorDetail;
		ctx.beginPath();
		ctx.arc(planet.x, planet.y, planet.radius, 0.0, 2.0 * Math.PI);
		ctx.fill();

	}
}