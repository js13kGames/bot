
function createStar(x, y, radius, color, outColor)
{
	return {x:x, y:y, radius:radius, color:color, outColor:outColor};
}

function drawStar(star)
{
	var grd = ctx.createRadialGradient(star.x, star.y, star.radius / 1.5, star.x, star.y, star.radius);
	grd.addColorStop(0, star.color);
	grd.addColorStop(1, star.outColor);

	ctx.fillStyle = grd;
	ctx.beginPath();
	ctx.arc(star.x, star.y, star.radius, 0.0, 2.0 * Math.PI);
	ctx.fill();
}