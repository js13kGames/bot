
// A ship is made out of a shaped hull, 
// weapon attachment points, and thrusters
function createShip(type, nseed)
{
	let shipValues = [1.0, 10.0, 50.0, 100.0, 50.0, 0.5, 6.0, 100.0, 200.0, 150.0, 0.2, 2.0, 400.0, 250.0, 80.0];

	seed = nseed;

	var stats = {};
	var hull = Array();
	var weapons = Array();
	var thrusters = Array();
	var length;

	if(type == 0)
	{
		var width = rrg(50, 100) * 0.5;
		length = width * rrg(100, 140) * 0.01;

		// widths per length
		var slope = length / (width * 2.0);

		// Triangle hull
		hull.push({x: -width / 2.0, y: 0.0});
		hull.push({x: width / 2.0, y: 0.0});
		hull.push({x: 0.0, y: length});

		// 2 Thrusters
		var thrusterOff = width * rrg(30, 70) * 0.005;
		thrusters.push({x:-thrusterOff, y:0.0, size: 6.0, t: 0.0});
		thrusters.push({x:thrusterOff, y:0.0, size:6.0, t: 0.0});

		// 2 Weapons
		var lPos = rrg(60, 90) * length * 0.01;
		var weaponOff = lPos * slope * 0.5;

		weapons.push({x: weaponOff, y: lPos, dir: 0, size: 12.0, angle: Math.PI / 2.5, speed: 8.0});
		weapons.push({x: -weaponOff, y: lPos, dir: 0, size: 12.0, angle: Math.PI / 2.5, speed: 8.0});
	}
	else if(type == 1)
	{
		// Freighter, jack of all trades
		var width = rrg(100, 160) * 0.5;
		length = width * rrg(140, 180) * 0.01;

		// Rectangle hull
		hull.push({x: -width / 2.0, y: 0.0});
		hull.push({x: width / 2.0, y: 0.0});
		hull.push({x: width / 2.0, y: length});
		hull.push({x: -width / 2.0, y: length});

		var thrusterOff = width * rrg(30, 70) * 0.05;
		// 2 Thrusters
		var thrusterOff = width * rrg(30, 70) * 0.005;
		thrusters.push({x:-thrusterOff, y:0.0, size: 12.0, t: 0.0});
		thrusters.push({x:thrusterOff, y:0.0, size: 12.0, t: 0.0});

		// 2 Front Weapons
		var lPos = rrg(70, 100) * length * 0.01;
		var weaponOff = rrg(50, 80) * width * 0.005;

		weapons.push({x: weaponOff, y: lPos, dir: 0, size: 16.0, angle: Math.PI / 2.0, speed: 4.0});
		weapons.push({x: -weaponOff, y: lPos, dir: 0, size: 16.0, angle: Math.PI / 2.0, speed: 4.0});

		// 2 Side Weapons
		var lPos = rrg(30, 60) * length * 0.01;
		var weaponOff = rrg(50, 80) * width * 0.005;

		weapons.push({x: weaponOff, y: lPos, dir: -Math.PI / 2.0, size: 24.0, angle: Math.PI / 2.0, speed: 2.0});
		weapons.push({x: -weaponOff, y: lPos, dir: Math.PI / 2.0, size: 24.0, angle: Math.PI / 2.0, speed: 2.0});
	}
	else if(type == 2)
	{
		var width = rrg(180, 260) * 0.5;
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
		thrusters.push({x:0.0, y:0.0, size: 20.0, t: 0.0});
		// Two small ones
		thrusters.push({x:width / 2.2, y: 0.0, size: 14.0, t: 0.0});
		thrusters.push({x:-width / 2.2, y: 0.0, size: 14.0, t: 0.0});

		// One huge center weapon
		weapons.push({x: 0.0, y: waistLength, dir: 0, size: 32.0, angle: Math.PI / 2.0, speed: 2.0});

		// Two side
		weapons.push({x: centerWidth / 2.2, y: waistLength * 1.8, dir: -Math.PI / 2.0, size: 20.0, angle: Math.PI / 2.0, speed: 2.0});
		weapons.push({x: -centerWidth / 2.2, y: waistLength * 1.8, dir: Math.PI / 2.0, size: 20.0, angle: Math.PI / 2.0, speed: 2.0});

		// Two front
		weapons.push({x: centerWidth / 1.8, y: length * 0.95, dir: 0, size: 20.0, angle: Math.PI / 2.5, speed: 4.0});
		weapons.push({x: -centerWidth / 1.8, y: length * 0.95, dir: 0, size: 20.0, angle: Math.PI / 2.5, speed: 4.0});
	}

	stats.maneouver = shipValues[type * 5 + 0];
	stats.speed = shipValues[type * 5 + 1];
	stats.armor = shipValues[type * 5 + 2];
	stats.fuel = shipValues[type * 5 + 3];
	stats.cargo = shipValues[type * 5 + 4];

	return {type: type, stats: stats, hull: hull, weapons: weapons, thrusters: thrusters, length: length, x: 0.0, y: 0.0, rot: 0.0}
}

