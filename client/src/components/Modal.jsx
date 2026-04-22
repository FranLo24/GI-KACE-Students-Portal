export default function Modal({ title, message, onConfirm, onClose, showCancel = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm">
      <div className="glass-panel animate-rise-in w-full max-w-md overflow-hidden p-6">
        <div className="mb-5 space-y-2">
          {title && <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>}
          {message && <p className="text-sm text-slate-600">{message}</p>}
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          {showCancel && (
            <button onClick={onClose} className="portal-button-secondary">
              Cancel
            </button>
          )}
          {onConfirm ? (
            <button onClick={onConfirm} className="portal-button-primary">
              Confirm
            </button>
          ) : (
            <button onClick={onClose} className="portal-button-primary">
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
