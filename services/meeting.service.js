const { meeting } = require('../models/meeting.models');
const { meetingUser } = require('../models/meeting-user.model');
const { response } = require('express');

async function getAllMeetingUsers(meetId, callBack) {
    meetingUser.find({meetingId: meetId})
    .then((response) => {
        return callBack(null, response);
    }).catch((error) => {
        return callBack(error);
    });
}

async function startMeeting(params, callback){ 
    const meetingSchema = new meeting(params);
    meetingSchema
    .save()
    .then((response)=> {
        return callback(null, response)
    })
    .catch((error)=> {
        return callback(error)
    });
}

async function joinMeeting(params, callback) {
    const meetingUserModel = new meetingUser(params);

    meetingUserModel
    .save()
    .then( async ( response) => {
            await meeting.findOneAndUpdate({id: params.meetingId}, {$addToSet: {"meetingUsers": meetingUserModel}})
            return callback(null, response);
        })
        .catch((error)=> {
            return callback(error);
        });
    }


async function isMeetingPresent(meetingId, callback) {
    meeting.findById(meetingId)
    .populate("meetingUsers", "MeetingUser")
    .then((response)=> {
        if(!response) callback("Invalied Meeting ID");
        else callback(null, true);
    })
    .catch((error)=> {
        return callback(error, false)
    });
}

async function checkMeetingExists(meetingId, callback) {
    meeting.findById(meetingId)
    .populate("meetingUsers", "MeetingUser")
    .then((response)=> {
        if(!response) callback("Invalied Meeting ID");
        else callback(null, response);
    })
    .catch((error)=> {
        return callback(error, false)
    });
}

async function isMeetingPresent (meetingId, callback) {
    meeting. findById (meetingId)
    .populate("meetingUsers", "MeetingUser")
    .then ((response) => {
    if (!response)
    callback("Invalid Meeting Id");
    else callback(null, true);
}).catch( (error) =>{
    return callback(error, false)
});
}

async function isMeetingExists(meetingId, callback) {
    meeting. findById (meetingId, "hostId, hostName, startTime")
    .populate("meetingUsers", "MeetingUser")
    .then ((response) => {
    if (!response)
    callback("Invalid Meeting Id");
    else callback(null, response);
}).catch( (error) =>{
    return callback(error, false)
});
}
    
async function getMeetingUser (params, callback) {
    const { meetingId, userId } = params;

    meetingUser.find({ meetingId, userId })
    .then((response) => {
        return callback(null, response[0] )
    })
    .catch((error) => {
    return callback(error);
    });
}
async function updateMeetingUser(params, callback){
    meetingUser
    .updateOne({userId: params.userId}, {$set: params}, {new: true})
    .then((response)=> {
        return callback(null, response);
    })
    .catch((error)=> {
        return callback(error);
    })
}

async function getUserBySocketId(params, callback){
    const {meetinId, socketId} = params;

    meetingUser.find({meetinId, socketId})
    .limit(1)
    .then((response)=> {
        return callback(error);
    })
}

module.exports = {
    startMeeting,
    joinMeeting,
    getAllMeetingUsers,
    isMeetingPresent,
    checkMeetingExists,
    getUserBySocketId,
    updateMeetingUser,
    getMeetingUser
};