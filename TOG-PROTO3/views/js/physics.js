/**
 * New node file
 
 *
 *
 *
 *   bounds should provide
 *   
 *   cofS
 *   cofK
 *   gravity
 *   fixedStep
 *
 */


var physics = function(objects, bounds){
	//world bounds
	this.bounds = bounds;
	this.cofS = bounds.cofS;
	this.cofK = bounds.cofK;
	this.gravity = bounds.gravity;
	this.objects = objects;
	
	this.world = bounds.world;
	this.fixedStep = bounds.fixedStep;
	
	this.utils = new TOGUtils();
	
};


physics.prototype.add_object = function(object){
	
	this.objects.push(object);
};




physics.prototype.tick_physics = function(){
	
	
	for(var i in this.objects){
	
		var obj = this.objects[i];
	
		//get force from possible input movement
		var force = obj.force;
		
		//velocity verlet
		var last_acc = obj.acceleration;
		
		var dv = this.utils.v_mul_scalar(obj.velocity, this.fixedStep);
		var da = this.utils.v_mul_scalar(this.utils.v_mul_scalar(last_acc, 0.5), this.fixedStep * this.fixedStep);
		obj.cur_pos_state = this.utils.v_add(obj.cur_pos_state, this.utils.v_mul_scalar(this.utils.v_add(dv, da), 150));
		
		
		
		this.checkGravity(obj,force);
		this.checkBounds(obj,force);
		this.checkFriction(obj,force);
		
		
		obj.acceleration = this.utils.v_div_scalar(force, obj.mass);
		
		
		var avg_acc = this.utils.v_div_scalar(this.utils.v_add(last_acc, obj.acceleration), 2);
		
		
		obj.velocity = this.utils.v_add(obj.velocity, this.utils.v_mul_scalar(avg_acc, this.fixedStep));
		//check obj state after engine tick
		this.checkState(obj, force);
		
	}
	
};


physics.prototype.checkFriction= function(object,force){
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


//bounds to the floor below
physics.prototype.checkBounds = function(object,force){

	var objFeet = object.cur_pos_state.y + object.height;
	object.feet_sensor = false;
	//ground
	if(objFeet > this.world.height){
		
		object.velocity.y *= object.cof_rest; 
		
		object.cur_pos_state.y = this.world.height - object.height;
		
		object.feet_sensor = true;
	}
	//left-bounds
	if(object.cur_pos_state.x < 0){
		object.velocity.x *= 1.0;
		object.cur_pos_state.x = 0;
	}
	
	var objWidth = object.cur_pos_state.x + object.width;
	
	if(objWidth > this.world.width){
		object.velocity.x *= 1.0;
		object.cur_pos_state.x = this.world.width - object.width;
	}
	
	
	
	//reduce velocity x(temporary solution)
	//var cof = 0.03;
	//object.velocity.x *=cof;

};


physics.prototype.checkState = function(object,force){
	//check if falling:
	if(object.velocity.y > 0){
		if(object.velocity.y < 1 && object.feet_sensor){
			
			if((Math.abs(object.velocity.x)).fixed(3) > 0){
				object.pushState('walk');
	
			}else{
				object.pushState('stance');

			}
			
				
		
		
		}else{
			object.pushState('fall');
		}
	}else{
		//if not falling then object is in jumping
		object.pushState('jump');
		
	}

	/*
	if((Math.abs(object.velocity.x)).fixed(3) > 0 ){
		
		if(object.state.name !== 'fall' && object.state.name !== 'jump'){
			object.pushState ('walk');
		}
	

		
	}else{
		
		if(object.state.name !== 'fall' && object.state.name !== 'jump'){
		
			object.pushState('stance');
		}
	}

*/	
	
	
};




physics.prototype.checkGravity = function(object,force){
	
	force.y += object.mass * this.gravity;
	
};


physics.prototype.check_gravity = function(object,force){
	
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


physics.prototype.physics_movement_vector_from_direction = function(x,y,player,isMovement) {

   
	if(isMovement && player.feet_sensor){
		
		player.velocity.x = x;
		player.velocity.y = y;
		
		return {
			
			x: 0,
			y: 0
		
		}
	}
	
	
	//Must be fixed step, at physics sync speed.
	
	/*calculate max force based on player.speed*/
	var maxForce = (player.speed * this.fixedStep) * player.mass;
	
	var xForce = Math.abs(x) > 0 ? maxForce : 0;
	var yForce = 0;
	xForce = x < 0 ? xForce *-1: xForce;
	
	
	//for jumping
	if(player.feet_sensor){
		
		yForce = y < 0 ? player.jump_strength *-1: yForce;
		
	}
	
	return {
		
		x: xForce,
		y: yForce
	
	};

};




