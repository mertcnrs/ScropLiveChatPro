"use client";

import React, { useState, useEffect } from 'react';
import { Box } from '@radix-ui/themes';
import { RiGroupFill } from 'react-icons/ri';
import Image from 'next/image';
import MessagePopup from './home-page/chat-section/MessagePopup';

export default function NavigationBarComponent(): React.ReactNode {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [animate, setAnimate] = useState(false);

  const handleOpenPopup = () => {
    setIsPopupOpen(true);
    setUnreadCount(0);
  };

  useEffect(() => {
    if (unreadCount > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 500);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  return (
    <Box className="flex flex-row md:flex-col md:w-28 px-4 py-2 md:p-4 bg-[#1f1b2e] text-center justify-center items-center gap-10 w-screen h-14 md:h-screen">
      <div>
        <RiGroupFill className="text-xl md:text-2xl text-zinc-400" />
      </div>

      <div
        className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-full cursor-pointer select-none
          transition-all duration-150 [box-shadow:0_4px_0_0_#8b8b8b] md:[box-shadow:-4px_6px_0_0_#8b8b8b]
          active:translate-y-2 md:active:translate-x-[-1px] 
          active:[box-shadow:0_0px_0_0_#8b8b8b] md:active:[box-shadow:-1px_2px_0_0_#8b8b8b]
          hover:brightness-105 md:hover:[box-shadow:-5px_6px_0_0_#8b8b8b]
          hover:translate-x-[1px]"
      >
        <span className="flex flex-col justify-center items-center h-full">
          <Image
            src={'/ranchat-logo.png'}
            alt="ranchat-logo"
            width={'40'}
            height={'40'}
          />
        </span>
      </div>

      <div className="relative" onClick={handleOpenPopup}>
        <Image
          src={'/icon-likeyou.png'}
          alt="like icon"
          width={45}
          height={45}
          className={`text-xl md:text-2xl text-zinc-400 cursor-pointer transition-transform duration-200 ${
            animate ? 'scale-110 brightness-125' : ''
          } hover:scale-110 hover:brightness-125`}
        />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>

      <MessagePopup
        isOpen={isPopupOpen}
        onRequestClose={() => setIsPopupOpen(false)}
        onNewMessage={setUnreadCount}
      />
    </Box>
  );
}