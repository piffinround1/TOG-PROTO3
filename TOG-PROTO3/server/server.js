var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

http.listen(3020, function(){
	  console.log('listening on *:3020');
});

function startTOG(){

	console.log('initialize TOG-PROTO3...');
	
	app.get('/proto', function(req, res){
		res.sendfile('./views/prototype.html');
	});

	app.get( '/*' , function( req, res, next ) {

         //This is the current file they have requested
	     var file = req.params[0];
	
	    // console.log('file requested : ' + file);
	
	         //Send the requesting client the file.
	     res.sendfile( '/' + file ,{root:'./views'});

	 }); //app.get *
	
	
	io.sockets.on('connection', function(client){
		
		console.log('a client has connected');
		
	});
	
	
	
	

	
}


exports.startTOG = startTOG;
