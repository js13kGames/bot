var dark = 'rgba(0, 0, 0, 0.8)';

function drawTooltip(planet, x, y)
{
	ctx.globalAlpha = tooltipTime * 4.0;

	function nl()
	{
		xoff = 0.0;
		yoff += 16.0 / camera.zoom;
	}

	if(lockCamera)
	{
		ctx.translate(x, y);
		ctx.rotate(ships[0].rot + Math.PI);
		ctx.translate(-x, -y);
	}


	var cwidth = 300;
	ctx.fillStyle = dark;
	ctx.strokeStyle = 'rgb(255, 255, 255)';
	ctx.beginPath();
	ctx.rect(x, y, cwidth / camera.zoom, 350 / camera.zoom);
	ctx.fill();
	ctx.stroke();

	var margin = 8 / camera.zoom;

	var titleColor = 'rgb(255, 220, 200)';
	var textColor = 'rgb(255, 255, 255)';

	// Draw stuff
	var xoff = 0.0;
	var yoff = 0.0;
	xoff += drawText("Name: ", x + margin, y + margin, 2.0 / camera.zoom, titleColor);
	xoff += drawText(planet.name, x + margin + xoff, y + margin, 2.0 / camera.zoom, textColor);

	nl();

	var humanCities = 0;
	var aiCities = 0;
	if(planet.cities != undefined)
	{
		for(var i = 0; i < planet.cities.length; i++)
		{
			if(planet.cities[i].side == 0)
			{
				
				humanCities++;
			}
			else 
			{
				aiCities++;
			}
		}
	}

	if(humanCities == 0 && aiCities == 0)
	{
		xoff += drawText("Planet is uninhabited", x + margin, y + margin + yoff, 2.0 / camera.zoom, titleColor);

		nl();

		// Ores and stuff
		xoff += drawText("Ore: ", x + margin, y + margin + yoff, 2.0 / camera.zoom, titleColor);
		xoff += drawText(planet.ore.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);
	}
	else 
	{
		xoff += drawText("Cities: ", x + margin, y + margin + yoff, 2.0 / camera.zoom, titleColor);
		xoff += drawText(humanCities.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, 'rgb(0, 255, 0)');
		xoff += drawText(" / ", x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);
		xoff += drawText(aiCities.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, 'rgb(255, 0, 0)');

		nl();

		// Ships and stuff
		xoff += drawText("Human Ships: ", x + margin, y + margin + yoff, 2.0 / camera.zoom, titleColor);
		xoff += drawText(planet.humanForces.length.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);
		xoff += drawText(" / ", x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);
		xoff += drawText(planet.maxForces.human.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);
		xoff += drawText("  Resources: ", x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, titleColor);
		xoff += drawText((planet.humanAggro * 100).toString() + "%", x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);

		xoff = margin * 2.0;
		yoff += 32.0 / camera.zoom;

		function drawShipUI(forces)
		{
			for(var i = 0; i < forces.length; i++)
			{
				var shipSize = 0.15 / camera.zoom;
	
				ctx.translate(x + xoff, y + yoff);
				ctx.scale(shipSize, shipSize);
				drawShipLow(forces[i]);
				ctx.scale(1.0 / shipSize, 1.0 / shipSize);
				ctx.translate(-x - xoff, -y - yoff);
	
	
				xoff += shipSize * 128.0;
				if(xoff >= cwidth / camera.zoom - margin)
				{
					xoff = margin * 2.0;
					yoff += shipSize * 350.0;
				}
			}
		}

		// Draw all ships
		drawShipUI(planet.humanForces);

		yoff += 64.0 / camera.zoom;
		xoff = 0.0;

		xoff += drawText("AI Ships: ", x + margin, y + margin + yoff, 2.0 / camera.zoom, titleColor);
		xoff += drawText(planet.aiForces.length.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);
		xoff += drawText(" / ", x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);
		xoff += drawText(planet.maxForces.ai.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);
		xoff += drawText("  Resources: ", x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, titleColor);
		xoff += drawText((planet.aiAggro * 100).toString() + "%", x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);

		xoff = margin * 2.0;
		yoff += 32.0 / camera.zoom;

		// Draw all ships
		drawShipUI(planet.aiForces);
	}

	
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	doCameraTransform();

	ctx.globalAlpha = 1.0;
}


