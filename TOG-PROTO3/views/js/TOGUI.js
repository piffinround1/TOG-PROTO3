


function TOGUI(viewport, ui_type,x,y){
	
	
	this.viewport = viewport;
	this.ui_type = ui_type;
	this.x = x;
	this.y = y;
	
	this.invDiv;
	
}


TOGUI.prototype = {
	
	
	inventoryWindow : function(inventory,armorSlots,clientPlayer){
		
		if(this.invDiv) return;
		
		
		
		this.invDiv = jQuery(document.createElement('div'));
		
		this.invDiv.attr('id','inventoryWindow').draggable();
		//slots
		this.invDiv.append(this.createInventoryArmorSlots(armorSlots,clientPlayer));
		//items
		this.invDiv.append(this.createInventoryItems(inventory,clientPlayer));
		
		jQuery('body').append(this.invDiv);
		
		
	},
	
	
	createInventoryArmorSlots : function(armorSlots,clientPlayer){
		
		var invSlotsDiv = jQuery(document.createElement('div'));
		invSlotsDiv.attr('id','inventorySlots');
		
		for(var as in armorSlots){
			var armorSlot = armorSlots[as];
			invSlotsDiv.append(this.createInventoryArmorSlot(armorSlot,clientPlayer));
		}
		
		return invSlotsDiv;
	},
	
	createInventoryArmorSlot : function(armorSlot,clientPlayer){
		
		var armorSlotDiv = jQuery(document.createElement('div'))
							.addClass('inventorySlot')
							.append(armorSlot.armorSlotType)
							.addClass('slot'+armorSlot.armorSlotType)
							.droppable({
								
								accept:'.item'+armorSlot.armorSlotType,
								drop: function(event,ui){
									
									var inventoryName = ui.draggable.data('inventoryItemName');
									clientPlayer.equip(armorSlot.name,inventoryName);
									ui.draggable.addClass('onSlot');
								}
								
							
							});
							
		return armorSlotDiv;
		
	},

	createInventoryItem : function (inventoryItem,clientPlayer){
		
		
		
		var inventoryItemDiv = jQuery(document.createElement('div'))
									.addClass('inventoryItem')
									.append(inventoryItem.name)
									.addClass('item'+inventoryItem.allowedArmorSlot)
									.draggable({
										revert:'invalid'})
									.data('inventoryItemName',inventoryItem.name)
									.dblclick(function(){
										
										clientPlayer.toggleEquipment(inventoryItem.allowedArmorSlot,inventoryItem.name);
										//check if div is onSlot or not;
										var targetDiv;
										
										if(jQuery(this).hasClass('onSlot')){
											jQuery(this).removeClass('onSlot');
											targetDiv = jQuery("#inventoryItems");
										}else{
											jQuery(this).addClass('onSlot');
											targetDiv =  jQuery(".slot"+inventoryItem.allowedArmorSlot);
										
										}						
										
										targetDiv.append(this);	
									})
									;
			
		
		return inventoryItemDiv;
	},
	
/*	//if slotDiv is not available, find slotType class usually this should
	//be unique
	appendToSlotProgrammatic : function(itemDiv,slotDiv,slotType){
		
		var targetDiv = slotDiv ? slotDiv : jQuery("."+slotType);
		targetDiv.append(itemDiv);
		
	},*/
	
	
	
	createInventoryItems : function (inventory,clientPlayer){
		
		var invItemsDiv = jQuery(document.createElement('div'));
		invItemsDiv.attr('id','inventoryItems');
		
		for(var i in inventory){
			var inventoryItem = inventory[i];
			invItemsDiv.append(this.createInventoryItem(inventoryItem,clientPlayer));
			
		}
	
		return invItemsDiv;
	}
	
	
};




