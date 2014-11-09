/**
 * Client engine JS
 * 
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







var client_engine = function(viewport,clientPlayer,players,stateDiv,plane,ctx){
		
	
		this.terrainPattern = "rgb(72,72,72)";
		this.instance = 
		this.stateDiv = stateDiv;
		this.players = players;
		this.viewport = viewport;
		
		
		
		
		this.ctx = ctx;
		this.clientPlayer = clientPlayer;
		this.plane = plane;
		
		this.info_color = 'rgba(255,255,255,0.9)';
		
		this._pdt = 0.0001; //The physics update delta time
	    this._pdte = new Date().getTime(); //The physics update last delta time
	        //A local timer for precision on server and client
	    this.first_connection = true;
	    
	    this.local_time = 0.016; //The local timer
	    this._dt = new Date().getTime(); //The local timer delta
	    this._dte = new Date().getTime(); //The local timer last frame time
		
	    this.server_updates = []; //client's server update
	    
  
	    this.clientPlayer.client_engine_instance = this;
	    
	    //objects that will be simulated by client physics
		this.newtonian_objects = [this.clientPlayer];
	    
	    this.ui_config();

	    this.create_config();
		
		this.create_timer();
		
		this.create_physics_loop();
		
		//connect to server
		this.connect_to_server();
		//start polling mechanism
		//this.poll_server();
		
	};
	
client_engine.prototype.connect_to_server = function(){
	
	this.socket = io.connect('/');
	
	this.socket.on('svr_conf',function(data){
		
		console.log(data.msg);
		
	});
	
	this.socket.send('a message from client');
	
	
};
	
	
client_engine.prototype.ui_config = function(){
	
	this.tog_ui = new TOGUI();
};




client_engine.prototype.create_timer = function(){
	    setInterval(function(){
	        this._dt = new Date().getTime() - this._dte;
	        this._dte = new Date().getTime();
	        this.local_time += this._dt/1000.0;
	    }.bind(this), 4);
};

//player class


	var game_player = function(dataPos,speed,id,state,isGhost,planeID,sequence,mass,width,height,sprite_map,jump_strength,cof_rest,inventory,armorSlots,permitted_states,hp){
	
		this.pos = dataPos;
		
		this.client_engine_instance;

		this.inventory = inventory;
		this.armorSlots = armorSlots;
		
		
		this.state = state?state:new PlayerState(name,duration,interruptable,animName,timeIssued);
		this.id = id;
		
		this.old_pos_state = dataPos;
		this.cur_pos_state = dataPos;
		
		this.state_time = new Date().getTime();
		
		this.planeID = planeID;
		this.width = width ? width : 150;
		this.height = height ? height : 300;
		this.speed = speed;
		this.jump_strength = jump_strength;
		this.cof_rest = cof_rest;
		
		
		this.inputs = [];
		this.isGhost = isGhost;
		
		
		this.velocity = {x:0,y:0,z:0};
		this.force = {x:0,y:0,z:0};
		this.acceleration = {x:0,y:0,z:0};
		
		this.mass = mass ;
		this.hp = hp;
		
		this.player_server_updates = [];
		
		
		this.player_permitted_states = permitted_states;
		this.player_states = [];
		this.player_states.push(this.state);
		
		this.sprite_map = sprite_map;
		
		this.orientation = false;
		
		this.feet_sensor = false;
		
		
		
		this.last_input_sequence = sequence ? sequence:0 ;
		//if last input is not zero, then push the
		//current pos and sequence and time as a client input
		//for net correction
		if(this.last_input_sequence != 0){
			var initServerInput = {sequence:this.last_input_sequence};
			this.inputs.push(initServerInput);
		}
	
		if(!this.isGhost){
			
		/*	this.sprite = TOGUtils.getValueWithKey(this.state,this.sprite_map);
		*/
			
		
			
		}
		
		
		
		this.color = 'rgba(255,255,255,0.9)';
		
		
		this.firstDraw = true;
		//for debugging purposes
		this.playerConsole	 = jQuery('<div id="console'+this.id+'" class="console"></div>').appendTo('body');
		this.isDead = false;
		
	};

	game_player.prototype = {
			draw : function(ctx,dt,view_pan,te,gd,draw2d){
				
				
				
				jQuery('.console').html("player_states: "+this.player_states.length);
				jQuery('.console').html(jQuery('.console').html()+"<br>current state: "+this.state.name);
				
				jQuery('.console').html(jQuery('.console').html()+"<br>velocity X: "+this.velocity.x);
				jQuery('.console').html(jQuery('.console').html()+"<br>velocity Y: "+this.velocity.y);
				jQuery('.console').html(jQuery('.console').html()+"<br>force x: "+this.force.x);
				jQuery('.console').html(jQuery('.console').html()+"<br>force Y: "+this.force.y);
				jQuery('.console').html(jQuery('.console').html()+"<br>acc X: "+this.acceleration.x);
				jQuery('.console').html(jQuery('.console').html()+"<br>acc Y: "+this.acceleration.y);
				jQuery('.console').html(jQuery('.console').html()+"<br>HP  "+this.hp);
				jQuery('.console').html(jQuery('.console').html()+"<br>isDead?  "+this.isDead);
				
				
				if(!this.sprite){
					
					this.sprite = new TOGSprite(graphicsDevice,draw2D,this);
					
				}
				
				
				if(!this.isGhost){
			
					this.sprite.x = this.pos.x - view_pan.x;
					this.sprite.y = this.pos.y - view_pan.y;
					
					
					this.playerConsole.css({
						
						top:this.pos.y - this.height,
						left: this.pos.x - this.width
					});
					
					
					this.sprite.changeOrientation(this.orientation);
					//determine current state from queued states
					this.determineState();
					
					
					
					//call unEquipAll
					this.unEquipAll();
					this.equipAll();
					
				}
				
			},
	
			determineState: function(){
			
				if(this.hp <= 0 && !this.isDead){
					this.pushState('dead');
				}
				
				if(!this.player_states||!this.player_states[0]) return;
				
				this.state = this.player_states[0];
				this.player_states.splice(0,1);
				
				if(!this.sprite || !this.state) return;
					
				this.sprite.setState(0,this.state,true);
				
			},
			
			takeDamage : function(damage){
				
				this.hp = this.hp - damage.hp;
				this.pushState('damage');
		
			},
			
			pushState: function(state){
				if(!this.sprite ) return;
				
				if((!this.state.interruptable && !this.state.isDone()) || this.state.name == state) return;
				
				for(var i in this.player_permitted_states){
					var onestate = this.player_permitted_states[i];
					
					if(state === onestate.name ){
						
						var pushedState = new PlayerState(onestate.name,onestate.duration,onestate.interruptable,onestate.animName,onestate.loop, new Date().getTime());
						this.player_states.push(pushedState);
						
						break;
					}
				}
				
				
			},
	
			equip: function(slotName,inventoryName){
				
				var inventoryItem = this.findInventory(inventoryName);
				if(inventoryItem){
					this.sprite.equipSlot(slotName, inventoryItem.attachmentName);
					
					var slot = this.findArmorSlot(slotName);
					//re-add equippedInventory from slot to inventory
					if(slot.equippedInventory) this.addInventory(slot.equippedInventory);
					//add to equipment slot
					slot.equippedInventory = inventoryItem;
					//remove from inventory
					this.removeInventory(inventoryName);
				}
			},
			
			findInventory : function(inventoryName){
				
				for(var i in this.inventory){
					if(this.inventory[i].name === inventoryName)return this.inventory[i];
				}
				return null;
			},
			
			findInventoryIndex : function(inventoryName){
				
				for(var i in this.inventory){
					if(this.inventory[i].name === inventoryName)return i;
				}
				return null;
			},
			
			findArmorSlot : function(armorSlotName){
				
				for(var as in this.armorSlots){
					var armorSlot = this.armorSlots[as];
					if(armorSlot.name === armorSlotName)return armorSlot;
				}
				return null;
			},
			findArmorSlotByType : function(armorSlotType){
				
				for(var as in  this.armorSlots){
					var armorSlot = this.armorSlots[as];
					
					if(armorSlot.armorSlotType === armorSlotType){
						
						return armorSlot;	
						
					}
				}
				return null;
				
			},
			
			removeInventory : function(inventoryName){
				
				var inventoryIndex = this.findInventoryIndex(inventoryName);
				if(inventoryIndex)
					this.inventory.splice(inventoryIndex);
		
			},
			
			addInventory : function(inventory){
				
				this.inventory.push(inventory);
				
			},
			
			unEquip : function(slotName, attachmentName){
				this.sprite.unEquipSlot(slotName, attachmentName);
				var armorSlot = this.findArmorSlot(slotName);
				//add the unequipped inventory to inventory
				this.addInventory(armorSlot.equippedInventory);
				//remove the item from the armorslot
				armorSlot.equippedInventory = null;
			},
			
			unEquipAll : function(){
				
				if(!this.sprite.isReady || !this.firstDraw ) return;
				
				
				this.sprite.unEquipSlots();
					
			},
			equipAll : function(){
				if(!this.sprite.isReady || !this.firstDraw ){
					return;
				}else{
					this.firstDraw = false;
					for(var as in this.armorSlots){
						var armorSlot = this.armorSlots[as];
						if(!armorSlot.equippedInventory) continue;
						
						this.sprite.equipSlot(slotName, inventoryItem.attachmentName);
				
					}
					
					
					
				}
				
			},
			
			
			
			toggleEquipment : function (armorSlotType,inventoryName){
				
				
				var armorSlot= this.findArmorSlotByType(armorSlotType);
				var onSlot;
				if(armorSlot.equippedInventory)
					onSlot = armorSlot.equippedInventory.name === inventoryName ? true :false;
				else
					onSlot = false;
					
					
				if(onSlot){
					this.unEquip(armorSlot.name, inventoryName);
				}else{
					this.equip(armorSlot.name, inventoryName);
					
				}
			
			}
			
			
			
			
	
	};
	
