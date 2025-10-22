import { useState, useEffect } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

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
      <div className="text-center mb-12">
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
                  <label htmlFor="review-name" className="block text-sm font-medium text-slate-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    id="review-name"
                    name="review-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label htmlFor="review-email" className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    id="review-email"
                    name="review-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="review-service" className="block text-sm font-medium text-slate-700 mb-1">
                  Service (Optional)
                </label>
                <input
                  id="review-service"
                  name="review-service"
                  type="text"
                  value={formData.serviceName}
                  onChange={(e) => setFormData(prev => ({ ...prev, serviceName: e.target.value }))}
                  placeholder="e.g., Brow Fill, Lash Extensions"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="review-rating-1" className="block text-sm font-medium text-slate-700 mb-1">
                  Rating
                </label>
                <div className="flex items-center gap-1" role="group" aria-label="Rating">
                  {Array.from({ length: 5 }, (_, i) => (
                    <button
                      key={i}
                      id={`review-rating-${i + 1}`}
                      name={`review-rating-${i + 1}`}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
                      className={`text-2xl ${
                        i < formData.rating ? 'text-yellow-400' : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors`}
                      aria-label={`Rate ${i + 1} stars`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="review-comment" className="block text-sm font-medium text-slate-700 mb-1">
                  Your Review *
                </label>
                <textarea
                  id="review-comment"
                  name="review-comment"
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

      {/* Call to Action Section */}
      <div className="mt-12 bg-gradient-to-br from-terracotta to-terracotta/80 rounded-xl shadow-soft p-8 md:p-12 text-center text-white">
        <h2 className="font-serif text-2xl md:text-3xl mb-4">Experience It for Yourself</h2>
        <p className="text-white/90 mb-6 md:mb-8 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
          Join our satisfied clients and discover why they love Bueno Brows. Book your appointment today!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/book" 
            className="inline-flex items-center justify-center gap-2 bg-white text-terracotta rounded-lg px-8 py-4 hover:bg-slate-50 transition-all hover:scale-105 font-semibold text-base md:text-lg shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Your Appointment
          </Link>
          <Link 
            to="/services" 
            className="inline-flex items-center justify-center gap-2 border-2 border-white text-white rounded-lg px-8 py-4 hover:bg-white/10 transition-all font-semibold text-base md:text-lg"
          >
            Explore Our Services
          </Link>
        </div>
        
        {/* Quick Links */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <Link to="/" className="text-white/90 hover:text-white transition-colors">Home</Link>
            <span className="text-white/40">•</span>
            <Link to="/services" className="text-white/90 hover:text-white transition-colors">Services</Link>
            <span className="text-white/40">•</span>
            <Link to="/skin-analysis" className="text-white/90 hover:text-white transition-colors">AI Skin Analysis</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

