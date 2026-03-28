export default function Toast({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  const getTypeStyles = (type) => {
    switch (type) {
      case 'success': return { border: '#00C853', icon: '✓' };
      case 'error':   return { border: '#FF4444', icon: '✗' };
      case 'warning': return { border: '#FFBC42', icon: '⚠' };
      case 'info':    return { border: '#00D4A8', icon: 'ℹ' };
      default:        return { border: '#00D4A8', icon: 'ℹ' };
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
      
      {toasts.map((toast) => {
        const { border, icon } = getTypeStyles(toast.type);
        
        return (
          <div
            key={toast.id}
            className="w-full max-w-[320px] p-3 px-4 rounded-[10px] bg-[#111] pointer-events-auto flex items-start gap-3 shadow-xl"
            style={{ 
              borderLeft: `4px solid ${border}`,
              animation: 'slideIn 0.3s ease-out forwards'
            }}
          >
            <span style={{ color: border }} className="text-sm font-bold mt-0.5">{icon}</span>
            <p className="flex-1 text-sm text-white m-0 mr-4 font-medium leading-tight">
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Close toast"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
