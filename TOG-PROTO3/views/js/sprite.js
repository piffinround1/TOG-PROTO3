


function TOGSprite(gd,draw2d,gamePlayer) {
    this.atlas;
    this.skeletonName = gamePlayer.sprite_map;
    this.skeletonData;
    this.vertices = [];
    this.graphicsDevice = gd;
    this.draw2d = draw2d;
    
    this.orientation = gamePlayer.orientation? gamePlayer.orientation : false;
  
    this.x = gamePlayer.pos.x;
    this.y = gamePlayer.pos.y;
    
    this.state = gamePlayer.state;
    this.gamePlayer = gamePlayer;
    this.skeleton;
    
    //load sprite obj 
    this.load(); 
    
    this.isEquip = true;
    this.isReady = false;
    
};

TOGSprite.prototype.toggleEquip = function(){
	this.isEquip = this.isEquip ? false : true;
	
	this.equip(this.isEquip,this.skeleton);
		
	
	
};




TOGSprite.prototype.load = function(){

	TurbulenzEngine.request("data/" + this.skeletonName + ".atlas", this.loadAtlas.bind(this));
};




TOGSprite.prototype.loadAtlas = function(atlasText){
	
	
	var gd = this.graphicsDevice;
	
	
	var waitTxt = this.waitForTexture.bind(this);
	
	var at = new spine.Atlas(atlasText, {
          load: function (page, path) {
                  gd.createTexture({
                          src: "data/" + path,
                          mipmaps: true,
                          onload: function (texture) {
                                  
                        	  	
                        	  	  page.rendererObject = texture;
                                  page.width = texture.width;
                                  page.height = texture.height;
                                  at.updateUVs(page);
                                  waitTxt();
                          }
                  });
          },
          unload: function (texture) {
                  texture.destroy();
          }
	  });
	
	
	this.atlas = at;
	
	
	 
};

TOGSprite.prototype.waitForTexture = function(){
	
        TurbulenzEngine.request("data/" + this.skeletonName + ".json", this.loadSkeletonData.bind(this));
};



TOGSprite.prototype.loadSkeletonData = function(skeletonText){
	
	var json = new spine.SkeletonJson(new spine.AtlasAttachmentLoader(this.atlas));
	json.scale = 0.4;
	this.skeletonData = json.readSkeletonData(JSON.parse(skeletonText));
	this.start();
	
	
};


TOGSprite.prototype.start = function(){
	
	spine.Bone.yDown = true;

	this.skeleton = new spine.Skeleton(this.skeletonData);
	this.skeleton.x = this.x;
	this.skeleton.y = this.y;
	this.skeleton.updateWorldTransform();

	var stateData = new spine.AnimationStateData(this.skeletonData);	
	this.animState = new spine.AnimationState(stateData);
	
	this.skeleton.setSkinByName("default");
	
	
	
	
	this.skeleton.setSlotsToSetupPose();
	
	this.animState.setAnimationByName(0,this.state.animName, true);
	
	

	var batch = new SpriteBatch(this.draw2d);
	var lastTime = TurbulenzEngine.time;
	
	function update() {
		
		if (!this.graphicsDevice) return;

		var delta = TurbulenzEngine.time - lastTime;
		lastTime = TurbulenzEngine.time;
		this.animState.update(delta);
		this.animState.apply(this.skeleton);
		
		/*if(this.animState.animation){
			this.state = this.animState.animation.name;
			jQuery('.console').html(jQuery('.console').html()+"<br>cuurent "+this.state);
		}*/
		
		this.skeleton.x = this.x;
		this.skeleton.y = this.y;
		
		this.skeleton.flipX = this.orientation;
		this.skeleton.updateWorldTransform();
		

		
		batch.begin(this.draw2d.blend.alpha);
		this.drawSkeleton(batch, this.skeleton);
		batch.end();
		this.graphicsDevice.endFrame();
	}
	this.isReady = true;
	TurbulenzEngine.setInterval(update.bind(this), 1000 / 60);
	
	
};



TOGSprite.prototype.setState = function(trackIndex,state){
	
	if(!this.animState) return;
	
	
	if(this.state.name != state.name){
		
		
		this.animState.setAnimationByName(trackIndex,state.animName,state.loop);
		this.skeleton.setBonesToSetupPose();
		this.state = state;
	}
	
	
	
	
	
};


TOGSprite.prototype.addState = function(trackIndex,state,loop){
	
	if(!this.animState) return;
	
		
		this.animState.addAnimationByName(trackIndex,state,loop,0);
	
	

	//this.state = state;
	
};





TOGSprite.prototype.changeOrientation = function(orientation){
	this.orientation = orientation;
}


TOGSprite.prototype.equipSlot = function (slotName,attachmentName){	
	
	var attachmentLoader = new spine.AtlasAttachmentLoader(this.atlas);

	//assign attachmenttype as regionattachment-spine
	var attachment = attachmentLoader.newAttachment(null, spine.AttachmentType.region, attachmentName);
	
	var slot = this.skeleton.findSlot(slotName);
	
	
	slot.attachment = attachment;
	
	slot.setToSetupPose();
	
};

TOGSprite.prototype.unEquipSlots = function(){
	
	
	for(var s in this.skeleton.drawOrder){
		
		var slot = this.skeleton.drawOrder[s];
		var attachment = slot.attachment;
		if (!(attachment instanceof spine.RegionAttachment) || slot.data.name.indexOf('Basic') < 0) continue;
		
		slot.attachment = null;
		
	}
	
	this.skeleton.setBonesToSetupPose();
	
};


TOGSprite.prototype.unEquipSlot = function (slotName,attachmentName){
	
	var slot = this.skeleton.findSlot(slotName);
	
	if(slot.attachment === null){
		return;
	}
	else{
		
		slot.attachment = null;
		//weird slot.setToSetupPose not working?
		this.skeleton.setBonesToSetupPose();
	}
	
};


TOGSprite.prototype.hasEquip = function (slotName){
	
	if(this.skeleton.findSlot(slotName).attachment)
		return true;
	else
		return false;
};


TOGSprite.prototype.drawSkeleton = function (batch, skeleton){
	
	var drawOrder = skeleton.drawOrder;
	for (var i = 0, n = drawOrder.length; i < n; i++) {
	var slot = drawOrder[i];
	var attachment = slot.attachment;
	if (!(attachment instanceof spine.RegionAttachment)) continue;
	attachment.computeVertices(skeleton.x, skeleton.y, slot.bone, this.vertices);
	var blendMode = slot.data.additiveBlending ? draw2D.blend.additive : draw2D.blend.alpha;
	if (batch.blendMode != blendMode) {
	batch.end();
	batch.begin(blendMode);
	}
	batch.add(
	attachment.rendererObject.page.rendererObject,
	this.vertices[0], this.vertices[1],
	this.vertices[6], this.vertices[7],
	this.vertices[2], this.vertices[3],
	this.vertices[4], this.vertices[5],
	skeleton.r * slot.r,
	skeleton.g * slot.g,
	skeleton.b * slot.b,
	skeleton.a * slot.a,
	attachment.uvs[0], attachment.uvs[1],
	attachment.uvs[4], attachment.uvs[5]
	);
	}
      	
};

	
	





