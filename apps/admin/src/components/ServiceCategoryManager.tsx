import React, { useState, useEffect } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { 
  createServiceCategory, 
  updateServiceCategory, 
  deleteServiceCategory, 
  watchServiceCategories 
} from '@buenobrows/shared/firestoreActions';
import type { ServiceCategory } from '@buenobrows/shared/types';

interface Props {
  onClose: () => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7', // Violet
];

export default function ServiceCategoryManager({ onClose }: Props) {
  const { db } = useFirebase();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    color: PRESET_COLORS[0],
    description: '',
    active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = watchServiceCategories(db, setCategories);
    return unsubscribe;
  }, [db]);

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await createServiceCategory(db, newCategory);
      setNewCategory({ name: '', color: PRESET_COLORS[0], description: '', active: true });
      setShowAddForm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await updateServiceCategory(db, editingCategory.id, {
        name: editingCategory.name,
        color: editingCategory.color,
        description: editingCategory.description,
        active: editingCategory.active
      });
      setEditingCategory(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      await deleteServiceCategory(db, id);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-terracotta to-terracotta/90 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold">Service Categories</h2>
            <p className="text-terracotta-100 text-sm mt-1">
              Manage service categories with custom colors for scheduling
            </p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Add New Category Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              disabled={loading}
              className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50"
            >
              + Add New Category
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Add Category Form */}
          {showAddForm && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-lg text-slate-800 mb-4">Add New Category</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    placeholder="e.g., Brow Services, Lash Services"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Color *</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                      className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewCategory({ ...newCategory, color })}
                          className={`w-8 h-8 rounded-lg border-2 ${
                            newCategory.color === color ? 'border-slate-400' : 'border-slate-200'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    rows={2}
                    placeholder="Optional description for this category"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={newCategory.active}
                    onChange={(e) => setNewCategory({ ...newCategory, active: e.target.checked })}
                    className="w-4 h-4 text-terracotta border-slate-300 rounded focus:ring-terracotta"
                  />
                  <label htmlFor="active" className="text-sm text-slate-700">
                    Active (can be used for new services)
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleCreateCategory}
                    disabled={loading || !newCategory.name.trim()}
                    className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Category'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewCategory({ name: '', color: PRESET_COLORS[0], description: '', active: true });
                      setError('');
                    }}
                    disabled={loading}
                    className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Category Form */}
          {editingCategory && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="font-semibold text-lg text-slate-800 mb-4">Edit Category</h3>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Color *</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={editingCategory.color}
                      onChange={(e) => setEditingCategory({ ...editingCategory, color: e.target.value })}
                      className="w-12 h-12 border border-slate-300 rounded-lg cursor-pointer"
                    />
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditingCategory({ ...editingCategory, color })}
                          className={`w-8 h-8 rounded-lg border-2 ${
                            editingCategory.color === color ? 'border-slate-400' : 'border-slate-200'
                          }`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    value={editingCategory.description || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-terracotta focus:border-transparent"
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={editingCategory.active}
                    onChange={(e) => setEditingCategory({ ...editingCategory, active: e.target.checked })}
                    className="w-4 h-4 text-terracotta border-slate-300 rounded focus:ring-terracotta"
                  />
                  <label htmlFor="edit-active" className="text-sm text-slate-700">
                    Active (can be used for new services)
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateCategory}
                    disabled={loading || !editingCategory.name.trim()}
                    className="bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Category'}
                  </button>
                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setError('');
                    }}
                    disabled={loading}
                    className="border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg text-slate-800">Current Categories</h3>
            {categories.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <div className="text-5xl mb-3">🏷️</div>
                <div className="text-base font-medium mb-1">No categories yet</div>
                <div className="text-sm text-slate-400">
                  Create your first service category to organize your services
                </div>
              </div>
            ) : (
              <div className="grid gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Color Preview */}
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-slate-200"
                          style={{ backgroundColor: category.color }}
                        />
                        
                        {/* Category Info */}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-slate-800">{category.name}</h4>
                            {!category.active && (
                              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                Inactive
                              </span>
                            )}
                          </div>
                          {category.description && (
                            <p className="text-sm text-slate-600">{category.description}</p>
                          )}
                          <p className="text-xs text-slate-500 mt-1">
                            Color: {category.color}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCategory(category)}
                          disabled={loading}
                          className="text-blue-600 hover:text-blue-700 p-2 transition-colors disabled:opacity-50"
                          title="Edit category"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          disabled={loading}
                          className="text-red-600 hover:text-red-700 p-2 transition-colors disabled:opacity-50"
                          title="Delete category"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

