const meetingService = require('../services/meeting.service');
const { MeetingPayloadEnum } = require('./meeting-payload-enum');

async function joinMeeting(meetingId, socket, meetingServer, payload){
    const { userId, name } = payload.data;

    meetingService.isMeetingPresent(meetingId, async (error, results)=> {
        if(error && !results){
            sendMessage(socket, {
                type: MeetingPayloadEnum.NOT_FOUND
            });
        }
        if (results) {
            addUser(socket, {meetingId, userId, name}).then((result)=> {
                if (result) {
                    sendMessage(socket, {
                        type: MeetingPayloadEnum.JOINED_MEETING, data: {
                            userId
                        }
                    });

                broadcastUsers(meetingId, socket, meetingServer, {
                    type: MeetingPayloadEnum.USER_JOINED,
                    data: {
                        userId,
                        name,
                        ...payload.data
                    }
                }, (error)=> {
                    console.log(error);
                });
                }
            });
        }
    });
}

function forwardConnectionRequest(meetingId, socket, meetingServer, payload) {
    const { userId, otherUserId, name } = payload.data;

    var model = {
        meetingId: meetingId,
        userId: otherUserId 
    };

    meetingService.getMeetingUser(model, (error, results)=> {
        if (results) {
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.CONNECTION_REQUEST,
                data: {
                    userId,
                    name,
                    ...payload.data
                }
            });

            meetingServer.to(results.socketId).emit('message', sendPayload)
        }
    })
}
function forwardIceCandidate(meetingId, socket, meetingServer, payload) {
    const { userId, otherUserId, candidate } = payload.data;

    var model = {
        meetingId: meetingId,
        userId: otherUserId 
    };

    meetingService.getMeetingUser(model, (error, results)=> {
        if (results) {
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.ICECANDIDATE,
                data: {
                    userId,
                    candidate,
                    ...payload.data
                }
            });

            meetingServer.to(results.socketId).emit('message', sendPayload)
        }
    })
}

function forwardOfferSDP(meetingId, socket, meetingServer, payload) {
    const { userId, otherUserId, sdp } = payload.data;

    var model = {
        meetingId: meetingId,
        userId: otherUserId 
    };

    meetingService.getMeetingUser(model, (error, results)=> {
        if (results) {
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.OFFER_SDP,
                data: {
                    userId,
                    sdp,
                    ...payload.data
                }
            });

            meetingServer.to(results.socketId).emit('message', sendPayload)
        }
    })
}

function forwardAnswerSDP(meetingId, socket, meetingServer, payload) {
    const { userId, otherUserId, sdp } = payload.data;

    var model = {
        meetingId: meetingId,
        userId: otherUserId 
    };

    meetingService.getMeetingUser(model, (error, results)=> {
        if (results) {
            var sendPayload = JSON.stringify({
                type: MeetingPayloadEnum.ANSWER_SDP,
                data: {
                    userId,
                    name,
                    ...payload.data
                }
            });

            meetingServer.to(results.socketId).emit('message', sendPayload)
        }
    })
}

function userLeft(meetingId, socket, meetingServer, payload) {
    const { userId } = payload.data;

    broadcastUsers(meetingId, socket, meetingServer, {
        type: MeetingPayloadEnum.USER_LEFT,
        data: {
            userId: userId
        }
    });

}

function endMeeting(meetingId, socket, meetingServer, payload) {
    const { userId } = payload.data;

    broadcastUsers(meetingId, socket, meetingServer, {
        type: MeetingPayloadEnum.MEETING_ENDED,
        data: {
            userId: userId
        }
    });

    meetingService.getAllMeetingUsers(meetingId, (error, results)=> {
        for (let i = 0; i < results.length; i++) {
            const meetingUser = array[i];
            meetingServer.socket.connected[meetingUser.socketId].disconnect();
            
        }
    })

}


function forwardEvent(meetingId, socket, meetingServer, payload) {
    const { userId } = payload.data;

    broadcastUsers(meetingId, socket, meetingServer, {
        type: payload.type,
        data: {
            userId: userId,
            ...payload.data,
        }
    });

}

function addUser(socket, {meetingId, userId, name}) {
    let promise = new Promise(function (resolve, reject) {
        meetingService.getAllMeetingUsers({meetingId, userId}, (error, results) => {
            if(!results) {
                var model = {
                    socketId: socket.id,
                    meetingId: meetingId,
                    userId: userId,
                    joined: true,
                    name: name,
                    isAlive: true
                };

                meetingService.joinMeeting( model, (error, results) => {
                    if (results) {
                        resolve(true);
                    }
                    if (error) {
                        reject(error)
                    }
                });
            }
            else{
                meetingService.updateMeetingUser({
                    userId: userId,
                    socketId: socket.id,
                }, (error, results) => {
                    if (results) {
                        resolve(true)
                    }
                    if (error) {
                        reject(error);
                    }
                });
            }
        });
    });
    return promise;
}

function sendMessage(socket, payload){
    socket.send(JSON.stringify(payload));
}

function broadcastUsers(meetingId, socket, meetingServer, payload){
    socket.broadcast.emit("message", JSON.stringify(payload));
}

module.exports = {
    joinMeeting,
    forwardConnectionRequest,
    forwardIceCandidate,
    forwardOfferSDP,
    forwardAnswerSDP,
    userLeft,
    endMeeting,
    forwardEvent,
}