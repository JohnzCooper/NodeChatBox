const mongo = require('mongodb').MongoClient;
const io = require('socket.io').listen(4000).sockets;
var CONFIG = require('./config.json');
var dateTime = require('node-datetime');

var dbPort = CONFIG.dbPort;
var dbHost = CONFIG.dbHost;
var dbName = CONFIG.dbName;

//Connect to mongo
mongo.connect(dbHost+dbPort,{ useNewUrlParser: true }, function(err, db){
    if(err){
        throw err;
    }
    console.log('MongoDb connected..');
    var dbo = db.db(dbName);
    let users = dbo.collection('user');
    let chatHistory = dbo.collection('chatHistory');

    io.on('connection', function(socket){

        sendStatus = function(s){
            socket.emit('status',s);
        }

        socket.on('login',function(data){
            console.log(data);
            var query = { name: data.name };
            users.find(query).toArray(function(error, result) {
                if (error) throw err;

                if(result.length == 0 ){
                    console.log('login success');
                    
                    users.insert({name: data.name, socketID: socket.id}, function(){
                        users.find().toArray(function(err, res) {
                            if (err) throw err;
                            console.log(res)
                            io.emit('users',res);
                        });
                    });
                    chatHistory.find().toArray(function(err, res){
                        if (err) throw err;
                        socket.emit('chatHistory',res);
                    });
                    sendStatus({
                        message: 'Successfully login to chat room',
                        status: true
                    });
                    socket.broadcast.emit('outputLogedUser',data.name);
                }
                else{
                    sendStatus({
                        message: 'Nikc name already use',
                        status: false
                    });
                }
            });
        });

        socket.on('inputChat',function(data){
            let name = data.name;
            let message = data.message;

            //check for name and message
            if(name == '' || message == ''){
                sendStatus({
                    message: 'Please enter a message',
                    status: false
                })
            }
            else{
                //insert message
                var dt = dateTime.create();
                var formatted = dt.format('d.m.Y H:M:S');
                // console.log(formatted);
                // console.log(data.message);
                chatHistory.insert({name: name, message: message, dateTime: formatted}, function(res){
                    console.log(res);

                    io.emit('output', [{name: name, message: message, dateTime: formatted}]);

                    //send status object
                    // sendStatus({
                    //     message: 'Message sent',
                    //     clear: true
                    // });
                });
            }
        });

    });

});