function drawShip(ship)
{
	ctx.translate(ship.x, ship.y);

	ctx.scale(0.25, 0.25);

	ctx.rotate(ship.rot);

	ctx.translate(0.0, -ship.length / 2.0)



	// Draw hull
	ctx.fillStyle = 'rgb(100, 100, 100)';
	ctx.strokeStyle = 'rgb(255, 255, 255)';
	ctx.lineWidth = 2.0;
	ctx.beginPath();
	for(var i = 0; i < ship.hull.length; i++)
	{
		if(i == 0)
		{
			ctx.moveTo(ship.hull[i].x, ship.hull[i].y);
		}
		else
		{
			ctx.lineTo(ship.hull[i].x, ship.hull[i].y);
		}

		if(i == ship.hull.length - 1)
		{
			ctx.lineTo(ship.hull[0].x, ship.hull[0].y);
		}
		
	}

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
		ctx.beginPath();

		// Thruster triangle
		ctx.moveTo(thruster.x, thruster.y);
		ctx.lineTo(thruster.x - thrusterSize * 0.7, thruster.y - thrusterSize * 2.0);
		ctx.lineTo(thruster.x + thrusterSize * 0.7, thruster.y - thrusterSize * 2.0);
		ctx.lineTo(thruster.x, thruster.y);

		ctx.fill();
		ctx.stroke();

		ctx.beginPath();

		ctx.arc(thruster.x, thruster.y, thrusterSize, 0.0, Math.PI * 2.0);

		ctx.fill();
		ctx.stroke();

		// Draw exhaust
		ctx.fillStyle = 'rgb(255, 255, 255)';
		ctx.strokeStyle = 'rgb(180, 180, 255)';
		ctx.lineWidth = 4.0;

		var thrust = (thruster.t + 0.05) * 8.0;

		ctx.beginPath();
		ctx.moveTo(thruster.x + thrusterSize * 0.7, thruster.y - thrusterSize * 2.0);
		ctx.lineTo(thruster.x, thruster.y - thrusterSize * (thrust + 2.0));
		ctx.lineTo(thruster.x - thrusterSize * 0.7, thruster.y - thrusterSize * 2.0);

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

function setShipThrust(ship, right, left)
{
	if(ship.thrusters.length > 2)
	{
		var center = 1.0 - Math.abs(right - left);
		ship.thrusters[0].t = center;
		ship.thrusters[1].t = left;
		ship.thrusters[2].t = right;
	}
	else
	{
		ship.thrusters[0].t = left;
		ship.thrusters[1].t = right;
	}
}

// Aims all ship guns to given point
function aimShipGuns(ship, p, dt)
{
	ship.rot = sanitizeAngle(ship.rot);


	// Transform p to ship-relative coordinates

	var px = p.x - ship.x;
	var py = p.y - ship.y;

	for(var i = 0; i < ship.weapons.length; i++)
	{
		var weapon = ship.weapons[i];


		weapon.dir = sanitizeAngle(weapon.dir);

		var wepx = Math.cos(ship.rot + weapon.dir + Math.PI / 2.0);
		var wepy = Math.sin(ship.rot + weapon.dir + Math.PI / 2.0);

		var wdir = weapon.dir + ship.rot;

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

		//weapon.rdir = sanitizeAngle(weapon.rdir);
		//weapon.wdir = sanitizeAngle(weapon.wdir);

		var diff = (weapon.rdir - weapon.wdir);
		//sanitizeAngle(diff);
		

		if(Math.abs(diff) >= 0.5)
		{
			weapon.rdir -= Math.sign(diff) * dt * weapon.speed;
		}
		else 
		{
			weapon.rdir -= diff * dt * weapon.speed;
		}

		weapon.rdir = weapon.wdir;
	}
}
