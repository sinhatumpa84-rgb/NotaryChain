const mongoose = require('mongoose');

const faceEmbeddingSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  image_url: {
    type: String,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true, collection: 'face_embeddings' });

module.exports = mongoose.model('FaceEmbedding', faceEmbeddingSchema);
