export default function ConfirmationModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl p-4">
        <p className="text-sm">{message}</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="border rounded px-3 py-2">Cancel</button>
          <button onClick={onConfirm} className="bg-amber-500 text-white rounded px-3 py-2">Confirm</button>
        </div>
      </div>
    </div>
  );
}

