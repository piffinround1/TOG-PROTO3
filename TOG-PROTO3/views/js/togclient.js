/**
 * New node file
 */
var togclient = function(){
		
	
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
	    
	    
//	    this.clientGhost = new game_player(clientPlayer.pos,clientPlayer.speed,clientPlayer.id+" server pos",clientPlayer.state,true,clientPlayer.planeID);
	    
	    
	    //UI
	    
	    
	//    this.ui_config();
	    
		
	    
	    
	    this.create_config();
		
		this.create_timer();
		
		this.create_physics_loop();
		
		//objects that will be simulated by client physics
		this.newtonian_objects = [this.clientPlayer];
		
		
		//start polling mechanism
		//this.poll_server();
};


togclient.prototype.create_timer = function(){
    setInterval(function(){
        this._dt = new Date().getTime() - this._dte;
        this._dte = new Date().getTime();
        this.local_time += this._dt/1000.0;
    }.bind(this), 4);
};

