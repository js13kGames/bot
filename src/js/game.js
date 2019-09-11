var rockNames = ["Lygkos", "Lithos", "Guamedo", "Eadu", "Anoth", "Dikti", "Big Iron", "Impetu"]
var terraNames = ["Delphi", "Trapani", "Erytrae", "Gaia", "Boston", "Jericho", "Nile", "New London"];
var gasNames = ["Bespin", "Nuvo", "New Jupiter", "Vol", "Lightbulb", "Big Boy"];
var desertNames = ["Rhodes", "New Jairo", "Jakku", "Savareen", "Arrakis", "New Sahara"]


// Init
let previousTime = 0.0;

var time = 0.0;

var canvas = document.getElementById("canvas");
canvas.width = window.innerWidth * 1.0;
canvas.height = window.innerHeight * 1.0;

var ctx = canvas.getContext("2d");
var starFieldSize = Math.floor(Math.max(canvas.width, canvas.height) * (1.0 + Math.sqrt(2)));
var starFieldData = ctx.createImageData(starFieldSize, starFieldSize);
var starFieldImage;

var brightSize = 768;
var brightData = ctx.createImageData(brightSize, brightSize);
var brightImage;



var planets = Array();
var planetCount = rrg(9, 14);

var explosions = Array();
var bullets = Array();
var fire = Array();

var sun;

// Ship 0 is always the player ship
var ships = Array();
var rings = Array();

var camera = {x: 0, y: 0, zoom: 0.5};
var aimPoint = {x: 0, y: 0}
var mousePos = {x: 0, y: 0}


var thrustSpeed = 1.0;

var mapMode = 0.0;


var shipMass = 0.001;

var timestep = 1.0;
var dtval = 0.0;
var lockCamera = false;

var timestepVals = [0.0, 1.0, 2.0, 4.0, 10.0, 25.0, 50.0, 100.0];
var timestepVal = 0;
var eventTimer = 0.0;
var eventStr = "";

// Player "inventory"
var plOre = 0.0;
var plMoney = 5000.0;
var plHasFreighter = false;
var plHasDestroyer = false;
var plLevels = [1, 1, 1];
var plHealths = [0, 0, 0];

var playerShipSeed = rrg(0, 10000);

generateStarfield();
generateBright();
generate();

sun.name = "The Sun";

// Find terra planet
var terra = 1;
for(var i = 0; i < planets.length; i++)
{
	if(planets[i].type == 1)
	{
		terra = i;
		planets[i].name = "New Earth";
		planets[i].cities = [];
		createCities(planets[i], 0.5, 0);
		break;
	}
}

ships.push(createShip(0, playerShipSeed, 2, plLevels[0]));
putShipInOrbit(ships[0], terra, 800.0, 0.0, true);
ships[0].predict = new Array();
ships[0].frame = terra;

var chooseFrame = false;
var chooseFocus = false;
var predictTimer = 0.0;

var camFocus = -1;

var tooltipTime = 0.0;
var tooltipFocus = -1;
var tooltipEnabled = false;

var mineTimer = 0.0;

var tutShown = false;

timestep = 0.0;