function drawShipHud(ship)
{
	ctx.strokeStyle = 'rgb(204,168,255)';
	ctx.lineWidth = Math.max(1.0 / camera.zoom, 1.0);

	if(camera.zoom <= 1.5 && camera.zoom >= 1.0)
	{
		ctx.globalAlpha = 1.0 - (camera.zoom - 1.0) * 2.0;
	}

	if(camera.zoom <= 1.5 && !ship.landed)
	{

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

	}

	ctx.globalAlpha = 1.0;

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

	var prograde = getProgradeVector(ship);
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

function drawGeneralHUD()
{
	function nl()
	{
		xoff = 0.0;
		yoff += 16.0;
	}

	var green = 'rgba(166,255,128, 1.0)';
	// Bottom left, orbit info
	var margin = 4.0;

	ctx.strokeStyle = green;
	ctx.lineWidth = 1.0;

	var xoff = 0.0;
	var yoff = 0.0;

	// Right, landed info
	if(ships[0].landed)
	{
		var br0x = canvas.width - 180.0;
		var br0y = canvas.height / 2.0 - 178.0;

		ctx.beginPath();
		ctx.rect(br0x, br0y, 1000.0, 256.0);
		ctx.stroke();

		var at = planets[ships[0].coll.planet];
		var tab0 = 20.0;
		var tab1 = 120.0;
		
		var menuItems = 
		[
			"M", "Mine", NaN,
		]


		if(at.cities != undefined && at.cities.length != 0)
		{
			menuItems = 
			[
				"R", "Repair", repairPrice(),
				"U", "Upgrade", upgradePrice(),
				"S", "Sell Ore", orePrice(),
				"1", "Fighter", 0,
				"2", "Freighter", freighterPrice(),	// Remember, false == 0!
				"3", "Destroyer", destroyerPrice(),	
			]
		}

	
		var ai = 0; 
		var human = 0;

		if(at.cities != undefined && at.cities.length != 0)
		{


			for(var i = 0; i < at.cities.length; i++)
			{
				if(at.cities[i].side == 0)
				{
					human++;
				}
				else 
				{
					ai++;
				}
			}
		}

		var title = "AI World";
		if(human > ai)
		{
			title = "Human World";
		}
		else if(human == 0 && ai == 0)
		{
			title = "Free World";
		}

		xoff += drawText(title, br0x + margin + xoff, br0y + margin + yoff, 2.0, green);

		

		nl();
		nl();

		if(at.warTime > 0.0)
		{
			drawText("Planet is at war", br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
			nl();
			drawText(Math.floor(at.warTime) + " until peace", br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
		}
		else
		{
			

			for(var i = 0; i < menuItems.length / 3.0; i++)
			{
				drawText(menuItems[i * 3.0 + 0], br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
				xoff = tab0;
				drawText(menuItems[i * 3.0 + 1], br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
				xoff = tab1;
				drawText(priceToString(menuItems[i * 3.0 + 2]), br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
				nl();
			}

		}
		
	}

	// Bottom right, ship info
	var br0x = canvas.width - 180.0;
	var br0y = canvas.height - 64.0;


	ctx.beginPath();
	ctx.rect(br0x, br0y, 1000.0, 1000.0);
	ctx.stroke();

	var xoff = 0.0;
	var yoff = 0.0;
	var tab = 80;
	xoff += drawText("Hull ", br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
	xoff = tab;
	if(ships[0].health < 0.0)
	{
		xoff += drawText("Destroyed", br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
	}
	else 
	{
		xoff += drawText(Math.floor(ships[0].health) + "/", br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
		xoff += drawText(Math.floor(ships[0].stats.armor).toString(), br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
	}
	
	nl();
	xoff += drawText("Cargo ", br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
	xoff = tab;
	xoff += drawText(plOre.toString() + "/", br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
	xoff += drawText(Math.floor(ships[0].stats.cargo).toString(), br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
	nl();
	xoff += drawText("Money ", br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
	xoff = tab;
	xoff += drawText(plMoney.toString(), br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
	nl();
	xoff += drawText("Level ", br0x + margin + xoff, br0y + margin + yoff, 2.0, green);
	xoff = tab;
	xoff += drawText(ships[0].level.toString(), br0x + margin + xoff, br0y + margin + yoff, 2.0, green);

	// Top, game info
	//ctx.fillStyle = dark;
	//ctx.fillRect(0, 0, canvas.width, 16);
}