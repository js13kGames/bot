
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

var notes = 
[
	0.0,	// Silence
	261.63,	//C4	1
	392.00,	//G4	2
	523.25,	//C5	3
	739.99,	//F#5	4
	932.33,	//A#5	5
	783.99,	//G5	6
	1046.50,//C6	7
	622.25,	//D#5	8
	415.30,	//G#4	9
	293.66,	//D4	10
	130.81,	//C3	11
	185.00,	//F#3	12 
	174.61,	//F3	13
	349.23,	//F4 	14
	369.99,	//F#4	15
]

var spaceSong = 
[	
	// Lead 0 // Lead 1 // Lead 2	// Drum 3
	1 		, 4			, 5			, 1		,
	0		, 2			, 0			, 0		,
	0		, 3			, 0			, 2		,
	0		, 4			, 0			, 0		,
	0		, 5			, 0			, 1		,
	0		, 4			, 0			, 0		,
	0		, 3			, 0			, 2		,
	0		, 2			, 0			, 2		,
	1 		, 6			, 7			, 1		,
	0		, 2			, 0			, 0		,
	0		, 3			, 0			, 2		,
	0		, 6			, 0			, 0		,
	0		, 7			, 0			, 1		,
	0		, 6			, 0			, 0		,
	0		, 3			, 0			, 2		,
	0		, 2			, 0			, 2		,
]

var unknownPlanetSong = 
[	
	// Lead 0 // Lead 1 // Lead 2	// Drum 3
	1 		, 3			, 0			, 1		,
	0		, 8			, 5			, 0		,
	0		, 6			, 0			, 0		,
	0		, 3			, 0			, 0		,
	10		, 8			, 0			, 1		,
	1		, 6			, 0			, 0		,
	0		, 3			, 4			, 0		,
	0		, 9			, 0			, 0		,
]

var combatSong = 
[
	0		, 11		, 0			, 11		,
	0		, 11		, 0			, 0		,
	0		, 0			, 0			, 7		,
	0		, 0			, 0			, 0		,
	0		, 0			, 0			, 11		,
	0		, 11		, 0			, 0		,
	0		, 12		, 0			, 7		,
	0		, 13		, 0			, 0		,
	0		, 11		, 1			, 11		,
	0		, 11		, 15		, 0		,
	0		, 0			, 14		, 7		,
	0		, 0			, 1			, 0		,
	0		, 0			, 0			, 11		,
	0		, 11		, 0			, 0		,
	0		, 12		, 1			, 7		,
	0		, 13		, 15		, 0		,
]

var musicTimer = 2.0;
var musicTempo = 1.0 / 4.0;
var musicPtr = 0;
var musicVol = 0.10;
var song = combatSong;
var selectSong = 0;
var muteMusic = false;

function music(dt)
{	
	if(!muteMusic)
	{

		musicVol = 0.07;
		if(selectSong == 0)
		{
			song = spaceSong;
		}
		else if(selectSong == 1)
		{
			song = unknownPlanetSong;
		}
		else if(selectSong == 2)
		{
			song = combatSong;
			musicVol = 0.11;
		}

		musicTimer -= dt;

		if(musicTimer <= 0.0)
		{
			musicPtr++;
			musicTimer = musicTempo;

			if(musicPtr * 4 > song.length - 1)
			{
				musicPtr = 0;
			}
			
			for(var i = 0; i < 4; i++)
			{
				var noise = i == 3 ? 3.0 : 0.0;
				var length = i == 3 ? musicTempo / 2.0 : musicTempo * 1.3;
				length = i == 0 ? musicTempo * 2.1 : length;
				var note = notes[song[musicPtr * 4 + i]];
				if(note != 0)
				{
					zzfx(musicVol,0,note,length,0,0,noise,0.0,0);
				}
			}		
		}
	}
}
