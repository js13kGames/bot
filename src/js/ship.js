
// A ship is made out of a shaped hull, 
// weapon attachment points, and thrusters
function createShip(type, nseed)
{

	let shipValues = [
		// Maneouver, Speed, Armor, Fuel, Cargo
		2.0, 		11.0, 	50.0, 	100.0, 50.0, 	// Fighter
		0.8, 		8.0, 	100.0, 	200.0, 150.0, 	// Freighter
		0.6, 		6.0, 	400.0, 	250.0, 80.0];	// Destroyer

	seed = nseed;

	var stats = {};
	var hull = Array();
	var weapons = Array();
	var thrusters = Array();
	var length;
	var width;

	if(type == 0)
	{
		width = rrg(50, 100) * 0.5;
		length = width * rrg(100, 140) * 0.01;

		// widths per length
		var slope = length / (width * 2.0);

		// Triangle hull
		hull.push({x: -width / 2.0, y: 0.0});
		hull.push({x: width / 2.0, y: 0.0});
		hull.push({x: 0.0, y: length});
		hull.push({x: length * 0.5 * slope, y: length * 0.5});
		hull.push({x: width * 0.8, y: length * 0.5});
		hull.push({x: -width * 0.8, y: length * 0.5});
		hull.push({x: 0.0, y: length * 2.0});
		hull.push({x: width * 0.8, y: length * 0.5});
		hull.push({x: length * 0.5 * slope, y: length * 0.5});
		hull.push({x: 0.0, y: length});
		
		// Forwad / Rot thrusters
		var thrusterOff = width * rrg(30, 70) * 0.005;
		thrusters.push({x:-thrusterOff, y:0.0, size: 6.0, t: 0.0, dir: 0.0});
		thrusters.push({x:thrusterOff, y:0.0, size:6.0, t: 0.0, dir: 0.0});

		// Side thrusters, and back thruster
		thrusters.push({x:0.0, y: length * 2.0, size: 6.0, t: 0.0, dir: Math.PI});
		thrusters.push({x:0.0, y: length * 2.0, size:6.0, t: 0.0, dir: Math.PI / 2.0});
		thrusters.push({x:0.0, y: length * 2.0, size: 6.0, t: 0.0, dir: -Math.PI / 2.0});

		// Back directional thrusters
		thrusters.push({x:thrusterOff, y:0.0, size: 6.0, t: 0.0, dir: Math.PI / 2.0});
		thrusters.push({x:-thrusterOff, y:0.0, size:6.0, t: 0.0, dir: -Math.PI / 2.0});


		// 2 Weapons
		var lPos = rrg(60, 90) * length * 0.01;
		var weaponOff = lPos * slope * 0.5;

		weapons.push({x: weaponOff, y: lPos, dir: 0, size: 12.0, angle: Math.PI / 2.5, speed: 8.0, ftime: 0.2, ftimer: 0.0});
		weapons.push({x: -weaponOff, y: lPos, dir: 0, size: 12.0, angle: Math.PI / 2.5, speed: 8.0, ftime: 0.2, ftimer: 0.0});
	}
	else if(type == 1)
	{
		// Freighter, jack of all trades
		width = rrg(100, 160) * 0.5;
		length = width * rrg(140, 180) * 0.01;
		var mlength = length * rrg(130, 170) * 0.01;
		var lengthd = mlength - length;

		// Rectangle hull
		hull.push({x: -width / 2.0, y: 0.0});
		hull.push({x: width / 2.0, y: 0.0});
		hull.push({x: width / 2.0, y: length});
		hull.push({x: -width / 2.0, y: length});
		hull.push({x: width / 8.0, y: length});
		hull.push({x: width / 8.0, y: mlength});
		hull.push({x: -width / 8.0, y: mlength});
		hull.push({x: -width / 8.0, y: length});
		hull.push({x: -width / 2.0, y: length});

		var thrusterOff = width * rrg(30, 70) * 0.05;
		// 2 Thrusters
		var thrusterOff = width * rrg(30, 70) * 0.005;
		thrusters.push({x:-thrusterOff, y:0.0, size: 12.0, t: 0.0, dir: 0});
		thrusters.push({x:thrusterOff, y:0.0, size: 12.0, t: 0.0, dir: 0});

		// Directionals front
		thrusters.push({x:0.0, y:lengthd * 0.8 + length, size: 7.0, t: 0.0, dir: Math.PI});

		// Directionals sides front
		thrusters.push({x:0.0, y:lengthd * 0.8 + length, size: 7.0, t: 0.0, dir: Math.PI / 2.0});
		thrusters.push({x:0.0, y:lengthd * 0.8 + length, size: 7.0, t: 0.0, dir: -Math.PI / 2.0});

		// Directionals sides back
		thrusters.push({x:thrusterOff, y:0.0, size: 7.0, t: 0.0, dir: Math.PI / 2.0});
		thrusters.push({x:-thrusterOff, y:0.0, size: 7.0, t: 0.0, dir: -Math.PI / 2.0});


		// 2 Front Weapons
		var lPos = rrg(70, 100) * length * 0.01;
		var weaponOff = rrg(50, 80) * width * 0.005;

		weapons.push({x: weaponOff, y: lPos, dir: 0, size: 16.0, angle: Math.PI / 2.0, speed: 4.0, ftime: 0.3, ftimer: 0.0});
		weapons.push({x: -weaponOff, y: lPos, dir: 0, size: 16.0, angle: Math.PI / 2.0, speed: 4.0, ftime: 0.3, ftimer: 0.0});

		// 2 Side Weapons
		var lPos = rrg(30, 60) * length * 0.01;
		var weaponOff = rrg(50, 80) * width * 0.005;

		weapons.push({x: weaponOff, y: lPos, dir: -Math.PI / 2.0, size: 24.0, angle: Math.PI / 2.0, speed: 2.0, ftime: 0.5, ftimer: 0.0});
		weapons.push({x: -weaponOff, y: lPos, dir: Math.PI / 2.0, size: 24.0, angle: Math.PI / 2.0, speed: 2.0, ftime: 0.5, ftimer: 0.0});
	}
	else if(type == 2)
	{
		width = rrg(180, 260) * 0.5;
		length = width * rrg(200, 320) * 0.01;
		var centerWidth = width * rrg(40, 70) * 0.01;
		var waistLength = rrg(30, 60) * length * 0.01;
		// Waist-style hull
		
		// Bottom vertices
		hull.push({x: width / 2.0, y: 0.0});
		hull.push({x: centerWidth / 2.0, y: waistLength});
		hull.push({x: width / 2.0, y: length});
		hull.push({x: 0.0, y: length * 1.1});
		hull.push({x: -width / 2.0, y: length});
		hull.push({x: -centerWidth / 2.0, y: waistLength});
		hull.push({x: -width / 2.0, y: 0.0});

		// One huge thruster
		thrusters.push({x:0.0, y:0.0, size: 20.0, t: 0.0, dir: 0.0});

		// Two small ones
		thrusters.push({x:width / 2.2, y: 0.0, size: 14.0, t: 0.0, dir: 0.0});
		thrusters.push({x:-width / 2.2, y: 0.0, size: 14.0, t: 0.0, dir: 0.0});

		// Directional thrusters
		thrusters.push({x:-centerWidth * 0.5, y: waistLength, size: 12.0, t: 0.0, dir: -Math.PI / 2.0});
		thrusters.push({x:centerWidth * 0.5, y: waistLength, size: 12.0, t: 0.0, dir: Math.PI / 2.0});

		thrusters.push({x:-centerWidth * 0.5, y: waistLength, size: 12.0, t: 0.0, dir: Math.PI * 1.15});
		thrusters.push({x:centerWidth * 0.5, y: waistLength, size: 12.0, t: 0.0, dir: -Math.PI * 1.15});

		// One huge center weapon
		weapons.push({x: 0.0, y: waistLength, dir: 0, size: 32.0, angle: Math.PI, speed: 2.0, ftime: 1.0, ftimer: 0.0});

		// Two side
		weapons.push({x: centerWidth / 2.2, y: waistLength * 1.8, dir: -Math.PI / 2.5, size: 20.0, angle: Math.PI / 2.0, speed: 2.0, ftime: 0.4, ftimer: 0.0});
		weapons.push({x: -centerWidth / 2.2, y: waistLength * 1.8, dir: Math.PI / 2.5, size: 20.0, angle: Math.PI / 2.0, speed: 2.0, ftime: 0.4, ftimer: 0.0});

		// Two front
		weapons.push({x: centerWidth / 1.8, y: length * 0.95, dir: 0, size: 12.0, angle: Math.PI / 2.5, speed: 4.0, ftime: 0.1, ftimer: 0.0});
		weapons.push({x: -centerWidth / 1.8, y: length * 0.95, dir: 0, size: 12.0, angle: Math.PI / 2.5, speed: 4.0, ftime: 0.1, ftimer: 0.0});
	}

	stats.maneouver = shipValues[type * 5 + 0];
	stats.speed = shipValues[type * 5 + 1];
	stats.armor = shipValues[type * 5 + 2];
	stats.fuel = shipValues[type * 5 + 3];
	stats.cargo = shipValues[type * 5 + 4];

	
	var thrust = {fw: 0.0, side: 0.0, rot: 0.0};

	var scale = rrg(16, 22) * 0.01;

	return {type: type, stats: stats, hull: hull, weapons: weapons, thrusters: thrusters, width: width, length: length, 
		x: 0.0, y: 0.0, rot: Math.PI, angspeed: 0.0, speed: {x: 0.0, y: 0.0}, thrust: thrust, acc: {x: 0.0, y: 0.0}, landed: false,
	scale: scale, firing: false}
}

