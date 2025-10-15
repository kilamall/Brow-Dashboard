import { useState, useEffect } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { format } from 'date-fns';

interface Review {
  id: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  serviceName?: string;
  createdAt: any;
  isApproved?: boolean;
}

export default function Reviews() {
  const { db } = useFirebase();
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: '',
    serviceName: ''
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setFormData(prev => ({
          ...prev,
          name: currentUser.displayName || '',
          email: currentUser.email || ''
        }));
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Fetch approved reviews
  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const reviewsData = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Review))
          .filter(review => review.isApproved !== false); // Show approved reviews or reviews without approval status
        
        setReviews(reviewsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching reviews:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.comment) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        ...formData,
        createdAt: serverTimestamp(),
        isApproved: false // Reviews need approval before showing
      });

      setFormData({
        name: '',
        email: '',
        rating: 5,
        comment: '',
        serviceName: ''
      });
      setShowForm(false);
      alert('Thank you for your review! It will be published after approval.');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error submitting review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-2xl ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-slate-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl text-terracotta mb-4">Client Reviews</h1>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          See what our amazing clients have to say about their experience at Bueno Brows
        </p>
      </div>

      {/* Stats */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-terracotta mb-2">{reviews.length}</div>
              <div className="text-slate-600">Total Reviews</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-terracotta mb-2">
                {(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)}
              </div>
              <div className="text-slate-600">Average Rating</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-terracotta mb-2">
                {renderStars(Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length))}
              </div>
              <div className="text-slate-600">Overall Rating</div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Grid */}
      {reviews.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-soft p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {renderStars(review.rating)}
                </div>
                <div className="text-sm text-slate-500">
                  {review.createdAt && format(review.createdAt.toDate(), 'MMM d, yyyy')}
                </div>
              </div>
              
              <blockquote className="text-slate-700 mb-4 italic">
                "{review.comment}"
              </blockquote>
              
              <div className="border-t pt-4">
                <div className="font-medium text-slate-900">
                  {review.customerName}
                </div>
                {review.serviceName && (
                  <div className="text-sm text-slate-500">
                    {review.serviceName}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⭐</div>
          <h3 className="text-xl font-medium text-slate-700 mb-2">No reviews yet</h3>
          <p className="text-slate-500">Be the first to share your experience!</p>
        </div>
      )}

      {/* Write Review Button */}
      <div className="text-center">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="bg-terracotta text-white px-8 py-3 rounded-lg hover:bg-terracotta/90 transition-colors font-medium"
          >
            Write a Review
          </button>
        ) : (
          <div className="bg-white rounded-xl shadow-soft p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-medium mb-4">Share Your Experience</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Service (Optional)
                </label>
                <input
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
                  placeholder="e.g., Brow Fill, Lash Extensions"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
                      className={`text-2xl ${
                        i < formData.rating ? 'text-yellow-400' : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Your Review *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.comment}
                  onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Tell us about your experience..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-terracotta text-white px-6 py-2 rounded-lg hover:bg-terracotta/90 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

