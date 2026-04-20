export default function Modal({ title, message, onConfirm, onClose, showCancel = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
        {title && <h2 className="text-xl font-semibold text-gray-800 mb-3">{title}</h2>}
        {message && <p className="text-gray-600 mb-6">{message}</p>}
        <div className="flex justify-end gap-3">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          )}
          {onConfirm ? (
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Confirm
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
