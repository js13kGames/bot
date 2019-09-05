function shipTaskLookAt(ship, angle)
{
	ship.ai.task = {target: angle, type: 0};
}

function shipBehaviourLand(ship, planet)
{
	ship.frame = planet;
	ship.ai.beh = {type: 0, motorTimer: 0.0};
}


function shipBehaviourOrbit(ship, planet, radius)
{
	ship.frame = planet;
	ship.ai.beh = {type: 1, radius: radius, injection: false, maintain: false, predictTimer: 4.0, palt: 0.0};
}



function aiLookAt(ship, dt, task)
{
	// 0->2PI
	var shipsane = sanitizeAngle(ship.rot);
	var diff = angleDiff(shipsane, task.target);


	var next = sanitizeAngle(ship.rot + ship.angspeed * dt);
	var nextDiff = angleDiff(next, task.target);

	var diffDiff = Math.abs(nextDiff) - Math.abs(diff);

	var speed = 1.0;
	if(Math.abs(diff) <= 1.0)
	{
		speed = Math.max(1.0 * Math.abs(diff) * Math.abs(diff), 0.6);
	}

	if(diffDiff < 0.0)
	{
		// We are going on the right direction
		if(Math.abs(ship.angspeed) >= Math.min(Math.abs(diff) * 2.0, 1.0))
		{
			if(Math.abs(diff) <= Math.PI / 4.0)
			{
				ship.thrust.rot = -Math.sign(diff) * speed * 0.1;
			}
			else 
			{
				ship.thrust.rot = 0.0;
			}
		
		}
	}
	else 
	{
		// We are going away
		ship.thrust.rot = -Math.sign(diff) * speed * 1.4;
	}

	if(Math.abs(diff) <= 0.01 && Math.abs(ship.angspeed) <= 0.1)
	{
		ship.angspeed = 0.0;
		ship.rot = task.target;
		ship.thrust.rot = 0.0;
	}

	return Math.abs(diff);
}

function isEnemy(ourSide, otherSide)
{
	if(ourSide == 0)
	{
		return otherSide == 1;
	}
	else 
	{
		return otherSide != ourSide;
	}
}


function updateShipAI(ship, dt)
{
	var a = noise.perlin2(ship.ai.targetTimer + time * 3.0, ship.ai.targetTimer + time * 2.0) * ship.ai.acc;
	
	if(ship.ai.target != -1 && !ship.destroyed)
	{
		var target = ships[ship.ai.target];
		var otarget = {x: target.x, y: target.y};
		// Trailing

		otarget.x += (target.speed.x - ship.speed.x) * a;
		otarget.y += (target.speed.y - ship.speed.y) * a;
		aimShipGuns(ship, otarget, dt);
	}
	// Add some trailing

	function findTarget()
	{
		if(ship.side == 1)
		{
			if(rrg(0, 1000) >= 700)
			{
				ship.ai.target = 0;
			}
		}
		
		ship.ai.target = -1;
		for(var i = 0; i < ships.length; i++)
		{
			if(isEnemy(ship.side, ships[i].side) && rrg(0, 1000) >= 600)
			{
				found = true;
				ship.ai.target = i;
			}
		}
	}

	var lookDev = 1000.0;

	ship.ai.targetTimer -= dt;
	if(ship.ai.targetTimer <= 0.0)
	{
		findTarget();
		if(ship.ai.target == -1)
		{
			ship.ai.targetTimer = rrg(1, 5);
		}
		else 
		{
			ship.ai.targetTimer = rrg(3, 16);
		}
	}

	if(ship.ai.target != -1)
	{
		ship.firing = true;
	}
	else 
	{
		ship.firing = false;
	}

	// Tasks are low-level actuations over the ship
	if(ship.ai.task != null)
	{
		if(ship.ai.task.type == 0)
		{
			lookDev = aiLookAt(ship, dt, ship.ai.task);
		}
	}

	// Behaviour are medium-term, high level acts
	if(ship.ai.beh != null)
	{
		var beh = ship.ai.beh;

		if(beh.type == 0)
		{
			// Land on frame planet
			shipTaskLookAt(ship, getProgradeAngle(ship) + Math.PI)
			
			var prevThrust = ship.thrust.fw;

			if(lookDev <= 0.02 && getFrameSpeed(ship) >= 10.0 && beh.motorTimer <= 0.0)
			{
				ship.thrust.fw = 1.0;
			}
			else 
			{
				ship.thrust.fw = 0.0;
				if(getAltitudeGround(ship) <= 200.0 && prevThrust != 0.0)
				{
					beh.motorTimer = 1.0;
				}
			}

			beh.motorTimer -= dt;

			if(ship.landed)
			{
				ship.ai.beh = null;
				ship.ai.task = null;
				ship.thrust.fw = 0.0;
			}


		}
		else if(beh.type == 1)
		{
			// Take off to orbit
			

			var alt = getAltitudeGround(ship);
			var calt = getAltitude(ship);
			var frame = planets[ship.frame];

			if(beh.maintain)
			{
				beh.predictTimer -= dt;

				if(beh.predictTimer <= 0.0)
				{
					predictShip(ship);
					beh.predictTimer = 4.0;
				}

				

				shipTaskLookAt(ship, getProgradeAngle(ship));

				if(alt < 10.0)
				{
					shipBehaviourOrbit(ship, ship.frame, beh.radius * 1.4);
				}

				if(ship.landed)
				{
					ship.frame = ship.coll.planet;
					shipBehaviourOrbit(ship, ship.coll.planet, beh.radius * 1.4);
				}

				if(lookDev < 0.1)
				{
					if(alt < beh.radius * 0.8)
					{
						ship.thrust.side = -0.05;
					}
					else if(alt > beh.radius * 1.2)
					{
						ship.thrust.side = 0.05;
					}
					else 
					{
						ship.thrust.side = 0.0;
						ship.thrust.fw = 0.0;
					}
				}
				else 
				{
					ship.thrust.fw = 0.0;
					ship.thrust.side = 0.0;
				}
			}
			else
			{
				if(beh.injection) 
				{
					shipTaskLookAt(ship, beh.angle);
					ship.thrust.fw = 1.0;

					if(getFrameSpeed(ship) >= orbitSpeed(planets[ship.frame].mass, 0.001, calt))
					{
						beh.radius = alt;
						ship.thrust.fw = 0.0;
						beh.maintain = true;
					}
				}
				else 
				{

					if(alt <= beh.radius / 2.0)
					{
						shipTaskLookAt(ship, Math.atan2(ship.y - frame.y, ship.x - frame.x) - Math.PI / 2.0);
						ship.thrust.fw = 1.0;
					}
					else if(alt >= beh.palt)
					{
						// Rotate
						shipTaskLookAt(ship, Math.atan2(ship.y - frame.y, ship.x - frame.x));
						ship.thrust.fw = 0.0;
					}
					else
					{
						// Circularize, we are at apoapsis
						if(beh.angle == undefined)
						{
							beh.angle = Math.atan2(ship.y - frame.y, ship.x - frame.x);
						}
						
						shipTaskLookAt(ship, beh.angle);
						ship.thrust.fw = 0.0;

						lookDev = aiLookAt(ship, dt, ship.ai.task);

						if(lookDev <= 0.1)
						{
							beh.injection = true;
						}
						
					}
				}
			}

			beh.palt = alt;
		}
	}

}