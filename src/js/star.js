
function createStar(x, y, radius, color, outColor)
{
	return {x:x, y:y, radius:radius, color:color, outColor:outColor};
}

function drawStar(star)
{
	ctx.fillStyle = 'white';
	ctx.beginPath();
	ctx.arc(star.x, star.y, star.radius, 0.0, 2.0 * Math.PI);
	ctx.fill();
}