client_engine.prototype.update_physics = function(){
	
		this.clientPlayer.old_pos_state = this.pos(this.clientPlayer.cur_pos_state);
		var nd = this.process_input(this.clientPlayer);
		this.clientPlayer.force = nd;
	
		//tick physics engine
		this.physics.tick_physics();
		
};

client_engine.prototype.create_physics_loop = function(){
	setInterval(function(){
        this._pdt = (new Date().getTime() - this._pdte)/1000.0;
        this._pdte = new Date().getTime();
        this.update_physics();
    }.bind(this), 15);
};



client_engine.prototype.process_input = function(player) {

    //It's possible to have recieved multiple inputs by now,
    //so we process each one
    var x_dir = 0;
    var y_dir = 0;
    var ic = player.inputs.length;
    var isMovement = false;
    if(ic) {
        for(var j = 0; j < ic; ++j) {
                //don't process ones we already have simulated locally
            if(player.inputs[j].sequence <= player.last_input_sequence) continue;
           
            var input = player.inputs[j].inputs;
            var c = input.length;
            for(var i = 0; i < c; ++i) {
                var key = input[i];
                if(key == 'l') {
                    //x_dir -= 1;
                	x_dir  = player.speed *-1;
                	isMovement = true;
                	
                	player.orientation = true;
                }
                if(key == 'r') {
                   // x_dir += 1;
                    x_dir = player.speed;
                	isMovement = true;
                	player.orientation = false;
                }
                /* down disabled 
                
                if(key == 'd') {
                	y_dir += 1;
                }*/
                if(key == 'u') {
                	
                  y_dir = -1;
                    
                }
                
                this.do_skill(key,player);
                
            } //for all input values

        } //for each input command
    } //if we have inputs
    
        //we have a direction vector now, so apply the same physics as the client
    var resulting_vector = this.physics.physics_movement_vector_from_direction(x_dir,y_dir,player,isMovement);
    if(player.inputs.length) {
        //we can now clear the array since these have been processed
    	
        player.last_input_time = player.inputs[ic-1].time;
        player.last_input_sequence = player.inputs[ic-1].sequence;

    }

        //give it back
    return resulting_vector;

};


