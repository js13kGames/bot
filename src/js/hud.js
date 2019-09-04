
function drawTooltip(planet, x, y)
{

	if(lockCamera)
	{
		ctx.translate(x, y);
		ctx.rotate(ships[0].rot + Math.PI);
		ctx.translate(-x, -y);
	}


	var cwidth = 300;
	ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
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

	xoff = 0.0;
	yoff += 16.0 / camera.zoom;

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

		xoff = 0.0;
		yoff += 16.0 / camera.zoom;

		// Ores and stuff
		xoff += drawText("Ore: ", x + margin, y + margin + yoff, 2.0 / camera.zoom, titleColor);
		xoff += drawText(planet.ore.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);

		xoff = 0.0;
		yoff += 16.0 / camera.zoom;

		xoff += drawText("Fuel: ", x + margin, y + margin + yoff, 2.0 / camera.zoom, titleColor);
		xoff += drawText(planet.fuel.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);
	}
	else 
	{
		xoff += drawText("Cities: ", x + margin, y + margin + yoff, 2.0 / camera.zoom, titleColor);
		xoff += drawText(humanCities.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, 'rgb(0, 255, 0)');
		xoff += drawText(" / ", x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);
		xoff += drawText(aiCities.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, 'rgb(255, 0, 0)');

		xoff = 0.0;
		yoff += 16.0 / camera.zoom;

		// Ships and stuff
		xoff += drawText("Human Ships: ", x + margin, y + margin + yoff, 2.0 / camera.zoom, titleColor);
		xoff += drawText(planet.humanForces.length.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);
		xoff += drawText(" / ", x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);
		xoff += drawText(planet.maxForces.human.toString(), x + margin + xoff, y + margin + yoff, 2.0 / camera.zoom, textColor);

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

		xoff = margin * 2.0;
		yoff += 32.0 / camera.zoom;

		// Draw all ships
		drawShipUI(planet.aiForces);
	}

	
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	doCameraTransform();
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
	// Bottom left, orbit info
	
}