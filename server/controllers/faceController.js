const axios = require('axios');
const User = require('../models/User');
const resU = require('../utils/apiResponse');
const tokenService = require('../services/tokenService');
const Session = require('../models/Session');
const LoginHistory = require('../models/LoginHistory');

const AI_FACE_SERVICE_URL = process.env.AI_FACE_SERVICE_URL || 'http://localhost:8000';

/**
 * Register Face Template for Logged-in User
 */
exports.registerFace = async (req, res, next) => {
  try {
    const { imageBase64, imageUrl } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Webcam image base64 data is required' });
    }

    const userId = req.user._id.toString();
    const name = `${req.user.firstName} ${req.user.lastName}`.trim() || req.user.email;

    // Call Python AI Microservice
    const pyResponse = await axios.post(`${AI_FACE_SERVICE_URL}/api/v1/register`, {
      user_id: userId,
      name,
      image_base64: imageBase64,
      image_url: imageUrl || null,
    });

    return resU.success(res, pyResponse.data, 'Face ID registered successfully!');
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
};

/**
 * Recognize Face & Log In User
 */
exports.recognizeAndLogin = async (req, res, next) => {
  try {
    const { imageBase64, threshold } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'Webcam image base64 data is required' });
    }

    // Call Python AI Microservice for Cosine Similarity Matching
    const pyResponse = await axios.post(`${AI_FACE_SERVICE_URL}/api/v1/recognize`, {
      image_base64: imageBase64,
      threshold: threshold || 0.60,
    });

    const result = pyResponse.data;

    if (!result.authenticated || !result.user_id) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        message: result.message || 'Unknown Person. Face similarity below threshold.',
        similarityScore: result.similarity_score,
      });
    }

    // Find matched user in MongoDB
    const user = await User.findById(result.user_id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Account not active or user not found' });
    }

    // Issue JWT Token Pair for seamless Face ID Login
    const tokens = tokenService.generateTokenPair(user._id);

    // Save session & login history
    try {
      await Session.create({
        userId: user._id,
        token: tokenService.hashToken(tokens.refreshToken),
        ...req.deviceInfo
      });
      await LoginHistory.create({ userId: user._id, status: 'success', ...req.deviceInfo });
    } catch (e) {
      console.error('Session logging error:', e);
    }

    const sanitizedUser = require('../utils/helpers').sanitizeUser(user);

    return resU.success(res, {
      user: sanitizedUser,
      tokens,
      faceMatch: {
        similarityScore: result.similarity_score,
        confidencePercentage: result.confidence_percentage,
      }
    }, `Welcome back, ${user.firstName}! Face ID verified.`);

  } catch (err) {
    if (err.response) {
      return res.status(err.response.status || 500).json(err.response.data);
    }
    next(err);
  }
};

/**
 * Get Face Status for Current User
 */
exports.getFaceStatus = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const pyResponse = await axios.get(`${AI_FACE_SERVICE_URL}/api/v1/users/${userId}`);
    return resU.success(res, pyResponse.data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return resU.success(res, { registered: false });
    }
    next(err);
  }
};

/**
 * Delete Face Registration
 */
exports.deleteFace = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const pyResponse = await axios.delete(`${AI_FACE_SERVICE_URL}/api/v1/users/${userId}`);
    return resU.success(res, pyResponse.data, 'Face ID template deleted');
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    next(err);
  }
};
