export default function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`h-px w-full bg-gradient-to-r from-transparent via-metallic-400/90 to-transparent shadow-[0_0_14px_rgba(255,215,0,0.22)] ${className}`}
      role="presentation"
    />
  );
}
