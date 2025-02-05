import React from 'react';
import { type SocketState } from '@/store/slices/socketSlice';
import LoginLogoComponent from './login-logo';
import OnlineIndicatorComponent from './online-indicator';
import { Box } from '@radix-ui/themes';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { getBalance } from '@/store/slices/balanceSlice';

interface HeaderSectionProps {
  guest: SocketState['guest'];
}

export default function HeaderSection({
  guest,
}: HeaderSectionProps): React.ReactNode {
  const { amount } = useSelector(getBalance);

  return (
    <Box className="flex flex-row justify-between align-middle">
      <div className="flex items-center gap-2 sm:gap-4">
        <LoginLogoComponent />
        <div className="flex items-center gap-1 bg-[#8B5CF6] px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
          <span className="text-white text-xs sm:text-sm whitespace-nowrap">Altınlarım</span>
          <Image
            src="/altın_para.png"
            alt="Altın Para"
            width={16}
            height={16}
            className="w-4 h-4 sm:w-5 sm:h-5"
          />
          <span className="text-white text-xs sm:text-sm">{amount}</span>
        </div>
        <span className="text-red-500 text-[10px] sm:text-sm font-medium animate-pulse">
          🔥 <span className="hidden sm:inline">Bu proje </span>Test<span className="hidden sm:inline"> amaclı yapılmıştır!</span>
        </span>
      </div>
      <OnlineIndicatorComponent
        init={guest.init}
        size={guest.count}
        loading={guest.loading}
      />
    </Box>
  );
}