client_engine.prototype.do_skill = function(key,player){
	
	if(!key||key.length < 1) return;
	
	if(key === 'sk1'){
		player.pushState( 'skill1');
	}
	
	if(key === 'sk2'){
		
		player.pushState( 'skill2');
	}
	
	if(key === 'sk3'){
		
		player.pushState( 'skill3');
	}

	if(key === 'la'){
		
		player.pushState( 'light_attack');
	}
	
	if(key === 'ha'){
		
		player.takeDamage({hp:20});
	}

};


client_engine.prototype.handle_user_input = function(){
	
	
	
	 var input = [];
	 
	 this.client_has_input = false;
	

	 if(keyboard.isDown('left')) {
	    
	            input.push('l');

	    } //left

	    if(keyboard.isDown('right')) {

	            input.push('r');

	        } //right

	   if( keyboard.isDown('Q')) {

	            input.push('sk1');

	   }
	   
	   if( keyboard.isDown('W')) {

           input.push('sk2');

	   }

	   if( keyboard.isDown('E')) {

           input.push('sk3');

	   }

	   
	   if(keyboard.isDown('left_click')) {
   			
		   input.push('la');
   	
	   } //up
	   if(keyboard.isDown('right_click')) {
  			
		   input.push('ha');
   	
	   } 

	    if(keyboard.isDown('SPACE')) {
	    		input.push('u');
	    	
	    } //up
	    
	    
	    
	    //for viewport panning
	    if(keyboard.isDown('E')){
	    
	    	/*if((this.view_pan.x + this.viewport.width) < this.plane.width){
	    		this.view_pan.x += this.pan_speed;
	    	}else{
	    		this.view_pan.x =  this.plane.width - this.viewport.width;
	    	}
	    	*/
	    	
	    	
	    	
	    }
	    
	    if(keyboard.isDown('Q')){
	    	/*if(this.view_pan.x > 0){
	    		this.view_pan.x -= this.pan_speed;
	    	}else{
	    		this.view_pan.x = 0;
	    	}*/
	    }
	    
	    //for gui
	    
	    if(keyboard.isDown('I')){
	    	// alert('inventory up');
	    	//this.clientPlayer.sprite.toggleEquip();
	    	//alert('inventory done');
	    /*	this.tog_ui.inventoryWindow(this.clientPlayer.inventory,this.clientPlayer.armorSlots,this.clientPlayer);*/
	    
	    }
	    
	    
	    
	 
	 if(input.length){
		
		 
		 this.input_seq +=1;
		 
		 this.clientPlayer.inputs.push({
			 							inputs:input,
			 							sequence: this.input_seq,
			 							time: this.local_time.fixed(3)
		 							  });
		 
		 //send to server the summary of what happened
		 
		 var packet = {
				 playerID : this.clientPlayer.id,
				 inputs : input,
				 sequence: this.input_seq,
				 time : this.local_time.toFixed(3),
				 type:'i'
		 };
		 
	//	 jQuery.post('/TOG-1-0/TestActionReceiverServlet',packet);
		 
		 
		 
	 }//else{
		// this.clientPlayer.state = 'no-state';
		 
	 //}
	 
};