function drawShip(ship)
{
	ctx.translate(ship.x, ship.y);

	ctx.scale(ship.scale, ship.scale);

	ctx.rotate(ship.rot);

	ctx.translate(0.0, -ship.length / 2.0)

	// Draw hull
	ctx.fillStyle = 'rgb(100, 100, 100)';
	ctx.strokeStyle = 'rgb(255, 255, 255)';
	ctx.lineWidth = 2.0;
	ctx.beginPath();

	ctx.moveTo(ship.hull[0].x, ship.hull[0].y);

	for(var i = 1; i < ship.hull.length; i++)
	{
		ctx.lineTo(ship.hull[i].x, ship.hull[i].y);
	}

	ctx.lineTo(ship.hull[0].x, ship.hull[0].y);

	ctx.fill();
	ctx.stroke();

	// Draw thrusters
	for(var i = 0; i < ship.thrusters.length; i++)
	{
		ctx.fillStyle = 'rgb(60, 60, 60)';
		ctx.strokeStyle = 'rgb(255, 255, 255)';
		ctx.lineWidth = 2.0;

		var thruster = ship.thrusters[i];
		var thrusterSize = thruster.size;

		var endPointX = Math.cos(thruster.dir - Math.PI / 2.0);
		var endPointY = Math.sin(thruster.dir - Math.PI / 2.0);

		var perpX = Math.cos(thruster.dir);
		var perpY = Math.sin(thruster.dir);

		var nozzleX = endPointX * thrusterSize * 2.0 + perpX * thrusterSize * 0.7;
		var nozzleY = endPointY * thrusterSize * 2.0 + perpY * thrusterSize * 0.7;
		var nozzle1X = endPointX * thrusterSize * 2.0 - perpX * thrusterSize * 0.7;
		var nozzle1Y = endPointY * thrusterSize * 2.0 - perpY * thrusterSize * 0.7;

		ctx.beginPath();

		// Thruster triangle
		ctx.moveTo(thruster.x, thruster.y);
		ctx.lineTo(thruster.x + nozzleX, thruster.y + nozzleY);
		ctx.lineTo(thruster.x + nozzle1X, thruster.y + nozzle1Y);
		ctx.lineTo(thruster.x, thruster.y);

		ctx.fill();
		ctx.stroke();

		ctx.beginPath();

		ctx.arc(thruster.x, thruster.y, thrusterSize, 0.0, Math.PI * 2.0);

		ctx.fill();
		ctx.stroke();
	}



	// Draw weapon attachments
	for(var i = 0; i < ship.weapons.length; i++)
	{
		ctx.fillStyle = 'rgb(170, 90, 90)';
		ctx.strokeStyle = 'rgb(255, 255, 255)';
		ctx.lineWidth = 2.0;

		var weapon = ship.weapons[i];
		var weaponSize = weapon.size;

		ctx.beginPath();

		ctx.rect(weapon.x - weaponSize / 2.0, weapon.y - weaponSize / 2.0, weaponSize, weaponSize);
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();

		ctx.lineWidth = 4.0;
		ctx.moveTo(weapon.x, weapon.y);
		var off = weaponSize * 1.5;
		ctx.lineTo(
		weapon.x + off * Math.cos(weapon.rdir + Math.PI / 2.0 - ship.rot), 
		weapon.y + off * Math.sin(weapon.rdir + Math.PI / 2.0 - ship.rot));
		ctx.stroke();
	}

	
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	doCameraTransform();

}

