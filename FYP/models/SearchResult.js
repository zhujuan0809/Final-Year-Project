const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SearchResult = new Schema({
  title: {
    type: String,
    required: true
  },
  venue:{
    type: String,
    required: true
  },
  date:{
    type: String,
    required: true
  },
  time:{
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  EventId:{
    type: Schema.Types.ObjectId,
    required: true
  }
});

module.exports = mongoose.model('Search Result', SearchResult);

