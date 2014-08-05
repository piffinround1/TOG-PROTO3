

function TOGUtils(){}

Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };
//copies a 2d vector like object from one to another
TOGUtils.prototype.pos = function(a) { return {x:a.x,y:a.y}; };
//Add a 2d vector with another one and return the resulting vector
TOGUtils.prototype.v_add = function(a,b) { return { x:(a.x+b.x).fixed(), y:(a.y+b.y).fixed() }; };
//Subtract a 2d vector with another one and return the resulting vector
TOGUtils.prototype.v_sub = function(a,b) { return { x:(a.x-b.x).fixed(),y:(a.y-b.y).fixed() }; };
//Multiply a 2d vector with a scalar value and return the resulting vector
TOGUtils.prototype.v_mul_scalar = function(a,b) { return {x: (a.x*b).fixed() , y:(a.y*b).fixed() }; };
//
TOGUtils.prototype.v_div_scalar = function(a,b) { return {x: (a.x/b).fixed() , y:(a.y/b).fixed() }; };
//For the server, we need to cancel the setTimeout that the polyfill creates
TOGUtils.prototype.stop_update = function() { window.cancelAnimationFrame( this.updateid ); };
//Simple linear interpolation
TOGUtils.prototype.lerp = function(p, n, t) { var _t = Number(t); _t = (Math.max(0, Math.min(1, _t))).fixed(); return (p + _t * (n - p)).fixed(); };
//Simple linear interpolation between 2 vectors
TOGUtils.prototype.v_lerp = function(v,tv,t) { return { x: this.lerp(v.x, tv.x, t), y:this.lerp(v.y, tv.y, t) }; };

TOGUtils.prototype.pos = function(a) { return {x:a.x,y:a.y}; };

TOGUtils.prototype.translate = function(arr){return {x:arr[0],y:arr[1]};};

TOGUtils.prototype.isEqual = function(a,b){return (a.x === b.x && a.y === b.y);};