// TODO: Could be optimized into drawShip, but exhaust receive shadows
function drawShipExhaust(ship)
{
	ctx.translate(ship.x, ship.y);

	ctx.scale(ship.scale, ship.scale);

	ctx.rotate(ship.rot);

	ctx.translate(0.0, -ship.length / 2.0)


	for(var i = 0; i < ship.thrusters.length; i++)
	{
		// Draw exhaust
		ctx.fillStyle = 'rgb(255, 255, 255)';
		ctx.strokeStyle = 'rgb(180, 180, 255)';
		ctx.lineWidth = 2.0;

		var thruster = ship.thrusters[i];
		var thrusterSize = thruster.size;

		var endPointX = Math.cos(thruster.dir - Math.PI / 2.0);
		var endPointY = Math.sin(thruster.dir - Math.PI / 2.0);

		var perpX = Math.cos(thruster.dir);
		var perpY = Math.sin(thruster.dir);

		var nozzleX = endPointX * thrusterSize * 2.0 + perpX * thrusterSize * 0.7;
		var nozzleY = endPointY * thrusterSize * 2.0 + perpY * thrusterSize * 0.7;
		var nozzle1X = endPointX * thrusterSize * 2.0 - perpX * thrusterSize * 0.7;
		var nozzle1Y = endPointY * thrusterSize * 2.0 - perpY * thrusterSize * 0.7;

		var thrust = (thruster.t + 0.00) * 8.0;

		ctx.beginPath();
		ctx.lineTo(thruster.x + nozzleX, thruster.y + nozzleY);
		ctx.lineTo(thruster.x + endPointX * (thrust + 2.0) * thrusterSize, thruster.y + thrusterSize * (thrust + 2.0) * endPointY);
		ctx.lineTo(thruster.x + nozzle1X, thruster.y + nozzle1Y);

		ctx.fill();
		ctx.stroke();
	}

	
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	doCameraTransform();
}

