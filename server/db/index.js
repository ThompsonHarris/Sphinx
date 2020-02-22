//DATABASE && MODELS
const db = require('./db');
const User = require('./models/users');
const Message = require('./models/messages');
const Session = require('./models/sessions');
const Channel = require('./models/channels');
const ChannelUser = require('./models/channelUser');

//Associations
// - No Associations yet

//User
User.hasMany(Message);
Message.belongsTo(User);

//Sessions
Session.hasOne(User);
User.belongsTo(Session);

//Message
Message.belongsTo(Channel);
Channel.hasMany(Message);

//Channel
User.hasMany(Channel);
Channel.belongsTo(User);

//ChannelUser
User.hasMany(ChannelUser);
Channel.hasMany(ChannelUser);

module.exports = {
  db,
  models: {
    User,
    Message,
    Session,
    Channel,
    ChannelUser,
  },
};