function update()
{
	var dt = dtval;



	for(var nn = 0; nn < timestep; nn++)
	{
		var dt = dtval;
		mineTimer -= dt;
		/*if(timestep > 1)
		{
			dt = dt * 2.0;
		}*/


		anyAtWar = false;

		for(var i = 1; i < planets.length; i++)
		{
			var planet = planets[i];
	
			updateWar(planet, dt);

			var cx = planets[planet.center].x;
			var cy = planets[planet.center].y;
			var cmass = planets[planet.center].mass;
	
			var planetPos = orbit(cx, cy, cmass, planet.mass, planet.orbitRadius, time + planet.orbitOffset);
			planet.x = planetPos.x; planet.y = planetPos.y;
		}

		if(anyAtWar)
		{
			selectSong = 2;
		}
		else 
		{
			selectSong = 0;

			if(ships[0] != undefined && ships[0].landed)
			{
				selectSong = 1;
			}
		
		}

		if(dtval > 0.0)
		{
			for(var i = 0; i < ships.length; i++)
			{
				var ship = ships[i];

				if(ship != undefined)
				{
					if(i > 0)
					{
						updateShipAI(ship, dt);
					}
					else 
					{
						aimShipGuns(ship, aimPoint, dt);
					}

					if(simulateShip(ship, dt))
					{
						if(i != 0)
						{
							ships.splice(i, 1);
							var idx = Math.abs(camFocus + 1);

							if(idx == i)
							{
								camFocus = -1;
							}

							i--;
						}
					}
				}
			}
			
			for(var i = 0; i < explosions.length; i++)
			{
				if(updateExplosion(explosions[i], dt))
				{
					explosions.splice(i, 1);
					i--;
				}
			}

			for(var i = 0; i < fire.length; i++)
			{
				if(updateFire(fire[i], dt))
				{
					fire.splice(i, 1);
					i--;
				}
			}

			for(var i = 0; i < bullets.length; i++)
			{
				if(updateBullet(bullets[i], dt))
				{
					bullets.splice(i, 1);
					i--;
				}
			}

			time = time + dt;			
		}

	}
	
	if(dtval > 0.0)
	{
		aimPoint = {x: mousePos.x, y: mousePos.y};
		aimPoint.x -= canvas.width / 2.0;
		aimPoint.y -= canvas.height / 2.0;

		if(lockCamera)
		{

			var rrot = ships[0].rot + Math.PI;
			var rot = rotate(aimPoint.x, aimPoint.y, rrot);
			aimPoint.x = rot.x; aimPoint.y = rot.y;
		}

		aimPoint.x *= 1.0 / camera.zoom;
		aimPoint.y *= 1.0 / camera.zoom;

		aimPoint.x += camera.x;
		aimPoint.y += camera.y;
		
		if(camFocus < 0)
		{
			var idx = Math.abs(camFocus + 1);
			if(ships[idx] != undefined)
			{
				camera.x = ships[idx].x;
				camera.y = ships[idx].y;
			}
		}
		else
		{
			camera.x = planets[camFocus].x;
			camera.y = planets[camFocus].y;
		}
		

		var coll = collidesWithAny(aimPoint, time, -1, 0.5 / camera.zoom);

		if(chooseFrame)
		{
			if(coll.planet != null)
			{
				if(ships[0].frame != coll.planet.planet)
				{
					ships[0].frame = coll.planet.planet;
					showEvent("Reference frame set to " + planets[coll.planet.planet].name, 2.0);
				}
			}
		}

		if(chooseFocus)
		{
			var oldFocus = camFocus;

			if(coll.ship != null)
			{
				camFocus = -(coll.ship.idx + 1);
			}
			else if(coll.planet != null)
			{
				camFocus = coll.planet.planet;
			}		

			if(oldFocus != camFocus)
			{
				if(camFocus < 0)
				{
					var idx = Math.abs(camFocus + 1);
					var prefix = "player";
					if(ships[idx].side == 0)
					{
						prefix = "human";
					}
					else if(ships[idx].side == 1)
					{
						prefix = "ai";
					}

					showEvent("Focusing on " + prefix + " ship", 2.0);
				}
				else 
				{
					showEvent("Focusing on " + planets[camFocus].name, 2.0);
				}
			}
		}

		if(coll.planet == null)
		{
			tooltipTime = 0.0;
			tooltipFocus = -1;
		}
		else 
		{
			if(coll.planet.planet != tooltipFocus)
			{
				tooltipTime = 0.0;
				tooltipFocus = coll.planet.planet;
			}
		}

	

		if(predictTimer < 0.0 || ships[0].thrust.fw != 0.0 || ships[0].thrust.side != 0.0)
		{
			predictShip(ships[0]);
			predictTimer = 0.5;
		}
		else 
		{
			predictTimer -= dt;
		}

	


		zoomSpeed -= zoomSpeed * dtval * 3.0;
		if(Math.abs(zoomSpeed) <= 0.1)
		{
			zoomSpeed = 0.0;
		}

		camera.zoom += camera.zoom * zoomSpeed * dtval * 0.8;

		if(camera.zoom <= 0.16)
		{	
			mapMode = Math.max(Math.min(0.02 / camera.zoom, 1.0), 0.0);
		}
		else
		{
			mapMode = 0.0;
		}

		tooltipTime += dt;
		eventTimer -= dt;

		if(!tutShown)
		{
			showEvent("Please read the manual", 5.0);
			tutShown = true;
		}

		music(dt);
	}


}

var totalAI = 0;
var totalHuman = 0;