client_engine.prototype.update = function(t){
	
	this.dt = this.lastframetime ? ( (t - this.lastframetime)/1000.0).fixed() : 0.016;
	
	this.lastframetime = t;
	
	this.client_update();
	
	this.updateid = window.requestAnimationFrame( this.update.bind(this), this.viewport );
	
};


client_engine.prototype.client_update = function(){
    
	    
    this.handle_user_input();
  
   
    
    //draw other players
    this.draw_other_players();
    
  
    this.update_local_position();
    
    this.clientPlayer.draw(this.ctx,this.dt,this.view_pan);
    if(this.draw_ghost){
    	  this.clientGhost.draw(this.ctx,this.dt,this.view_pan);
    }
  
    
    this.calculate_fps();
};

client_engine.prototype.draw_other_players = function(){
	for(var oKey in this.players){
		this.players[oKey].draw(this.ctx,this.dt,this.view_pan);
	}
};




client_engine.prototype.create_config = function(){
	
	
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
    
    this.mousepos = {x:0,y:0};
    
    jQuery(this.viewport).mousemove(function(e){
		this.mousepos = this.mouseLookup(e);
	}.bind(this));
    
    
    this.gravity = this.plane.gravity;
    this.cofK = this.plane.cofK;
    this.cofS = this.plane.cofS;
    this.view_pan = this.plane.view_pan;
  
    this.pan_speed = 30;
   
    
    this.bounds = {
    	gravity:this.gravity,
    	cofK:this.cofK,
    	cofS:this.cofS,
    	world:{height : this.plane.height, width : this.plane.width},
    	fixedStep: this.fixedStep
    
    };
    
    
    this.physics = new physics(this.newtonian_objects,this.bounds);
    
    //setup on mouse over event
	
	
	

};

