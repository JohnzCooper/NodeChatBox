var config = require('./config.json');
const mongo = require('mongodb').MongoClient;
const io = require('socket.io').listen(config.socketPort).sockets;
var dateTime = require('node-datetime');

//get bc connection details from config
var dbPort = config.dbPort;
var dbHost = config.dbHost;
var dbName = config.dbName;

//Connect to mongo
mongo.connect(dbHost + dbPort, { useNewUrlParser: true }, function (err, db) {
    if (err) {
        throw err;
    }
    console.log('MongoDb connected..');
    var dbo = db.db(dbName);
    let users = dbo.collection('user');
    let chatHistory = dbo.collection('chatHistory');

    //crete socket connection
    io.on('connection', function (socket) {

        sendStatus = function (s) {
            socket.emit('status', s);
        }

        socket.on('login', function (data) {
            console.log(data);
            var query = { name: data.name };
            //username validation
            users.find(query).toArray(function (error, result) {
                if (error) throw err;

                if (result.length == 0) {
                    console.log('login success');
                    //new user intert in db
                    users.insert({ name: data.name, socketID: socket.id }, function () {
                        users.find().toArray(function (err, res) {
                            if (err) throw err;
                            console.log(res)
                            io.emit('users', res);
                        });
                    });
                    //get chat history
                    chatHistory.find().toArray(function (err, res) {
                        if (err) throw err;
                        socket.emit('chatHistory', res);
                    });
                    sendStatus({
                        message: 'Successfully login to chat room',
                        status: true
                    });
                    //emit chat romm enter message
                    socket.broadcast.emit('outputLogedUser', data.name);
                }
                else {
                    sendStatus({
                        message: 'Nikc name already use',
                        status: false
                    });
                }
            });
        });

        //message sending
        socket.on('inputChat', function (data) {
            let name = data.name;
            let message = data.message;

            //check for name and message
            if (name == '' || message == '') {
                sendStatus({
                    message: 'Please enter a message',
                    status: false
                })
            }
            else {
                //insert message
                var dt = dateTime.create();
                var formatted = dt.format('d.m.Y H:M:S');
                chatHistory.insert({ name: name, message: message, dateTime: formatted }, function (res) {
                    console.log(res);
                    io.emit('output', [{ name: name, message: message, dateTime: formatted }]);
                });
            }
        });

    });

});