(function() {
    function TOGUtils() {};

    TOGUtils = {
    		getValueWithKey : function(key,map){
    			
    			for(var i in map){
    				var obj = map[i];
    			
    				if(obj.key === key){
    					
    					return obj.val;
    					
    				}
    			}
    		}
    
    };

    window.TOGUtils = TOGUtils;
})();