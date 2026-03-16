import { AlertTriangle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="w-full py-3 px-6 flex items-center justify-center gap-2.5 text-center"
      style={{ background: 'rgba(255, 188, 66, 0.1)', borderTop: '1px solid rgba(255, 188, 66, 0.2)' }}
    >
      <AlertTriangle size={16} className="text-[#FFBC42] shrink-0" />
      <p className="text-xs md:text-sm text-[#FFBC42] font-light leading-relaxed">
        <span className="font-medium">OncoDetect</span> is a decision-support prototype.
        It does not provide medical diagnoses. All outputs must be reviewed by a qualified clinician.
      </p>
    </div>
  );
}