client_engine.prototype.manipulate_config = function(config){
	
	this.draw_ghost = config.draw_ghost;
	this.do_net_correction = config.do_net_correction;
};


client_engine.prototype.calculate_fps = function(){
	
	this.fps =  1/this.dt;
	
	this.fps_avg_acc += this.fps;
	
	this.fps_avg_count++;

	
	if(this.fps_avg_count >= 10){
		this.fps_avg = this.fps_avg_acc / 10;
		this.fps_avg_acc = this.fps;
		this.fps_avg_count = 1;
	}
	
	
};


client_engine.prototype.update_local_position = function(){
	
	//client predict
	
	this.clientPlayer.pos = this.clientPlayer.cur_pos_state;
	
};

client_engine.prototype.poll_server = function(){
		/*jQuery.ajax({
				url:'/TOG-1-0/AsyncTestServlet',
				data:"{planeID:testID1PlaneID}",
				success:this.update_snapshot.bind(this),
				complete:this.poll_server.bind(this),
				dataType:'JSON'
				});*/
	
	
};




client_engine.prototype.refresh_ping = function(){
	
	this.ping = this.recieved_update_time - this.last_poll_time;
	this.ping_acc += this.ping;
	this.ping_avg_count++;
	
	if(this.ping_avg_count === 10){
		this.ping_avg = this.ping_acc / 10;
		this.latency_avg = this.ping_avg / 2;
		this.ping_acc = this.ping;
		this.ping_avg_count = 1;
	}
	
	
	
};



Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };
//copies a 2d vector like object from one to another
client_engine.prototype.pos = function(a) { return {x:a.x,y:a.y}; };
//Add a 2d vector with another one and return the resulting vector
client_engine.prototype.v_add = function(a,b) { return { x:(a.x+b.x).fixed(), y:(a.y+b.y).fixed() }; };
//Subtract a 2d vector with another one and return the resulting vector
client_engine.prototype.v_sub = function(a,b) { return { x:(a.x-b.x).fixed(),y:(a.y-b.y).fixed() }; };
//Multiply a 2d vector with a scalar value and return the resulting vector
client_engine.prototype.v_mul_scalar = function(a,b) { return {x: (a.x*b).fixed() , y:(a.y*b).fixed() }; };
//
client_engine.prototype.v_div_scalar = function(a,b) { return {x: (a.x/b).fixed() , y:(a.y/b).fixed() }; };
//For the server, we need to cancel the setTimeout that the polyfill creates
client_engine.prototype.stop_update = function() { window.cancelAnimationFrame( this.updateid ); };
//Simple linear interpolation
client_engine.prototype.lerp = function(p, n, t) { var _t = Number(t); _t = (Math.max(0, Math.min(1, _t))).fixed(); return (p + _t * (n - p)).fixed(); };
//Simple linear interpolation between 2 vectors
client_engine.prototype.v_lerp = function(v,tv,t) { return { x: this.lerp(v.x, tv.x, t), y:this.lerp(v.y, tv.y, t) }; };

