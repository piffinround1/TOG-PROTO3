var TOG = {};

TOG.Inventory = function(name,attachmentName,allowedArmorSlot){
	
	this.name = name;
	this.attachmentName = attachmentName;
	this.allowedArmorSlot = allowedArmorSlot;
	
};



TOG.ArmorSlot = function(name,armorSlotType,equippedInventory){
	
	this.name = name;
	this.armorSlotType = armorSlotType;
	this.equippedInventory = equippedInventory;
	
};

TOG.ArmorSlotType = {
		
		head : 'head',
		pelvis : 'pelvis',
		body : 'body',
		neck :'neck',
		
		rightArm: 'rightArm',
		rightShoulder :'rightShoulder',
		
		rightLeg : 'rightLeg',
		rightThigh : 'rightThigh',
		rightFoot : 'rightFoot',
		
		leftArm : 'leftArm',
		leftShoulder : 'leftShoulder',
		
		leftLeg  : 'leftLeg',
		leftThigh : 'leftThigh',
		leftFoot : 'leftFoot'
		
		
			
};