function xvals(val)
{
	var a = 0.0;
	var b = 0.0;
	if(val >= 0.0)
	{
		a = val;
	}
	else 
	{
		b = -val;
	}

	return {a: a, b: b}
}

function setShipThrust(ship)
{
	var xrot = xvals(ship.thrust.rot);
	var xside = xvals(ship.thrust.side);
	var xfw = xvals(ship.thrust.fw);
	if(ship.type == 2)
	{
		ship.thrusters[0].t = xfw.a;
		ship.thrusters[2].t = Math.max(xrot.b, xfw.a);
		ship.thrusters[1].t = Math.max(xrot.a, xfw.a);
		ship.thrusters[3].t = xside.b;
		ship.thrusters[4].t = xside.a;
		ship.thrusters[5].t = xfw.b;
		ship.thrusters[6].t = xfw.b;
	}
	else
	{
		ship.thrusters[0].t = xfw.a;
		ship.thrusters[1].t = xfw.a;
		ship.thrusters[2].t = xfw.b;
		ship.thrusters[3].t = Math.max(xside.a, xrot.a);
		ship.thrusters[4].t = Math.max(xside.b, xrot.b);
		ship.thrusters[5].t = Math.max(xside.a, xrot.b);
		ship.thrusters[6].t = Math.max(xside.b, xrot.a);
	}
}