function render()
{
	totalAI = 0;
	totalHuman = 0;

	ctx.setTransform(1, 0, 0, 1, 0, 0);

	ctx.translate(canvas.width / 2.0, canvas.height / 2.0);
	
	if(lockCamera)
	{
		ctx.rotate(-ships[0].rot - Math.PI);
	}

	ctx.translate(-starFieldSize / 2.0 - canvas.height / 2.0, -starFieldSize / 2.0 - canvas.width / 2.0);

	ctx.drawImage(starFieldImage, 0.0, 0.0);

	doCameraTransform();

	for(var i = 0; i < rings.length; i++)
	{
		drawRing(rings[i], time);
	}

	drawBright(0, 0, 125, 1.0);

	for(var i = 1; i < planets.length; i++)
	{
		drawPlanet(planets[i]);
	}

	for(var i = 0; i < ships.length; i++)
	{
		drawShip(ships[i]);
	}

	for(var i = 1; i < planets.length; i++)
	{
		drawPlanetOver(planets[i]);
	}

	for(var i = 1; i < planets.length; i++)
	{
		drawPlanetShadow(planets[i]);
	}

	for(var i = 0; i < ships.length; i++)
	{
		drawShipExhaust(ships[i]);
	}

	for(var i = 0; i < explosions.length; i++)
	{
		drawExplosion(explosions[i]);
	}

	for(var i = 0; i < bullets.length; i++)
	{
		drawBullet(bullets[i]);
	}

	for(var i = 0; i < fire.length; i++)
	{
		drawFire(fire[i]);
	}


	if(mapMode > 0.0)
	{
		ctx.globalAlpha = mapMode;

		for(var i = 1; i < planets.length; i++)
		{
			drawPlanetMap(planets[i]);
		}

		for(var i = 0; i < ships.length; i++)
		{
			drawShipMap(ships[i]);
		}


		ctx.globalAlpha = 1.0;
	}

	drawShipHud(ships[0]);

	if(tooltipFocus > 0 && tooltipEnabled)
	{
		drawTooltip(planets[tooltipFocus], aimPoint.x, aimPoint.y);
	}

	ctx.setTransform(1, 0, 0, 1, 0, 0);
	// Static GUI

	if(eventTimer >= 0.0)
	{
		ctx.globalAlpha = eventTimer;
		
		var size = getTextSize(eventStr, 2.0);
		drawText(eventStr, canvas.width / 2.0 - size / 2.0, 20.0, 2.0, 'white');
		ctx.globalAlpha = 1.0;
	}

	if(timestep == 0)
	{
		var str = "Paused";
		var size = getTextSize(str, 2.0);
		drawText(str, canvas.width / 2.0 - size / 2.0, 50.0, 2.0, 'white');
	}

	drawGeneralHUD();

}

const loop = time => 
{
	const ndt = time - previousTime;
	previousTime = time;
	dtval = ndt / 1000.0;
	update();
	render();
	window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(time => 
{
	previousTime = time;
	loop(time);
});


function onkey(evt)
{
	var release = evt.type == "keyup";

	var key = evt.code;
	var thrust = ships[0].thrust;

	var val = 1.0;
	if(release)
	{
		val = 0.0;
	}

	if(key == 'KeyT')
	{
		tooltipEnabled = !release;
	}

	if(key == 'KeyW')
	{
		thrust.fw = val;
	}
	else if(key == 'KeyS')
	{
		thrust.fw = -val;
	}
	else if(key == 'KeyA')
	{
		thrust.rot = -val;
	}
	else if(key == 'KeyD')
	{
		thrust.rot = val;
	}
	else if(key == 'KeyQ')
	{
		thrust.side = -val;
	}
	else if(key == 'KeyE')
	{
		thrust.side = val;
	}

	if(timestep > 2.0)
	{
		thrust.fw = 0.0; thrust.rot = 0.0; thrust.side = 0.0;
	}


	if(!release)
	{

		if(key == 'KeyL')
		{
			lockCamera = !lockCamera;
			if(lockCamera)
			{
				showEvent("Camera locked", 2.0);
			}
			else 
			{
				showEvent("Camera free", 2.0);
			}
		}
		
		if(key == 'Period')
		{
			timestepVal++;
			if(timestepVal > timestepVals.length - 1)
			{
				timestepVal = timestepVals.length - 1;
			}
			else 
			{
				timestep = timestepVals[timestepVal];
				showEvent(timestep.toString() + "x Timewarp", 2.0);
			}
		}

		if(key == 'Comma')
		{
			timestepVal--;
			if(timestepVal < 0)
			{
				timestepVal = 0;
			}
			else 
			{
				timestep = timestepVals[timestepVal];
				showEvent(timestep.toString() + "x Timewarp", 2.0);
			}
		}
	}

	if(ships[0].landed)
	{
		planetShop(key, release, ships[0], planets[ships[0].coll.planet]);
	}
}

var zoomSpeed = 0.0;

function onwheel(evt)
{
	zoomSpeed -= Math.sign(evt.deltaY);
}

function onmouse(evt)
{
	var down = evt.type == "mousedown";

	if(evt.which == 1) // Left click
	{
		ships[0].firing = down;
	}
	else if(evt.which == 2) // Center click
	{
		chooseFocus = down;
		evt.preventDefault();
	}
	else if(evt.which == 3)	// Right click
	{
		chooseFrame = down;
	}
}

function mousemove(evt)
{
	var pos = getMousePos(canvas, evt);
	mousePos.x = pos.x;
	mousePos.y = pos.y;
}

function getMousePos(canvas, evt) 
{
    var rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top
    };
}

canvas.addEventListener("wheel", onwheel);
canvas.addEventListener("mousemove", mousemove, false);
canvas.addEventListener("mousedown", onmouse, false);
canvas.addEventListener("mouseup", onmouse, false);
document.onkeydown = document.onkeyup = onkey;
