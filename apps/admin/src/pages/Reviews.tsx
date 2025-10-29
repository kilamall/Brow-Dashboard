import { useState, useEffect } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { collection, query, orderBy, onSnapshot, updateDoc, deleteDoc, doc } from 'firebase/firestore';
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
  isFeatured?: boolean;
}

export default function Reviews() {
  const { db } = useFirebase();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'reviews'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const reviewsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Review));
        
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

  const filteredReviews = reviews.filter(review => {
    if (filter === 'pending') return review.isApproved === false;
    if (filter === 'approved') return review.isApproved === true;
    if (filter === 'featured') return review.isApproved === true && review.isFeatured === true;
    return true;
  });

  const handleApprove = async (reviewId: string) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        isApproved: true
      });
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Error approving review');
    }
  };

  const handleReject = async (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteDoc(doc(db, 'reviews', reviewId));
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Error deleting review');
      }
    }
  };

  const handleToggleFeatured = async (reviewId: string, currentFeaturedStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'reviews', reviewId), {
        isFeatured: !currentFeaturedStatus
      });
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert('Error updating featured status');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const getStatusBadge = (review: Review) => {
    if (review.isApproved === true && review.isFeatured === true) {
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Featured</span>;
    } else if (review.isApproved === true) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Approved</span>;
    } else if (review.isApproved === false) {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Pending</span>;
    } else {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">New</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-slate-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Reviews</h1>
          <p className="text-slate-600">Manage and moderate customer reviews</p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-6 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{reviews.length}</div>
            <div className="text-slate-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{reviews.filter(r => r.isApproved === false).length}</div>
            <div className="text-slate-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{reviews.filter(r => r.isApproved === true).length}</div>
            <div className="text-slate-600">Approved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{reviews.filter(r => r.isApproved === true && r.isFeatured === true).length}</div>
            <div className="text-slate-600">Featured</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'all' 
              ? 'bg-terracotta text-white' 
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          All Reviews
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'pending' 
              ? 'bg-terracotta text-white' 
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          Pending ({reviews.filter(r => r.isApproved === false).length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'approved' 
              ? 'bg-terracotta text-white' 
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          Approved ({reviews.filter(r => r.isApproved === true).length})
        </button>
        <button
          onClick={() => setFilter('featured')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            filter === 'featured' 
              ? 'bg-terracotta text-white' 
              : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
          }`}
        >
          Featured ({reviews.filter(r => r.isApproved === true && r.isFeatured === true).length})
        </button>
      </div>

      {/* Reviews List */}
      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-slate-700 mb-2">
            {filter === 'pending' ? 'No pending reviews' : 
             filter === 'approved' ? 'No approved reviews' : 
             filter === 'featured' ? 'No featured reviews' : 'No reviews yet'}
          </h3>
          <p className="text-slate-500">
            {filter === 'pending' ? 'All reviews have been processed' : 
             filter === 'featured' ? 'No reviews are currently featured on the homepage' : 'Customer reviews will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="divide-y divide-slate-200">
            {filteredReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-slate-900">{review.customerName}</h3>
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                      {getStatusBadge(review)}
                    </div>
                    
                    {review.serviceName && (
                      <p className="text-sm text-slate-600 mb-2">
                        Service: <span className="font-medium">{review.serviceName}</span>
                      </p>
                    )}
                    
                    <blockquote className="text-slate-700 italic mb-3">
                      "{review.comment}"
                    </blockquote>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span>{review.customerEmail}</span>
                      <span>•</span>
                      <span>
                        {review.createdAt && format(review.createdAt.toDate(), 'MMM d, yyyy \'at\' h:mm a')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {review.isApproved !== true && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {review.isApproved === true && (
                      <button
                        onClick={() => handleToggleFeatured(review.id, review.isFeatured || false)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          review.isFeatured 
                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        }`}
                      >
                        {review.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                    )}
                    <button
                      onClick={() => handleReject(review.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      {review.isApproved === true ? 'Delete' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-slate-900">Review Details</h2>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{selectedReview.customerName}</span>
                  <div className="flex items-center">
                    {renderStars(selectedReview.rating)}
                  </div>
                  {getStatusBadge(selectedReview)}
                </div>
                
                {selectedReview.serviceName && (
                  <div>
                    <span className="text-sm font-medium text-slate-600">Service: </span>
                    <span>{selectedReview.serviceName}</span>
                  </div>
                )}
                
                <div>
                  <span className="text-sm font-medium text-slate-600">Email: </span>
                  <span>{selectedReview.customerEmail}</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-slate-600">Date: </span>
                  <span>
                    {selectedReview.createdAt && format(selectedReview.createdAt.toDate(), 'MMM d, yyyy \'at\' h:mm a')}
                  </span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-slate-600">Review: </span>
                  <blockquote className="mt-1 text-slate-700 italic">
                    "{selectedReview.comment}"
                  </blockquote>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t">
                {selectedReview.isApproved !== true && (
                  <button
                    onClick={() => {
                      handleApprove(selectedReview.id);
                      setSelectedReview(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Approve Review
                  </button>
                )}
                {selectedReview.isApproved === true && (
                  <button
                    onClick={() => {
                      handleToggleFeatured(selectedReview.id, selectedReview.isFeatured || false);
                      setSelectedReview(null);
                    }}
                    className={`px-4 py-2 rounded transition-colors ${
                      selectedReview.isFeatured 
                        ? 'bg-purple-600 text-white hover:bg-purple-700' 
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {selectedReview.isFeatured ? 'Unfeature Review' : 'Feature Review'}
                  </button>
                )}
                <button
                  onClick={() => {
                    handleReject(selectedReview.id);
                    setSelectedReview(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  {selectedReview.isApproved === true ? 'Delete Review' : 'Reject Review'}
                </button>
                <button
                  onClick={() => setSelectedReview(null)}
                  className="px-4 py-2 bg-slate-300 text-slate-700 rounded hover:bg-slate-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

