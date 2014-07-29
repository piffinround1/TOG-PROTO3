var app = require('express')();
var http = require('http').Server(app);



function startTOG(){

	console.log('initialize TOG-PROTO3...');
	
	app.get('/', function(req, res){
		  res.sendfile('./views/proto3.html');
		  
		  
	
	
	});

	
	
	
	 app.get( '/*' , function( req, res, next ) {

         //This is the current file they have requested
	     var file = req.params[0];
	
	         //For debugging, we can track what files are requested.
	     console.log('\t :: Express :: file requested : ' + file);
	
	         //Send the requesting client the file.
	     res.sendfile( '/' + file ,{root:'./views'});

	 }); //app.get *
	
	
	
	
	http.listen(3020, function(){
		  console.log('listening on *:3020');
	});
	
}


exports.startTOG = startTOG;