// Aims all ship guns to given point
function aimShipGuns(ship, p, dt)
{
	// Transform p to ship-relative coordinates

	var px = p.x - ship.x;
	var py = p.y - ship.y;

	for(var i = 0; i < ship.weapons.length; i++)
	{
		var weapon = ship.weapons[i];

		var srot = ship.rot;
	
		weapon.dir = sanitizeAngle(weapon.dir);
		var ang = srot + weapon.dir + Math.PI / 2.0;

		ang = sanitizeAngle(ang);


		var wepx = Math.cos(ang);
		var wepy = Math.sin(ang);

		var wdir = weapon.dir + srot;

		var dot = wepx * px + wepy * py;
		var det = wepx * py - wepy * px;
		var angle0 = Math.atan2(py - wepy, px - wepx);
		var angle = Math.atan2(py, px) - Math.atan2(wepy, wepx);
		if (angle > Math.PI)        { angle -= 2 * Math.PI; }
		else if (angle <= -Math.PI) { angle += 2 * Math.PI; }

		if(Math.abs(angle) <= weapon.angle)
		{
			weapon.wdir = angle0 - Math.PI * 0.5;
			weapon.aim = true;
		}
		else
		{
			weapon.wdir = wdir;
			weapon.aim = false;
		}

		if(weapon.rdir == undefined)
		{
			weapon.rdir = wdir;
		}

		// TODO: Smooth gun aiming
		weapon.rdir = weapon.wdir;

		var slong = rotate(0.0, -ship.length / 2.0, ship.rot);
		var off = weapon.size * 1.5;
		var dx = Math.cos(weapon.rdir + Math.PI / 2.0);
		var dy = Math.sin(weapon.rdir + Math.PI / 2.0);

		var rpos = rotate(weapon.x * ship.scale, weapon.y * ship.scale, ship.rot);

		rpos.x += off * dx * ship.scale;
		rpos.y += off * dy * ship.scale;

		weapon.muzzle = {
			x: ship.x + rpos.x + ship.scale * slong.x, 
			y: ship.y + rpos.y + ship.scale * slong.y,
			dx: dx, dy: dy};
	}
}

function predictShip(ship)
{
	ship.predict = [];
	
	ship.predict.push({x: ship.x, y: ship.y, sx: ship.speed.x, sy: ship.speed.y, time: time});


	var step = 0.5;
	var max = 500;
	var minDist = 25.0;

	if(ship.frame == 0)
	{
		step = 5.0;
		max = 15000;
		minDist = 1500.0;
	}
	else 
	{
		if(planets[ship.frame].center != 0)
		{
			step = 0.25;
		}
	}
	

	var prevDist = 0.0;

	var frameThen = planetAtTime(ship.frame, time);

	for(var i = 0; i < max / step; i++)
	{
		var point = {x: ship.predict[i].x, y: ship.predict[i].y};
		var speed = {x: ship.predict[i].sx, y: ship.predict[i].sy};
		var ntime = ship.predict[i].time;
		ntime += step;
		point.x += speed.x * step;
		point.y += speed.y * step;
		var acc = gravity(point, ntime);
		speed.x += acc.x * step;
		speed.y += acc.y * step;

		var frameNow = planetAtTime(ship.frame, ntime);
		
		var shipNow = {x: ship.x + frameNow.x - frameThen.x, y: ship.y + frameNow.y - frameThen.y};

		var dist = distance(point.x, point.y, shipNow.x, shipNow.y);

		if(dist < prevDist)
		{
			if(dist <= minDist)
			{
				ship.predict.push(ship.predict[0]);
				break;
			}
		}

		var coll = collidesWithAny(point, ntime);
		if(coll != null)
		{
			var pos0 = planetAtTime(coll.planet, ntime);
			ship.predict.push({x: coll.sx + pos0.x, y: coll.sy + pos0.y, sx: 0.0, sy: 0.0, time: ntime});
			break;
		}
		else
		{
			ship.predict.push({x: point.x, y: point.y, sx: speed.x, sy: speed.y, time: ntime});
		}

		prevDist = dist;
		
	}
}

