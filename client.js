var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://test.mosquitto.org')
var express = require('express');
var app=express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(__dirname + '/public'));

app.set('port',(process.env.PORT||3000));
app.get('/',function(req,res){
  res.sendFile(__dirname + '/index.html');
});

http.listen (app.get('port'),function() {
  console.log("listening to port number "+app.get('port'));
});
 

io.on('connection',function(socket){

  client.subscribe('1234pragoitemsearched',{qos:2});
  client.subscribe('1234pragoitemadded',{qos:2});

 
socket.on('searchitem',function(data){
	client.publish('pragoitemsearch','1234'+data,{qos:2});
});

socket.on('additem',function(data){
	client.publish('pragoitemadd','1234'+data,{qos:2});
});

client.on('message', function (topic, message) {
	if(topic==='1234pragoitemsearched')
	{
		console.log(message.toString());
		var data=message.toString();
		io.sockets.in(socket.id).emit('pragoitemsearched',data);
		
	}
	if(topic==='1234pragoitemadded')
	{
		io.sockets.in(socket.id).emit('itemadded',1);
	}
	
});


});

io.on('disconnect',function(socket){
	client.end();
});