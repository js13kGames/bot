/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 *
 * Version 2012-03-09
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */


	var seed = 757764;

	var module = noise = {};
  
	function Grad(x, y, z) {
	  this.x = x; this.y = y; this.z = z;
	}
	
	Grad.prototype.dot2 = function(x, y) {
	  return this.x*x + this.y*y;
	};
  
	Grad.prototype.dot3 = function(x, y, z) {
	  return this.x*x + this.y*y + this.z*z;
	};
  
	var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
				 new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
				 new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];
	
	var p = new Array(256);
	for(var i = 0; i < 256; i++)
	{
		p[i] = rrg(0, 255);
	}
	
	// To remove the need for index wrapping, double the permutation table length
	var perm = new Array(512);
	var gradP = new Array(512);

  
	// This isn't a very good seeding function, but it works ok. It supports 2^16
	// different seed values. Write something better if you need more seeds.
	module.seed = function(seed) {
	  if(seed > 0 && seed < 1) {
		// Scale the seed out
		seed *= 65536;
	  }
  
	  seed = Math.floor(seed);
	  if(seed < 256) {
		seed |= seed << 8;
	  }
  
	  for(var i = 0; i < 256; i++) {
		var v;
		if (i & 1) {
		  v = p[i] ^ (seed & 255);
		} else {
		  v = p[i] ^ ((seed>>8) & 255);
		}
  
		perm[i] = perm[i + 256] = v;
		gradP[i] = gradP[i + 256] = grad3[v % 12];
	  }
	};
  
	module.seed(0);
	// ##### Perlin noise stuff
  
	function fade(t) {
	  return t*t*t*(t*(t*6-15)+10);
	}
  
	function lerp(a, b, t) {
	  return (1-t)*a + t*b;
	}
  
	// 2D Perlin Noise
	module.perlin2 = function(x, y) {
	  // Find unit grid cell containing point
	  var X = Math.floor(x), Y = Math.floor(y);
	  // Get relative xy coordinates of point within that cell
	  x = x - X; y = y - Y;
	  // Wrap the integer cells at 255 (smaller integer period can be introduced here)
	  X = X & 255; Y = Y & 255;
  
	  // Calculate noise contributions from each of the four corners
	  var n00 = gradP[X+perm[Y]].dot2(x, y);
	  var n01 = gradP[X+perm[Y+1]].dot2(x, y-1);
	  var n10 = gradP[X+1+perm[Y]].dot2(x-1, y);
	  var n11 = gradP[X+1+perm[Y+1]].dot2(x-1, y-1);
  
	  // Compute the fade curve value for x
	  var u = fade(x);
  
	  // Interpolate the four results
	  return lerp(
		  lerp(n00, n10, u),
		  lerp(n01, n11, u),
		 fade(y));
	};
  
	noise.seed(seed);