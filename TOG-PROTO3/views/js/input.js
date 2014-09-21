
(function() {
    var pressedKeys = {};

    function setKey(event, status) {
        var code = event.keyCode;
        var key;

        switch(code) {
        case 32:
            key = 'SPACE'; break;
        case 37:
            key = 'LEFT'; break;
        case 38:
            key = 'UP'; break;
        case 39:
            key = 'RIGHT'; break;
        case 40:
            key = 'DOWN'; break;
        default:
            // Convert ASCII codes to letters
            key = String.fromCharCode(code);
        }

        pressedKeys[key] = status;
    }

    document.addEventListener('keydown', function(e) {
        setKey(e, true);
    });

    document.addEventListener('keyup', function(e) {
        setKey(e, false);
    });

    window.addEventListener('blur', function() {
        pressedKeys = {};
    });
    
    
    jQuery(document).mousedown(function(event) {
       
    	switch (event.which) {
            case 1:
            	
            	pressedKeys['LEFT_CLICK'] = true;
                break;
            case 2:
            	pressedKeys['mid_click'] = true;
                break;
            case 3:
            	pressedKeys['RIGHT_CLICK'] = true;
                break;
            default:
             
        }
    });
    
    jQuery(document).mouseup(function(event) {
        
    	switch (event.which) {
            case 1:
            	pressedKeys['LEFT_CLICK'] = false;
                break;
            case 2:
            	pressedKeys['mid_click'] = false;
                break;
            case 3:
            	pressedKeys['RIGHT_CLICK'] = false;
                break;
            default:
             
        }
    });
    
    

    window.keyboard = {
        isDown: function(key) {
        	
            return pressedKeys[key.toUpperCase()];
        }
    };
})();