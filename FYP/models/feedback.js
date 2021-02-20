const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FeedbackSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  username:{
    type: String
  },
  eventId:{
    type: Schema.Types.ObjectId,
    ref: 'Event',
  },
  feedback:{
    type: String,
    require: true
  }
});

module.exports = mongoose.model('feedback', FeedbackSchema);

