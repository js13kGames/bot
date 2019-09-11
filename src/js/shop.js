
function freighterPrice()
{
	return !plHasFreighter * 4000.0;
}

function destroyerPrice()
{
	return !plHasDestroyer * 14000.0;
}

function repairPrice()
{
	return Math.floor((1.0 - (ships[0].health / ships[0].stats.armor)) * 500.0);
}

function upgradePrice()
{
	return ships[0].level * ships[0].level * 1000.0;
}

function orePrice()
{
	return 8.0 * plOre;
}

var holdingUpgrade = false;

function planetShop(key, release, ship, planet)
{
	if(release)
	{
		if(key == 'KeyU')
		{
			holdingUpgrade = false;
		}
	}

	if(!release)
	{

		if(planet.cities.length == 0)
		{
			if(key == 'KeyM')
			{
				if(plOre < ships[0].stats.cargo - 1 && mineTimer <= 0.0 && planet.ore > 0)
				{
					plOre++;
					planet.ore--;
					if(rrg(0, 1000) >= 980)
					{
						// Take some damage, play alarm
						showEvent("Accident while mining", 1.0);
						ships[0].health -= rrg(1, 5);
						zzfx(1,.1,50,.6,.5,.3,1,3.6,.03);
					}
					else 
					{
						zzfx(1,.1,rrg(220, 320), rrg(8, 17) * 0.01,.66,.3,0,3.6,.03);
					}
					mineTimer = rrg(15, 60) * 0.01;

				}
			}
		}
		else 
		{
			function newShipCopy(type)
			{
				var newShip = createShip(type, playerShipSeed, 2, ships[0].level);
				newShip.predict = new Array();
				newShip.frame = ships[0].frame;
				newShip.landed = true;
				newShip.coll = ships[0].coll;
				newShip.rot = ships[0].rot;
				return newShip;
			}

			function saveShip()
			{
				plLevels[ships[0].type] = ships[0].level;
				plHealths[ships[0].type] = ships[0].health;
			}

			var changeShipType = -1;

			if(key == 'KeyR')
			{
				if(plMoney >= repairPrice())
				{
					plMoney -= repairPrice();
					ships[0].health = ships[0].stats.armor;
					ships[0].destroyed = false;
				}
			}
			else if(key == 'KeyU')
			{
				if(!holdingUpgrade)
				{
					if(plMoney >= upgradePrice())
					{
						plMoney -= upgradePrice();
						ships[0].level++;
						var newShip = newShipCopy(ships[0].type);
						newShip.health = ships[0].health;
						ships[0] = newShip;

						zzfx(0.7,.1,15,.5,.13,0,0,30,.79); // ZzFX 71938
					}
					holdingUpgrade = true;
				}
			}
			else if(key == 'KeyS')
			{
				plMoney += orePrice();
				if(orePrice() != 0)
				{
					zzfx(1,.1,836,.2,.01,0,.3,1.3,.78); // ZzFX 18945
				}

				planet.humanAggro += plOre * 0.001 * 0.20;
				planet.humanAggro = Math.min(planet.humanAggro, 1.0);

				plOre = 0;
			}
			else if(key == 'Digit1')
			{
				if(ships[0].type != 0)
				{
					changeShipType = 0;
					zzfx(1,.1,2,.8,.42,0,0,67,.1); // ZzFX 30160
				}

			}
			else if(key == 'Digit2')
			{
				if(plMoney >= freighterPrice() && ships[0].type != 1)
				{
					changeShipType = 1;
					plMoney -= freighterPrice();
					plHasFreighter = true;
					zzfx(1,.1,5,.8,.42,-0.012,0,43,400); // ZzFX 30160

				}
			}
			else if(key == 'Digit3')
			{
				if(plMoney >= destroyerPrice() && ships[0].type != 2)
				{
					changeShipType = 2;
					plMoney -= destroyerPrice();
					plHasDestroyer = true;

					zzfx(1,.1,2,.8,.42,0,.6,33,.1); // ZzFX 30160
				}
			}

			if(changeShipType != -1)
			{
				saveShip();
				ships[0] = newShipCopy(changeShipType);

				if(plHealths[changeShipType] == 0)
				{
					plHealths[changeShipType] = ships[0].health;
				}

				ships[0].health = plHealths[changeShipType];
				ships[0].level = plLevels[changeShipType];
			}
		}

	}
}