function simulateShip(ship, dt)
{
	setShipThrust(ship);
	
	if(ship.nograv == undefined)
	{
		ship.nograv = 0.0;
	}

	if(ship.landed == true)
	{
		var pos = planetAtTime(ship.coll.planet, time);
		var landedPlanet = planets[ship.coll.planet];

		var speed = orbitVelocity(landedPlanet.center, landedPlanet.mass, landedPlanet.orbitRadius, time, landedPlanet.orbitOffset);
		ship.x = pos.x + ship.coll.sx;
		ship.y = pos.y + ship.coll.sy;
		ship.speed.x = 0.0;
		ship.speed.y = 0.0;

		var fwt = ship.thrust.fw;
		if(fwt > 0.0)
		{
			ship.landed = false;
			ship.speed.x = ship.coll.nx * 15.0 + speed.x;
			ship.speed.y = ship.coll.ny * 15.0 + speed.y;
			ship.nograv = 0.1;
			ship.x += ship.speed.x * dt;
			ship.y += ship.speed.y * dt;
		}
	}
	else 
	{
		// Acceleration 
		var point = {x: ship.x, y: ship.y};
		
		var coll = collidesWithAny(point, time);
		if(coll != null)
		{
			// TODO: Check speed
			ship.landed = true;
			ship.coll = coll;

		}

		var fwt = ship.thrust.fw;
		var sidet = ship.thrust.side;

		var front = {x: Math.cos(ship.rot + Math.PI / 2.0), y: Math.sin(ship.rot + Math.PI / 2.0)};
		var side = {x: Math.cos(ship.rot), y: Math.sin(ship.rot)};

		ship.speed.x += front.x * fwt * ship.stats.speed * dt * 5.0;
		ship.speed.y += front.y * fwt * ship.stats.speed * dt * 5.0;
		ship.speed.x += side.x * -sidet * ship.stats.speed * dt * 5.0;
		ship.speed.y += side.y * -sidet * ship.stats.speed * dt * 5.0;

		ship.angspeed += ship.stats.maneouver * dt * ship.thrust.rot;
		ship.x += ship.speed.x * dt;
		ship.y += ship.speed.y * dt;
		ship.rot += ship.angspeed * dt;

		if(ship.nograv < 0.0)
		{
			var acc = gravity(point, -1.0);
			ship.speed.x += acc.x * dt;
			ship.speed.y += acc.y * dt;
			ship.acc = acc;
		}

		ship.nograv -= dt;


	}

	// Guns!
	
	for(var i = 0; i < ship.weapons.length; i++)
	{
		if(ship.firing && ship.weapons[i].aim == true && ship.weapons[i].ftimer <= 0.0)
		{
			var weapon = ship.weapons[i];

			var muzzle = weapon.muzzle;
			var muzzledir = normalize(muzzle.dx, muzzle.dy);


			var size = weapon.size / 8.0;
			var speed = 650.0 - (weapon.size / 32.0) * 350.0;

			explode(muzzle.x, muzzle.y, 
				ship.speed.x + muzzledir.x * 15.0, 
				ship.speed.y + muzzledir.y * 15.0, size * 4.0, 1.0, 0.5, true);

			// Fire
			weapon.ftimer = weapon.ftime;

			shoot(muzzle.x, muzzle.y, muzzledir.x * speed + ship.speed.x, muzzledir.y * speed + ship.speed.y, 0, size, 10.0);
		}

		ship.weapons[i].ftimer -= dt;
	}
}


function drawShipMap(ship)
{
	ctx.fillStyle = 'rgb(128, 255, 128)';

	/*var size = (ship.type + 1) * 45.0;

	var rrot = ship.rot + Math.PI / 2.0;

	var frontX = Math.cos(rrot) * size * 4.0;
	var frontY = Math.sin(rrot) * size * 4.0;

	var back0X = Math.cos(rrot + Math.PI / 3.0) * size * 0.5;
	var back0Y = Math.sin(rrot + Math.PI / 3.0) * size * 0.5;

	var back1X = Math.cos(rrot - Math.PI / 3.0) * size * 0.5;
	var back1Y = Math.sin(rrot - Math.PI / 3.0) * size * 0.5;

	ctx.beginPath();
	ctx.arc(ship.x, ship.y, size * 1.0, 0.0, Math.PI * 2.0);
	ctx.moveTo(ship.x + frontX, ship.y + frontY);
	ctx.lineTo(ship.x - back0X, ship.y - back0Y);
	ctx.lineTo(ship.x - back1X, ship.y - back1Y);
	ctx.fill();*/

	ctx.beginPath();
	ctx.arc(ship.x, ship.y, 25.0, 0.0, Math.PI * 2.0);
	ctx.fill();
}

