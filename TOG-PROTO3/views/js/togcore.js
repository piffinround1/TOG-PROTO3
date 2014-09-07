/**
 * New node file
 */

var frame_time = 60/1000;



( function () {

    var lastTime = 0;
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

    for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {
        window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
        window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
    }

    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = function ( callback, element ) {
            var currTime = Date.now(), timeToCall = Math.max( 0, frame_time - ( currTime - lastTime ) );
            var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if ( !window.cancelAnimationFrame ) {
        window.cancelAnimationFrame = function ( id ) { clearTimeout( id ); };
    }

}() );





var togcore = function(){
		
	
		this.players = players;
		this.viewport = viewport;
		
		
		this.clientPlayer = clientPlayer;
		
		
		this._pdt = 0.0001; //The physics update delta time
	    this._pdte = new Date().getTime(); //The physics update last delta time
	        //A local timer for precision on server and client
	    
	    this.local_time = 0.016; //The local timer
	    this._dt = new Date().getTime(); //The local timer delta
	    this._dte = new Date().getTime(); //The local timer last frame time
		
	    this.server_updates = []; //client's server update
	    this.create_config();
		this.create_timer();
		this.create_physics_loop();
		//objects that will be simulated by client physics
		this.newtonian_objects = [this.clientPlayer];
		//start polling mechanism
		//this.poll_server();
};


togcore.prototype.create_timer = function(){
    setInterval(function(){
        this._dt = new Date().getTime() - this._dte;
        this._dte = new Date().getTime();
        this.local_time += this._dt/1000.0;
    }.bind(this), 4);
};


togcore.prototype.create_physics_loop = function(){
	setInterval(function(){
        this._pdt = (new Date().getTime() - this._pdte)/1000.0;
        this._pdte = new Date().getTime();
        this.update_physics();
    }.bind(this), 15);
};

togcore.prototype.update_physics = function(){
	
	this.clientPlayer.old_pos_state = this.pos(this.clientPlayer.cur_pos_state);
	var nd = this.process_input(this.clientPlayer);
	this.clientPlayer.force = nd;
	this.checkGameRules(this.newtonian_objects);
	
};




togcore.prototype.create_config = function(){
	
	
	this.input_seq = 0;
	
	this.client_time = 0.01; //Our local 'clock' based on server time - client interpolation(net_offset).
    this.server_time = 0.01; //The time the server reported it was at, last we heard from it
	
    this.client_smooth = 25;
    this.net_offset = 100;  //100 ms latency between server and client interpolation for other clients
    
    
	this.dt = 0.016; //The time that the last frame took to run
    this.fps = 0; //The current instantaneous fps (1/this.dt)
    this.fps_avg_count = 0; //The number of samples we have taken for fps_avg
    this.fps_avg = 0; //The current average fps displayed in the debug UI
    this.fps_avg_acc = 0; //The accumulation of the last avgcount fps samples
    this.buffer_size = 2;  //The size of the server history to keep for rewinding/interpolating.
    this.snapshot_value_string = '';
    this.oldest_tick = 0.01;
    this.draw_ghost = false;
    this.do_net_correction = false;
	
    this.poll_valve = true;
    this.last_poll_time = 0;
    this.recieved_update_time = 0;
	this.ping = 0;
	this.ping_avg = 0;
	this.ping_acc = 0;
	this.ping_avg_count = 0;
	
	
    this.latency_avg = 0;

    this.target_time = 0.01;
    this.fixedStep = 0.015;
    
};


Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };
//copies a 2d vector like object from one to another
togcore.prototype.pos = function(a) { return {x:a.x,y:a.y}; };
//Add a 2d vector with another one and return the resulting vector
togcore.prototype.v_add = function(a,b) { return { x:(a.x+b.x).fixed(), y:(a.y+b.y).fixed() }; };
//Subtract a 2d vector with another one and return the resulting vector
togcore.prototype.v_sub = function(a,b) { return { x:(a.x-b.x).fixed(),y:(a.y-b.y).fixed() }; };
//Multiply a 2d vector with a scalar value and return the resulting vector
togcore.prototype.v_mul_scalar = function(a,b) { return {x: (a.x*b).fixed() , y:(a.y*b).fixed() }; };
//
togcore.prototype.v_div_scalar = function(a,b) { return {x: (a.x/b).fixed() , y:(a.y/b).fixed() }; };
//For the server, we need to cancel the setTimeout that the polyfill creates
togcore.prototype.stop_update = function() { window.cancelAnimationFrame( this.updateid ); };
//Simple linear interpolation
togcore.prototype.lerp = function(p, n, t) { var _t = Number(t); _t = (Math.max(0, Math.min(1, _t))).fixed(); return (p + _t * (n - p)).fixed(); };
//Simple linear interpolation between 2 vectors
togcore.prototype.v_lerp = function(v,tv,t) { return { x: this.lerp(v.x, tv.x, t), y:this.lerp(v.y, tv.y, t) }; };

togcore.prototype.pos = function(a) { return {x:a.x,y:a.y}; };

togcore.prototype.translate = function(arr){return {x:arr[0],y:arr[1]};};

togcore.prototype.isEqual = function(a,b){return (a.x === b.x && a.y === b.y);};


function PlayerState(name,duration,interruptable,animName,loop, timeIssued,disableMovement){
	
	this.name = name;
	
	this.duration = duration;
	this.interruptable = interruptable;
	this.animName = animName;
	this.loop = loop;
	this.timeIssued = timeIssued;
	this.disableMovement = disableMovement;
	
	this.isDone = function(){
		var timeNow = new Date().getTime();
		if((timeNow - this.timeIssued)> duration){
			return true;
		}else{
			return false;
		}
	
	};
	
	
};




