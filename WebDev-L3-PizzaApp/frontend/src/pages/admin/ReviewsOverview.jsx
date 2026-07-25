import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { Card } from '../../components/Card';
import { Loader } from '../../components/Loader';
import { Button } from '../../components/Button';
import { MessageSquare, Star, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewsOverview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const { data } = await api.get('/reviews/admin');
      setReviews(data);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const toggleVisibility = async (id) => {
    try {
      await api.put(`/reviews/${id}/toggle`);
      toast.success('Review visibility updated');
      fetchReviews();
    } catch (err) {
      toast.error('Failed to update review visibility');
    }
  };

  if (loading) return <Loader />;

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-pizza-red" />
          Customer Reviews
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-yellow-50 border-yellow-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-yellow-600 uppercase tracking-wide">Average Rating</p>
            <p className="text-3xl font-extrabold text-yellow-900 mt-1">{avgRating} / 5.0</p>
          </div>
          <Star className="w-10 h-10 text-yellow-400 opacity-50" />
        </Card>
        <Card className="p-6 bg-blue-50 border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-wide">Total Reviews</p>
            <p className="text-3xl font-extrabold text-blue-900 mt-1">{reviews.length}</p>
          </div>
          <MessageSquare className="w-10 h-10 text-blue-400 opacity-50" />
        </Card>
      </div>

      <div className="space-y-4">
        {reviews.map(review => (
          <Card key={review._id} className={`p-6 ${!review.isPublished ? 'opacity-70 bg-gray-50' : ''}`}>
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">{review.user?.name || 'Unknown User'}</span>
                  <span className="text-gray-400 text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
                </div>
                
                <p className="text-gray-700 italic mb-3">"{review.comment || 'No comment provided'}"</p>
                
                <div className="text-sm text-gray-500 flex items-center gap-4">
                  <span>Order: #{review.orderId?._id || 'N/A'}</span>
                  <span>Amount: ₹{review.orderId?.totalAmount || 'N/A'}</span>
                </div>
              </div>
              
              <Button 
                onClick={() => toggleVisibility(review._id)} 
                variant={review.isPublished ? 'outline' : 'secondary'}
                className="flex items-center gap-2 whitespace-nowrap"
              >
                {review.isPublished ? <><EyeOff className="w-4 h-4" /> Hide Review</> : <><Eye className="w-4 h-4" /> Show Review</>}
              </Button>
            </div>
          </Card>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-gray-500 py-8">No reviews submitted yet.</p>
        )}
      </div>
    </div>
  );
};

export default ReviewsOverview;
