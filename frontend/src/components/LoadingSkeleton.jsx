export function SkeletonLine({ width = "100%", height = "16px" }) {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div 
        style={{
          width,
          height,
          borderRadius: "4px",
          backgroundSize: "200% 100%",
          backgroundImage: "linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)",
          animation: "shimmer 1.5s infinite linear"
        }}
        className="mb-2"
      />
    </>
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="p-5 rounded-[12px] border border-[rgba(255,255,255,0.07)]" style={{ background: "rgba(255,255,255,0.02)" }}>
      <SkeletonLine width="40%" height="24px" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <SkeletonLine key={i} width={i === lines - 1 ? "60%" : "100%"} />
        ))}
      </div>
    </div>
  );
}

export function SkeletonReport() {
  return (
    <div className="flex flex-col gap-4 animate-fade-in-up">
      <SkeletonCard lines={1} />
      <SkeletonCard lines={4} />
      <SkeletonCard lines={3} />
    </div>
  );
}
