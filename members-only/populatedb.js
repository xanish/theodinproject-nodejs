#! /usr/bin/env node

console.log('This script populates some test users and messages to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0-mbdj7.mongodb.net/members_only?retryWrites=true');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return;
}

var async = require('async');
var bcrypt = require('bcryptjs');
var User = require('./models/user');
var Message = require('./models/message');


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var users = [];
var messages = [];

function userCreate(username, password, role, cb) {
    userdetail = { username: username };
    if (role != false) userdetail.role = role;

    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) { cb(err, null); return; }

        userdetail.password = hashedPassword;
        var user = new User(userdetail);

        user.save(function (err) {
            if (err) {
                cb(err, null);
                return;
            }
            console.log('New User: ' + user);
            users.push(user);
            cb(null, users);
        });
    });
}

function messageCreate(title, text, user, cb) {
    messagedetail = {
        title: title,
        text: text,
        user: user,
    };

    var message = new Message(messagedetail);
    message.save(function (err) {
        if (err) {
            cb(err, null);
            return;
        }
        console.log('New Message: ' + message);
        messages.push(message);
        cb(null, messages);
    });
}

function createUsers(cb) {
    async.series([
        function (callback) {
            userCreate('Draven', 'draaven', 'member', callback);
        },
        function (callback) {
            userCreate('Kench', 'R1v3rK!ng4LyF', 'member', callback);
        },
        function (callback) {
            userCreate('Darius', 'n0xu5Ryze', 'member', callback);
        },
        function (callback) {
            userCreate('Lee', 'brindness', 'admin', callback);
        },
        function (callback) {
            userCreate('Thresh', 'und3AdhAr3M', 'guest', callback);
        },
    ],
        // optional callback
        cb);
}

function createMessages(cb) {
    async.parallel([
        function (callback) {
            messageCreate('Who wants some...', 'Draaaaaaven', users[0], callback);
        },
        function (callback) {
            messageCreate('Unbench me', 'Unload the toad!', users[1], callback);
        },
        function (callback) {
            messageCreate('Secret of Garen', 'He likes to wear polka dots', users[2], callback);
        },
        function (callback) {
            messageCreate('Delete', 'Imma delete some messages blindly', users[3], callback);
        },
        function (callback) {
            messageCreate('Poro', 'Want to buy a tough poro next tym I visit demacia', users[2], callback);
        },
    ],
        // optional callback
        cb);
}

async.series([
    createUsers,
    createMessages
],
// Optional callback
function (err, results) {
    if (err) {
        console.log('FINAL ERR: ' + err);
    }
    else {
        console.log('Messages: ' + messages);

    }
    // All done, disconnect from database
    mongoose.connection.close();
});