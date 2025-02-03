'use client';

import React from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  imageUrl: string;
  userName: string;
  location: string;
}

export default function LoadingScreen({ imageUrl, userName = "İsimsiz", location = "Suriye" }: LoadingScreenProps) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/20">
          <Image src={imageUrl} alt="Profile" width={96} height={96} className="w-full h-full object-cover" />
        </div>
        <div className="text-white text-center">
          <p className="text-xl font-medium mb-2">Kullanıcı Bulundu</p>
          <p className="text-lg">{userName}</p>
          <p className="text-sm text-white/70">{location}</p>
        </div>
        <div className="animate-spin w-8 h-8 border-4 border-white/20 border-t-white rounded-full" />
      </div>
    </div>
  );
} 