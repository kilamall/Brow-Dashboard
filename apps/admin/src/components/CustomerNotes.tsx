import React, { useState } from 'react';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { addCustomerNote, updateCustomerNote, deleteCustomerNote } from '@buenobrows/shared/firestoreActions';
import type { Customer } from '@buenobrows/shared/types';
import { format } from 'date-fns';

interface CustomerNotesProps {
  customer: Customer;
  onUpdate: () => void;
}

type NoteCategory = 'general' | 'preferences' | 'allergies' | 'history' | 'special_requests';

const categoryLabels: Record<NoteCategory, string> = {
  general: 'General',
  preferences: 'Preferences',
  allergies: 'Allergies',
  history: 'History',
  special_requests: 'Special Requests'
};

const categoryColors: Record<NoteCategory, string> = {
  general: 'bg-blue-100 text-blue-800 border-blue-200',
  preferences: 'bg-purple-100 text-purple-800 border-purple-200',
  allergies: 'bg-red-100 text-red-800 border-red-200',
  history: 'bg-green-100 text-green-800 border-green-200',
  special_requests: 'bg-orange-100 text-orange-800 border-orange-200'
};

export default function CustomerNotes({ customer, onUpdate }: CustomerNotesProps) {
  const { db, auth } = useFirebase();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newNote, setNewNote] = useState({
    category: 'general' as NoteCategory,
    content: ''
  });

  const [editNote, setEditNote] = useState({
    category: 'general' as NoteCategory,
    content: ''
  });

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.content.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      await addCustomerNote(db, customer.id, {
        category: newNote.category,
        content: newNote.content.trim(),
        addedBy: auth.currentUser?.uid || 'unknown'
      });

      setNewNote({ category: 'general', content: '' });
      setShowAddForm(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to add note');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editNote.content.trim()) return;

    try {
      setLoading(true);
      setError(null);
      
      await updateCustomerNote(db, customer.id, noteId, {
        category: editNote.category,
        content: editNote.content.trim()
      });

      setEditingNoteId(null);
      setEditNote({ category: 'general', content: '' });
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to update note');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      setLoading(true);
      setError(null);
      
      await deleteCustomerNote(db, customer.id, noteId);
      onUpdate();
    } catch (err: any) {
      setError(err.message || 'Failed to delete note');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (note: any) => {
    setEditingNoteId(note.id);
    setEditNote({
      category: note.category,
      content: note.content
    });
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditNote({ category: 'general', content: '' });
  };

  // Function to get admin display name from UID
  const getAdminDisplayName = (uid: string) => {
    // If it's the current user, use their display name
    if (auth.currentUser?.uid === uid) {
      return auth.currentUser?.displayName || 'Admin';
    }
    // For other admins, we could fetch from a users collection or return a fallback
    // For now, return a generic admin name
    return 'Admin';
  };

  const notes = customer.structuredNotes || [];

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl">Admin Notes</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Note
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Add Note Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h3 className="font-medium mb-3">Add New Note</h3>
          <form onSubmit={handleAddNote} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={newNote.category}
                onChange={(e) => setNewNote({ ...newNote, category: e.target.value as NoteCategory })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Note Content
              </label>
              <textarea
                value={newNote.content}
                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                placeholder="Enter note content..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading || !newNote.content.trim()}
                className="px-4 py-2 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Note'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>No notes added yet</p>
          <p className="text-sm">Click "Add Note" to add the first note</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="border border-slate-200 rounded-lg p-4">
              {editingNoteId === note.id ? (
                // Edit Form
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editNote.category}
                      onChange={(e) => setEditNote({ ...editNote, category: e.target.value as NoteCategory })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                    >
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Note Content
                    </label>
                    <textarea
                      value={editNote.content}
                      onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-terracotta focus:border-terracotta"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEditNote(note.id)}
                      disabled={loading || !editNote.content.trim()}
                      className="px-3 py-1 bg-terracotta text-white rounded-lg hover:bg-terracotta/90 transition-colors disabled:opacity-50 text-sm"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 text-slate-600 hover:text-slate-800 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // Display Note
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[note.category]}`}>
                        {categoryLabels[note.category]}
                      </span>
                      <span className="text-xs text-slate-500">
                        {format(new Date(note.addedAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditing(note)}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Edit note"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete note"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="text-slate-800 whitespace-pre-wrap">
                    {note.content}
                  </div>
                  <div className="text-xs text-slate-500 mt-2">
                    Added by: {getAdminDisplayName(note.addedBy)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

