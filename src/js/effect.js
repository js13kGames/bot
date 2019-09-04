function explode(x, y, vx, vy, size, speed, shock, bright, isShoot, volBoost = 0.5)
{
	var expl = {x: x, y: y, vx: vx, vy: vy, time: 0.0, size: size, speed: speed, shock: shock, bright: bright};
	explosions.push(expl);

	explosionSound(size / 100.0, x, y, isShoot, volBoost);

}

function burn(x, y, vx, vy, size, speed)
{
	var f = {x: x, y: y, vx: vx, vy: vy, time: 0.0, size: size, speed: speed};
	fire.push(f);

}

function drawFire(fire)
{
	ctx.beginPath();
	var fireTime = Math.pow(fire.time, 2.0);
	var fireR = 255; var fireG = 200; var fireB = 200;
	var smokeR = 70; var smokeG = 70; var smokeB = 70;
	var mixR = smokeR * fireTime + fireR * (1.0 - fire.time);
	var mixG = smokeG * fireTime + fireG * (1.0 - fire.time);
	var mixB = smokeB * fireTime + fireB * (1.0 - fire.time);

	ctx.fillStyle = 'rgba(' + mixR + ', ' + mixG + ', ' + mixB + ', ' + fire.time * 0.5 + ')';

	var size = Math.sqrt(fire.time) * fire.size;
	ctx.arc(fire.x, fire.y, size, 0.0, Math.PI * 2.0);
	ctx.fill();
}

function drawExplosion(expl)
{
	if(expl.time <= 0.1 * expl.speed && expl.bright == true)
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

function updateFire(fire, dt)
{
	fire.time += dt * fire.speed;
	fire.x += fire.vx * dt;
	fire.y += fire.vy * dt;

	if(fire.time >= 1.0)
	{
		return true;
	}

	return false;
}