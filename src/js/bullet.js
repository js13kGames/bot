function shoot(x, y, vx, vy, side, size, time)
{
	bullets.push({x: x, y: y, vx: vx, vy: vy, side: side, size: size, timer: time});
}


function updateBullet(bullet, dt)
{
	bullet.x += bullet.vx * dt;
	bullet.y += bullet.vy * dt;
	var acc = gravity(bullet, time);
	bullet.vx += acc.x * dt;
	bullet.vy += acc.y * dt;

	var damage = bullet.size;

	var collAll = collidesWithAny(bullet, time);

	

	if(collAll.planet != null)
	{
		var coll = collAll.planet;
		var planet = planets[coll.planet];
		var planetVel = orbitVelocity(planet.center, planet.mass, planet.orbitRadius, time, planet.orbitOffset);
		explode(bullet.x, bullet.y, planetVel.x, planetVel.y, bullet.size * 17.0, 2.4, 0.4, true);

		if(collAll.city != null)
		{
			var coll = collAll.city;
			var planet = planets[coll.planet];
			var city = planet.cities[coll.idx];
			city.health -= damage;
			if(city.health <= 0.0)
			{
				explode(coll.rx, coll.ry, planetVel.x, planetVel.y, city.size * 7.0, 1.5, 1.0, true);
				planet.cities.splice(coll.idx, 1);
				planet.maxForces = getMaxForces(planet);
			}
		}

		return true;
	}



	bullet.timer -= dt;
	if(bullet.timer <= 0.0)
	{
		return true;
	}

	return false;
}

function drawBullet(bullet)
{
	ctx.strokeStyle = 'rgb(255, 200, 200)';
	ctx.lineWidth = bullet.size;
	ctx.beginPath();
	ctx.moveTo(bullet.x, bullet.y);
	var vnorm = normalize(bullet.vx - ships[0].speed.x, bullet.vy - ships[0].speed.y);
	ctx.lineTo(bullet.x - vnorm.x * bullet.size * 5.0, bullet.y - vnorm.y * bullet.size * 5.0);
	ctx.stroke();
}