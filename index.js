var express = require('express');
var app=express();
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var db;
var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://test.mosquitto.org');
client.subscribe("pragoitemsearch",{qos:2});
client.subscribe("pragoitemadd",{qos:2});
var http = require('http').Server(app);
var string='';var arr=[];
var io = require('socket.io')(http);
app.set('port',(process.env.PORT||8080));
MongoClient.connect("", function(err, database) {
  if(err) throw err;

  db = database;

  // Start the application after the database connection is ready
  http.listen (app.get('port'),function() {
  console.log("listening to port number "+app.get('port'));
});

});

client.on('message', function (topic, message) {
  // message is Buffer 
  if(topic==="pragoitemsearch")
  {
	  
      var string=message.toString();var l=string.length;
	  var str1=string.substring(0,4);
	  var str2=string.substring(4,l);
	  
	  db.collection('merchant', function(err, collection) {
					collection.find({"uuid":str1}).toArray(function(err,res){
						if(err) throw err;
						var result=str1+"pragoitemsearched";
						
						for(var i=0;i<res[0][str2].length;i++)
						{
							client.publish(result,res[0][str2][i],{qos:2});
							
						}
					});
             });
  }
  
  if(topic==='pragoitemadd'){
	  var string2=message.toString();
	  var len=string2.length;
	  var str3=string2.substring(0,4);//uuid
	  var n=string2.indexOf(",");
	  var str5=string2.substring(4,n);//category
	  var item=string2.substring(n+1,len);//item
	  db.collection('merchant',function(err,collection){
		      collection.update(
				{"uuid":str3},
				{$push :{[str5]:item}},
				function(err,result){
				if (err) throw err;
				}
				);
			client.publish(str3+'pragoitemadded','success',{qos:2});
	  });
  }
  
  
});