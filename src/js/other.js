
function generateBright()
{
	for(var y = 0; y < brightSize; y++)
	{
		for(var x = 0; x < brightSize; x++)
		{
			var b = 0.0;

			var i = y * brightSize + x;

			var xabs = (x - brightSize / 2.0);
			var yabs = (y - brightSize / 2.0);

			var factor = brightSize / ((xabs * xabs + yabs * yabs) / 6.0);

			b = factor;
			var polar = Math.atan2(yabs, xabs);
			b += noise.perlin2(polar * 15.0, 0.0) * 0.6;
			b -= 1.0 - Math.pow(factor, 0.03);

			var abbrf = Math.max(1.0 - ((factor - 1.0) * (factor - 1.0)), 0.0);
			var abbgf = Math.max(1.0 - ((factor - 1.2) * (factor - 1.2)), 0.0);
			var abbbf = Math.max(1.0 - ((factor - 1.4) * (factor - 1.4)), 0.0);

			var abbr = noise.perlin2(polar * 8.0, 1.0) * abbrf + abbrf;
			var abbg = noise.perlin2(polar * 16.0, 7.0) * abbgf + abbgf;
			var abbb = noise.perlin2(polar * 32.0, 15.0) * abbbf + abbbf;

			brightData.data[i * 4 + 0] = b * 200 + abbr * 128;
			brightData.data[i * 4 + 1] = b * 160 + abbg * 118;
			brightData.data[i * 4 + 2] = b * 128 + abbb * 98;
			brightData.data[i * 4 + 3] = b * 255;
		}
	}

	brightImage = imageDataToImage(brightData);
}

function generateStarfield()
{
	for(var y = 0; y < canvas.height * backdropScale; y++)
	{
		for(var x = 0; x < canvas.width * backdropScale; x++)
		{
			var i = y * canvas.width * backdropScale + x;

			var r = 0;
			var g = 0;
			var b = 0;

			var noise0 = noise.perlin2(x * 0.001, y * 0.001);
			var noise1 = noise.perlin2(x * 0.01 + noise0, y * 0.01 + noise0);
			var noise2 = noise.perlin2(x * 0.05, y * 0.05);
			var noise3 = noise.perlin2(x * 0.01 + 5.0, y * 0.01 + 5.0);
			
			r = (noise1 + noise2 + noise0) * 255;
			g = r * 0.7 + noise3 * 60;
			b = r * 0.5 + noise3 * 128;

			if(randomIntRange(0, 10000) >= 9995)
			{
				r = 255; g = 255; b = 255;
			}
			else
			{
				var factor = 0.25;
				r = r * factor; g = g * factor; b = b * factor;
			}

			starFieldData.data[i * 4 + 0] = r;
			starFieldData.data[i * 4 + 1] = g;
			starFieldData.data[i * 4 + 2] = b;
			starFieldData.data[i * 4 + 3] = 255;
		}
	}

	starFieldImage = imageDataToImage(starFieldData);
}