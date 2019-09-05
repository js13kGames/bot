function shoot(x, y, vx, vy, side, size, time)
{
	bullets.push({x: x, y: y, vx: vx, vy: vy, side: side, size: size, timer: time, color: sideColor(side)});
}


function updateBullet(bullet, dt)
{
	bullet.x += bullet.vx * dt;
	bullet.y += bullet.vy * dt;
	var acc = gravity(bullet, time);
	bullet.vx += acc.x * dt;
	bullet.vy += acc.y * dt;

	var damage = bullet.size;

	var collAll = collidesWithAny(bullet, time, bullet.side);


	if(collAll.planet != null)
	{
		var coll = collAll.planet;
		var planet = planets[coll.planet];
		var planetVel = orbitVelocity(planet.center, planet.mass, planet.orbitRadius, time, planet.orbitOffset);
		explode(bullet.x, bullet.y, planetVel.x, planetVel.y, bullet.size * 17.0, 2.4, 0.4, true, false);

		if(collAll.city != null)
		{
			// Only player bullets can damage, a bit of a workaround
			if(bullet.side == 2)
			{
				var coll = collAll.city;
				var planet = planets[coll.planet];
				var city = planet.cities[coll.idx];
				city.health -= damage;
				if(planet.warTime <= 0.0)
				{
					planet.firstWave = true;
				}

				planet.warTime = 30.0;
	

				if(city.health <= 0.0)
				{
					explode(coll.rx, coll.ry, planetVel.x, planetVel.y, city.size * 7.0, 1.5, 1.0, true, false);
					planet.cities.splice(coll.idx, 1);
					planet.maxForces = getMaxForces(planet);
				}


			}
			
		}

		return true;
	}

	if(collAll.ship != null)
	{
		explode(bullet.x, bullet.y, collAll.ship.speed.x, collAll.ship.speed.y, bullet.size * 17.0, 2.4, 0.4, true, false);
		collAll.ship.health -= damage;
		collAll.ship.health = Math.floor(collAll.ship.health);
		
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
	ctx.strokeStyle = bullet.color;
	ctx.lineWidth = bullet.size / (camera.zoom * 1.5);
	ctx.beginPath();
	ctx.moveTo(bullet.x, bullet.y);
	var vnorm = normalize(bullet.vx - ships[0].speed.x, bullet.vy - ships[0].speed.y);
	ctx.lineTo(bullet.x - vnorm.x * bullet.size * 5.0, bullet.y - vnorm.y * bullet.size * 5.0);
	ctx.stroke();
}