client_engine.prototype.pos = function(a) { return {x:a.x,y:a.y}; };

client_engine.prototype.translate = function(arr){return {x:arr[0],y:arr[1]};};

client_engine.prototype.isEqual = function(a,b){return (a.x === b.x && a.y === b.y);};







/*one solution, take game rules in js
*/
client_engine.prototype.checkGameRules = function(objects){
	
	for(var i in objects){
		var object = objects[i];
		//get force from possible input movement
		var force = object.force;
		//var force = {x:0,y:0};
		
		//velocity verlet
		var last_acc = object.acceleration;
		var dv = this.v_mul_scalar(object.velocity, this.fixedStep);
		var da = this.v_mul_scalar(this.v_mul_scalar(last_acc, 0.5), this.fixedStep * this.fixedStep);
		object.cur_pos_state = this.v_add(object.cur_pos_state, this.v_mul_scalar(this.v_add(dv, da), 150));
		
		
		this.adjustViewPan(object,force);
		this.checkGravity(object,force);
		this.checkBounds(object,force);
		this.checkFriction(object,force);
		
		
		object.acceleration = this.v_div_scalar(force, object.mass);
		
		
		var avg_acc = this.v_div_scalar(this.v_add(last_acc, object.acceleration), 2);
		
		jQuery('.nd_value').html('object mass:'+object.mass +' avg_acc x'+avg_acc.x+' avg_acc.y'+ avg_acc.y +
				'vel x pixels per frame:' + object.velocity.x);
		
		object.velocity = this.v_add(object.velocity, this.v_mul_scalar(avg_acc, this.fixedStep));
		//check object state after engine tick
		this.checkState(object, force);
		
	}
	
	
};


client_engine.prototype.adjustViewPan = function(object,force){
	
	if(object !== this.clientPlayer) return;
	
	if(object.cur_pos_state.x > this.viewport.width/2){
		this.view_pan.x = object.cur_pos_state.x - this.viewport.width/2;
	}
	 
	
};

client_engine.prototype.checkState = function(object,force){
		//check if falling:
		if(object.velocity.y > 0){
			if(object.velocity.y < 1 && object.feet_sensor){
				object.state = 'stance';
			}else{
				object.state = 'fall';
			}
		}else{
			//if not falling then object is in jumping
			object.state = 'jump';
			
		}
	
		
		if((Math.abs(object.velocity.x)).fixed(3) > 0 ){
			
			if(object.state !== 'fall' && object.state !== 'jump'){
				object.state = 'walk';
			}
		
			//for orientation
			object.orientation = (object.velocity.x).fixed(1) > 0 ? 'r': 'l';
			
		}else{
			
			if(object.state !== 'fall' && object.state !== 'jump'){
			
				object.state = 'stance';
			}
		}
	
		
		
		
};
//check for gravity on objects
client_engine.prototype.checkGravity = function(object,force){
	
	force.y += object.mass * this.gravity;
	
};

client_engine.prototype.checkFriction= function(object,force){
	//add friction
	var nForce = object.mass * this.gravity;
	
	var fNet = 0;

	
	//check if object is not moving on x-axis
	if((object.velocity.x).fixed(1) === 0){
		//if force.x acted upon object is greater than static friction
		var frictionS = this.cofS * nForce;
		
		if(Math.abs(force.x) < frictionS){	
			//cancellation of force due to static friction
			fNet = 0;
			//re-enforce object velocity to zero
			object.velocity.x = 0;
			object.acceleration.x = 0;
			
		}		
	}else{
		
		var frictionK = this.cofK * nForce;
		
		fNet = Math.abs(force.x) - frictionK;
		
		if(object.velocity.x > 0){
			fNet *= -1;
		}
	}
			
	force.x = force.x - fNet;
	
			

};



client_engine.prototype.mouseLookup = function(e){
	//get event from param or the window.event
	var evt = e ? e : window.event;

	return {x: evt.clientX - jQuery(this.viewport).offset().left,
			y: evt.clientY - jQuery(this.viewport).offset().top
			};
	
	
};



