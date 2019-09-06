
function explosionSound(size, x, y, isShoot, volBoost = 0.6)
{
	var dist = distance(camera.x, camera.y, x, y);
	var factor = Math.min(Math.max(500.0 / (dist * 10.0), 0.005), 1.0);
	var l = 0.05 + size * 1.7;
	var freq = Math.min(100 / (Math.pow(size, 2.6) * 460.0), 500.0);


	if(!isShoot)
	{
		l = 0.1 + size * 0.67;
		freq = rrg(150 - size * 0.14, 280 - size * 0.14);
		
	}

	//freq /= Math.max(dist / 6200.0, 1.0);

	
	factor *= volBoost;

	zzfx(Math.min(factor * 4.0, 1.0),0,rrg(freq - size * 200.0, freq * 2.0), l,-5.0,0,8,0,.81);
	if(isShoot)
	{
		zzfx(Math.min(factor * size * 2.0, 1.0),0,rrg(freq, freq + 100.0), rrg(1, size * 0.1) * size * l * 2.0,0,0,8,0,0); // ZzFX 15338
	}
	 // ZzFX 15338
}

var spaceSong = 
[	
	// Lead0 // Lead1 	// Lead 2	// Drum
	200 	, 500		, 200		,
	0		,			, 	 		,
]

function music(dt)
{
	
}