function drawShipHud(ship)
{
	ctx.strokeStyle = 'rgb(187,128,255)';
	// Predicted orbit
	if(ship.predict != undefined)
	{
		ctx.beginPath();
		var frame = planets[ship.frame];

		for(var i = 0; i < ship.predict.length; i++)
		{
			var frameThen = planetAtTime(ship.frame, ship.predict[i].time);

			var px = ship.predict[i].x - frameThen.x + frame.x;
			var py = ship.predict[i].y - frameThen.y + frame.y;

			if(i == 0)
			{
				ctx.moveTo(px, py);
			}
			else
			{

				ctx.lineTo(px, py);
			}
		}

		ctx.stroke();
	}	


	var size = 32.0;
	var rsize = Math.max(size / camera.zoom, size);
	ctx.strokeStyle = 'rgb(128, 128, 128)';
	ctx.lineWidth = Math.max(2.0 / camera.zoom, 2.0);
	ctx.beginPath();
	ctx.arc(ship.x, ship.y, rsize, 0.0, Math.PI * 2.0);
	ctx.stroke();

	ctx.strokeStyle = 'rgb(255, 255, 255)';
	// Ship orientation
	var forward = {x: Math.cos(ship.rot + Math.PI / 2.0), y: Math.sin(ship.rot + Math.PI / 2.0)};
	ctx.beginPath();
	ctx.moveTo(ship.x + forward.x * rsize * 0.5, ship.y + forward.y * rsize * 0.5);
	ctx.lineTo(ship.x + forward.x * rsize, ship.y + forward.y * rsize);
	ctx.stroke();

	var frame = planets[ship.frame];
	var frameVel;
	if(ship.frame == 0)
	{
		frameVel = {x: 0.0, y: 0.0};
	}
	else
	{
		frameVel = orbitVelocity(frame.center, frame.mass, frame.orbitRadius, time, frame.orbitOffset);
	}
	

	var prograde = normalize(ship.speed.x - frameVel.x, ship.speed.y - frameVel.y);
	var retrograde = {x: -prograde.x, y: -prograde.y}
	var normal = {x: -prograde.y, y: prograde.x};
	var antinormal = {x: prograde.y, y: -prograde.x};
	var planet = normalize(ship.acc.x, ship.acc.y);

	ctx.strokeStyle = 'rgb(255,214,117)';
	ctx.beginPath();
	ctx.moveTo(ship.x + prograde.x * rsize * 1.0, ship.y + prograde.y * rsize * 1.0);
	ctx.lineTo(ship.x + prograde.x * rsize * 1.5, ship.y + prograde.y * rsize * 1.5);
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(ship.x + retrograde.x * rsize * 1.25, ship.y + retrograde.y * rsize * 1.25);
	ctx.lineTo(ship.x + retrograde.x * rsize * 1.5, ship.y + retrograde.y * rsize * 1.5);
	ctx.stroke();


	ctx.strokeStyle = 'rgb(87,188,255)';
	ctx.beginPath();
	ctx.moveTo(ship.x + normal.x * rsize * 1.0, ship.y + normal.y * rsize * 1.0);
	ctx.lineTo(ship.x + normal.x * rsize * 1.5, ship.y + normal.y * rsize * 1.5);
	ctx.stroke();

	ctx.beginPath();
	ctx.moveTo(ship.x + antinormal.x * rsize * 1.25, ship.y + antinormal.y * rsize * 1.25);
	ctx.lineTo(ship.x + antinormal.x * rsize * 1.5, ship.y + antinormal.y * rsize * 1.5);
	ctx.stroke();

	// Planet
	ctx.fillStyle = 'rgb(187,128,255)';
	ctx.beginPath();
	ctx.arc(ship.x + planet.x * rsize, ship.y + planet.y * rsize, rsize / 15.0, 0.0, Math.PI * 2.0);
	ctx.fill();

	
	
}