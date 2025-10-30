import { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebase } from '@buenobrows/shared/useFirebase';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

interface TrainingStats {
  messagesAnalyzed: number;
  tone: string;
  avgLength: number;
  version: string;
  lastTrained?: Date;
}

interface FlaggedMessage {
  id: string;
  customerName: string;
  customerPhone?: string;
  message: string;
  topic: string;
  reason: string;
  timestamp: any;
  autoResponse: string;
}

export default function AITrainingPanel() {
  const { db } = useFirebase();
  const [training, setTraining] = useState(false);
  const [trainingStats, setTrainingStats] = useState<TrainingStats | null>(null);
  const [flaggedMessages, setFlaggedMessages] = useState<FlaggedMessage[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingFlagged, setLoadingFlagged] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string; uploadedAt: Date }[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // Load current training stats
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'ai_training'),
      (snapshot) => {
        snapshot.forEach((doc) => {
          if (doc.id === 'current_prompt') {
            const data = doc.data();
            setTrainingStats({
              messagesAnalyzed: data.messageCount || 0,
              tone: data.styleProfile?.tone || 'unknown',
              avgLength: data.styleProfile?.avgLength || 0,
              version: data.version || 'none',
              lastTrained: data.createdAt?.toDate?.() || null
            });
          }
        });
      }
    );

    return () => unsubscribe();
  }, [db]);

  // Load flagged messages
  useEffect(() => {
    const functions = getFunctions();
    const getFlagged = httpsCallable(functions, 'getFlaggedMessages');
    
    setLoadingFlagged(true);
    getFlagged()
      .then((result: any) => {
        setFlaggedMessages(result.data.messages || []);
      })
      .catch((err) => {
        console.error('Failed to load flagged messages:', err);
      })
      .finally(() => {
        setLoadingFlagged(false);
      });
  }, []);

  const handleTrain = async () => {
    setTraining(true);
    setError('');
    setSuccess('');

    try {
      const functions = getFunctions();
      const trainAI = httpsCallable(functions, 'trainAIFromAdminMessages');
      
      const result = await trainAI({ monthsBack: 3 }) as { data: { success: boolean; stats: TrainingStats; message: string } };
      
      if (result.data.success) {
        setSuccess(`AI trained successfully! Analyzed ${result.data.stats.messagesAnalyzed} messages. Tone: ${result.data.stats.tone}`);
        setTrainingStats(result.data.stats);
      }
    } catch (err: any) {
      console.error('Training error:', err);
      setError(err.message || 'Failed to train AI');
    } finally {
      setTraining(false);
    }
  };

  const handleMarkReviewed = async (messageId: string) => {
    try {
      const functions = getFunctions();
      const markReviewed = httpsCallable(functions, 'markMessageReviewed');
      
      await markReviewed({ messageId });
      
      // Remove from list
      setFlaggedMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (err: any) {
      console.error('Failed to mark as reviewed:', err);
      setError('Failed to mark message as reviewed');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError('');
    setSuccess('');
    try {
      const storage = getStorage();
      const path = `ai_training/manual/${Date.now()}-${file.name}`;
      const ref = storageRef(storage, path);
      await uploadBytes(ref, file, { contentType: file.type || 'application/octet-stream' });
      const url = await getDownloadURL(ref);
      await addDoc(collection(db, 'ai_training_uploads'), {
        name: file.name,
        path,
        url,
        type: file.type,
        size: file.size,
        uploadedAt: serverTimestamp(),
      });
      setUploadedFiles(prev => [{ name: file.name, url, uploadedAt: new Date() }, ...prev]);
      setFile(null);
      setSuccess('Training material uploaded successfully.');
    } catch (e: any) {
      console.error('Upload failed:', e);
      setError(e.message || 'Failed to upload training material');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Messaging Training</h2>
        <p className="text-sm text-gray-600">
          Train the AI to respond to customer messages in your style based on your past SMS conversations.
        </p>
      </div>

      {/* Manual Training Materials Upload */}
      <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-2">Upload Training Materials (PDF or ZIP)</h3>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full">
            <label htmlFor="ai-training-upload" className="block text-sm font-medium text-slate-700 mb-1">Select file</label>
            <input
              id="ai-training-upload"
              name="ai-training-upload"
              type="file"
              accept=".pdf,.zip,application/pdf,application/zip,application/x-zip-compressed"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-4 py-2 bg-slate-800 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2">Supported: .pdf, .zip. Files are stored under ai_training/manual/ and can be referenced for future retraining.</p>
      </div>

      {/* Training Stats */}
      {trainingStats && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Current AI Training</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-blue-600 font-medium">Messages Analyzed</p>
              <p className="text-blue-900 font-bold text-lg">{trainingStats.messagesAnalyzed}</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Tone</p>
              <p className="text-blue-900 font-bold text-lg capitalize">{trainingStats.tone}</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Avg Length</p>
              <p className="text-blue-900 font-bold text-lg">{trainingStats.avgLength} chars</p>
            </div>
            <div>
              <p className="text-blue-600 font-medium">Last Trained</p>
              <p className="text-blue-900 font-bold text-sm">
                {trainingStats.lastTrained 
                  ? new Date(trainingStats.lastTrained).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>
          <p className="text-xs text-blue-600 mt-2">
            Version: {trainingStats.version}
          </p>
        </div>
      )}

      {/* Train Button */}
      <div className="mb-6">
        <button
          onClick={handleTrain}
          disabled={training}
          className="px-6 py-3 bg-terracotta hover:bg-terracotta/90 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {training ? '🔄 Training AI...' : '🤖 Train AI on My Messages'}
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Analyzes your SMS messages from the last 3 months. Auto-retrains quarterly.
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">✅ {success}</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Recently Uploaded Materials */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-gray-900 mb-2">Recently Uploaded</h4>
          <ul className="text-sm list-disc list-inside text-slate-700 space-y-1">
            {uploadedFiles.map((f, i) => (
              <li key={i}>
                <a className="text-terracotta underline" href={f.url} target="_blank" rel="noreferrer">{f.name}</a>
                <span className="text-xs text-slate-500 ml-2">{f.uploadedAt.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Flagged Messages */}
      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          🚩 Flagged Messages for Review
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({flaggedMessages.length} unreviewed)
          </span>
        </h3>

        {loadingFlagged ? (
          <p className="text-gray-500">Loading flagged messages...</p>
        ) : flaggedMessages.length === 0 ? (
          <p className="text-gray-500 italic">No messages flagged for review</p>
        ) : (
          <div className="space-y-4">
            {flaggedMessages.map((msg) => (
              <div key={msg.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{msg.customerName}</p>
                    {msg.customerPhone && (
                      <p className="text-sm text-gray-600">{msg.customerPhone}</p>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 text-xs font-medium rounded">
                    {msg.topic}
                  </span>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700 font-medium mb-1">Customer Message:</p>
                  <p className="text-sm text-gray-900 bg-white p-2 rounded border border-gray-200">
                    "{msg.message}"
                  </p>
                </div>

                <div className="mb-3">
                  <p className="text-sm text-gray-700 font-medium mb-1">AI Response Sent:</p>
                  <p className="text-sm text-gray-900 bg-white p-2 rounded border border-gray-200">
                    "{msg.autoResponse}"
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    {msg.timestamp?.toDate?.()?.toLocaleString() || 'Unknown time'}
                  </p>
                  <button
                    onClick={() => handleMarkReviewed(msg.id)}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    ✓ Mark Reviewed
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">How It Works</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>AI learns from your past SMS conversations</li>
          <li>Matches your tone, style, and common phrases</li>
          <li>Handles appointments, pricing, hours, and services</li>
          <li>Flags out-of-scope questions for your review</li>
          <li>Auto-retrains every 3 months with new conversations</li>
        </ul>
      </div>
    </div>
  );
}

