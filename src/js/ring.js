function createRing(center, minRadius, maxRadius, density)
{
	var surface = Math.PI * maxRadius * maxRadius - Math.PI * minRadius * minRadius;

	var points = surface * density;

	var rocks = Array();

	if(points >= 64)
	{
		points = 64;
	}

	for(var i = 0; i < points; i++)
	{
		var orbitRadius = randomIntRange(minRadius, maxRadius);
		var offset = randomIntRange(-10000, 10000);

		var size = randomIntRange(5, 50);

		var color = randomColor(2, 0.6);

		rocks.push({orbitRadius: orbitRadius, offset: offset, size: size, color: color});
	}

	return {center: center, minRadius: minRadius, maxRadius: maxRadius, rocks: rocks}
}

function distance(x1, y1, x2, y2)
{
	var xdiff = x2 - x1;
	var ydiff = y2 - y1;
	return Math.sqrt(xdiff * xdiff + ydiff * ydiff);
}

function maxCameraReach()
{
	var maxSize = Math.max(canvas.width, canvas.height);
	return maxSize / camera.zoom;
}

function drawRing(ring, time)
{
	var cx = planets[ring.center].x;
	var cy = planets[ring.center].y;

	if(camera.zoom >= 0.01 && distance(camera.x, camera.y, cx, cy) <= maxCameraReach() + ring.maxRadius)
	{
		for(var i = 0; i < ring.rocks.length; i++)
		{
			var rock = ring.rocks[i];

			var pos = orbit(cx, cy, planets[ring.center].mass, 
				rock.orbitRadius, time + rock.offset);
			
			ctx.fillStyle = rock.color;
			ctx.beginPath();
			ctx.arc(pos.x, pos.y, rock.size, 0, 2.0 * Math.PI);
			ctx.fill();
		}
	}
}