import React, { Fragment, useEffect, useState } from 'react';
import { formatNumber } from '@/lib/utils';
import { Box, Text } from '@radix-ui/themes';
import { IoWarningOutline } from 'react-icons/io5';
import { LuLoader2 } from 'react-icons/lu';
import { FaCircle } from 'react-icons/fa6';

interface OnlineIndicatorProps {
  init: boolean;
  size: number;
  loading: boolean;
}

export default function OnlineIndicatorComponent({
  init,
  size,
  loading,
}: OnlineIndicatorProps): React.ReactNode {
  const [animatedCount, setAnimatedCount] = useState(0);
  const targetNumber = 12458;
  const [isInitialAnimationDone, setIsInitialAnimationDone] = useState(false);

  // İlk yüklenme animasyonu
  useEffect(() => {
    if (isInitialAnimationDone) return;

    const interval = setInterval(() => {
      setAnimatedCount(prev => {
        const nextValue = prev + Math.floor(Math.random() * 200) + 100;
        if (nextValue >= targetNumber) {
          clearInterval(interval);
          setIsInitialAnimationDone(true);
          return targetNumber;
        }
        return nextValue;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isInitialAnimationDone]);

  // Periyodik değişim animasyonu
  useEffect(() => {
    if (!isInitialAnimationDone) return;

    const interval = setInterval(() => {
      setAnimatedCount(prev => {
        const change = Math.random() > 0.5 
          ? Math.floor(Math.random() * (123 - 23 + 1)) + 23  // 23-123 arası artış
          : -(Math.floor(Math.random() * (189 - 55 + 1)) + 55); // 55-189 arası azalış
        const newValue = prev + change;
        // Sayının belirli bir aralıkta kalmasını sağla
        if (newValue < targetNumber - 2000) return prev; // Çok fazla düşmesini engelle
        if (newValue > targetNumber + 2000) return prev; // Çok fazla artmasını engelle
        return newValue;
      });
    }, 3000); // Her 3 saniyede bir değişim

    return () => clearInterval(interval);
  }, [isInitialAnimationDone]);

  return (
    <Box className="flex flex-row items-center gap-3 md:gap-4">
      {!init && (
        <span className="flex items-center gap-1 text-yellow-600 animate-pulse text-xs xl:text-sm">
          <IoWarningOutline /> Connecting peers..
        </span>
      )}

      <div className="flex items-center gap-3">
        {/* Sayı container'ı */}
        <div className="min-w-[80px] sm:min-w-[100px] flex justify-end"> {/* Minimum genişlik ve sağa hizalama */}
          {(!init || loading) ? (
            <div className="flex justify-end">
              <LuLoader2 className="animate-spin text-xl sm:text-2xl md:text-4xl text-white" />
            </div>
          ) : (
            <Text className="text-xl sm:text-2xl md:text-4xl font-semibold text-white text-right">
              {formatNumber(animatedCount)}
            </Text>
          )}
        </div>

        {/* İkon ve yazı */}
        <div className="flex items-center gap-1 sm:gap-2">
          <FaCircle className="text-xs sm:text-sm md:text-base text-green-500 flex-shrink-0" />
          <Text className="text-sm sm:text-base md:text-xl font-medium text-neutral-200 whitespace-nowrap">
            Online Users
          </Text>
        </div>
      </div>
    </Box>
  );
}
