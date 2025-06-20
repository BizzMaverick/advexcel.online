import React, { useState } from 'react';
import { X, Star, Heart, ThumbsUp, MessageSquare } from 'lucide-react';

interface RatingModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmitRating: (rating: RatingData) => void;
}

interface RatingData {
  stars: number;
  feedback: string;
  category: string;
  wouldRecommend: boolean;
}

export const RatingModal: React.FC<RatingModalProps> = ({ isVisible, onClose, onSubmitRating }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState('overall');
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    { value: 'overall', label: 'Overall Experience' },
    { value: 'ease-of-use', label: 'Ease of Use' },
    { value: 'features', label: 'Features & Functionality' },
    { value: 'performance', label: 'Performance' },
    { value: 'design', label: 'Design & Interface' },
    { value: 'privacy', label: 'Privacy & Security' }
  ];

  const ratingLabels = [
    '', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'
  ];

  const handleSubmit = () => {
    if (rating === 0) return;

    const ratingData: RatingData = {
      stars: rating,
      feedback,
      category,
      wouldRecommend
    };

    onSubmitRating(ratingData);
    setIsSubmitted(true);

    // Auto close after 2 seconds
    setTimeout(() => {
      onClose();
      // Reset form
      setRating(0);
      setHoveredRating(0);
      setFeedback('');
      setCategory('overall');
      setWouldRecommend(true);
      setIsSubmitted(false);
    }, 2000);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Heart className="h-6 w-6 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Rate Your Experience</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!isSubmitted ? (
            <div className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What would you like to rate?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Star Rating */}
              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 mb-4">
                  How would you rate Excel Analyzer Pro?
                </p>
                <div className="flex justify-center space-x-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-all duration-200 transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {(hoveredRating || rating) > 0 && (
                  <p className="text-sm text-gray-600 font-medium">
                    {ratingLabels[hoveredRating || rating]}
                  </p>
                )}
              </div>

              {/* Recommendation */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Would you recommend Excel Analyzer Pro to others?
                </p>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recommend"
                      checked={wouldRecommend === true}
                      onChange={() => setWouldRecommend(true)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">Yes, definitely!</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recommend"
                      checked={wouldRecommend === false}
                      onChange={() => setWouldRecommend(false)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Not really</span>
                  </label>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell us more about your experience (optional)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What did you like? What could be improved?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Star className="h-5 w-5" />
                <span>Submit Rating</span>
              </button>

              {/* Skip Option */}
              <button
                onClick={onClose}
                className="w-full text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Maybe later
              </button>
            </div>
          ) : (
            /* Thank You Message */
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-gray-600 mb-4">
                Your feedback helps us improve Excel Analyzer Pro for everyone.
              </p>
              <div className="flex justify-center space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {rating >= 4 ? '🎉 We\'re thrilled you love it!' : 'We\'ll work on making it even better!'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};