import { Heart } from "./Heart";

// An icon button shaped like the hand-drawn heart: the heart line around a small icon.
// Put it inside a <button> or <Link> with the "group" class so it grows a little on hover.
export function HeartFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`relative grid place-items-center ${className}`}>
      <Heart className="absolute inset-0 h-full w-full transition-transform duration-300 group-hover:scale-110 group-active:scale-95" />
      {/* The roomy part of a heart sits a little above its middle. */}
      <span className="relative -mt-[12%] grid place-items-center">{children}</span>
    </span>
  );
}
