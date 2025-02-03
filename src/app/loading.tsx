import React from 'react';
import Image from 'next/image';

export default function Loading(): React.ReactNode {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-black to-purple-900">
      <div className="flex items-center gap-4">
        {/* Logo Container */}
        <div className="relative">
          <div className="absolute -inset-2 bg-purple-500 opacity-25 blur-xl rounded-full animate-pulse-slow"></div>
          <Image
            src="/ranchat-logo.png"
            alt="ranchat-logo"
            width={50}
            height={50}
            className="relative animate-bounce-gentle"
          />
        </div>

        {/* Brand Name */}
        <span className="text-4xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          Scrop
        </span>
      </div>
    </div>
  );
}
