const Review = require('../models/Review');
const Order = require('../models/Order');

// @desc    Get all published reviews (Public/User)
// @route   GET /api/reviews
// @access  Public
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isPublished: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews/admin
// @access  Private/Admin
const getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('orderId', 'totalAmount items')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};

// @desc    Create a new review
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    
    // Verify order exists and belongs to user
    const order = await Order.findById(orderId);
    if (!order || order.user.toString() !== req.user._id.toString()) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    // Verify order is delivered
    if (order.orderStatus !== 'Delivered') {
      return res.status(400).json({ message: 'You can only review delivered orders' });
    }

    // Verify not already reviewed
    const existing = await Review.findOne({ orderId });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this order' });
    }

    const review = await Review.create({
      user: req.user._id,
      orderId,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit review' });
  }
};

// @desc    Toggle review visibility (Admin)
// @route   PUT /api/reviews/:id/toggle
// @access  Private/Admin
const toggleReviewStatus = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    review.isPublished = !review.isPublished;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update review status' });
  }
};

module.exports = { getReviews, getAdminReviews, createReview, toggleReviewStatus };
