export default function DisclaimerBanner() {
  return (
    <div className="bg-surface-container border-t border-outline-variant/10 py-3 px-6 text-center">
      <p className="text-[10px] text-on-surface-variant tracking-widest uppercase" style={{ fontFamily: 'Space Grotesk' }}>
        <span className="material-symbols-outlined text-tertiary text-xs align-middle mr-1">warning</span>
        For research and educational purposes only — Not a medical device
      </p>
    </div>
  );
}
