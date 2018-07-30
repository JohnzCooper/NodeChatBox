var servicHost = "http://127.0.0.1:4000";
var socket;

$(document).ready(function () {
    $('#chat').hide();
    $("#login").show();
});

//connect to socket.io
var connectToSocket = function () {
    socket = io.connect(servicHost);
};
$("#btnSubmit").click(function () {
    var length = $("#userName").val().length;
    if (length != 0 && length < 13) {
        if ($("#userName").val().indexOf('#') == -1) {
            connectToSocket();
            socket.emit('login', {
                name: userName.value
            });
            socket.on('status', function (data) {
                //get message status
                if (data.status) {
                    $("#chat").show();
                    $("#login").hide();
                    socket.on('users', function (res) {
                        if (res.length > 0) {
                            $("#chatrooms").empty();
                            $('#chatrooms').append('<label type="button" class="form-control" style="background-color: grey">' + '#Axinom' + '</label>');
                            for (var x = 0; x < res.length; x++) {
                                // Build out user div
                                if (res[x].name === userName.value) {
                                    $('#chatrooms').append('<label type="button" class="form-control" style="background-color: gold">' + res[x].name + '</label>');
                                }
                                else {
                                    $('#chatrooms').append('<label type="button" class="form-control">' + res[x].name + '</label>');
                                }

                            }
                        }
                    });
                    //listing chat history
                    socket.on('chatHistory', function (res) {
                        console.log(res);
                        if (res.length > 0) {
                            var messages = $("#messages");
                            for (var x = 0; x < res.length; x++) {
                                var message = document.createElement('div');
                                message.setAttribute('class', 'chat-message');
                                message.textContent = res[x].dateTime + '- ' + res[x].name + ": " + res[x].message;
                                messages.append(message);
                            }
                        }
                    });

                    socket.on('output', function (res) {
                        if (res.length) {
                            console.log(res);
                            for (var x = 0; x < res.length; x++) {
                                // Build out message div
                                var message = document.createElement('div');
                                message.setAttribute('class', 'chat-message');
                                message.textContent = res[x].dateTime + '- ' + res[x].name + ": " + res[x].message;
                                messages.append(message);
                            }
                        }
                    });

                    socket.on('outputLogedUser', function (res) {
                        console.log('loged user data :' + res);
                        var messages = $("#messages");
                        if (res.length > 0) {
                            var message = document.createElement('div');
                            message.setAttribute('class', 'chat-message');
                            message.textContent = 'User ' + res + " entered chatroom #Axinom";
                            messages.append(message);
                        }
                    });
                }
                else {
                    alert(data.message);
                }
            });
        }
        else {
            alert("Username can not use character ‘#’");
        }
    }
    else {
        alert("Username can not empty and length should be less than 12 ");
    }
});
//sending chat
$("#btnSubmitChat").click(function () {
    var textarea = $("#textarea");
    if (textarea.val().length > 0) {
        console.log(userName.value + textarea.value);
        socket.emit('inputChat', {
            name: userName.value,
            message: textarea.val()
        });
        textarea.val("");
    }
});
