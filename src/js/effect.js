function explode(x, y, vx, vy, size, speed, shock, bright)
{
	var expl = {x: x, y: y, vx: vx, vy: vy, time: 0.0, size: size, speed: speed, shock: shock, bright: bright};
	explosions.push(expl);
}

function drawExplosion(expl)
{
	if(expl.time <= 0.1 && expl.bright == true)
	{
		drawBright(expl.x, expl.y, expl.size / 256.0, 128);
	}

	if(expl.shock != 0)
	{
		ctx.fillStyle = 'rgba(255, 255, 255, ' + (1.0 - Math.pow(expl.time, 1.0 / 3.5)) + ')';

		ctx.beginPath();
		ctx.arc(expl.x, expl.y, Math.pow(expl.time * 4.0, 1.0 / 2.5) * expl.size * expl.shock, 0.0, Math.PI * 2.0);
		ctx.fill();
	}
}

function updateExplosion(expl, dt)
{
	expl.time += dt * expl.speed;
	expl.x += expl.vx * dt;
	expl.y += expl.vy * dt;

	if(expl.time >= 1.0)
	{
		return true;
	}

	return false;
}