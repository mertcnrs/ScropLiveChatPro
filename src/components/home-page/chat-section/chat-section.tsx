import React, { Fragment, useState } from 'react';
import { Box } from '@radix-ui/themes';
import { Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { getPeerState } from '@/store/slices/peerSlice';
import { getSocket } from '@/store/slices/socketSlice';
import ChatMessageComponent from './chat-message';
import ChatInputComponent from './chat-input';
import GameRequestModalComponent from './game-request';
import Image from 'next/image';

interface ChatSectionProps {
  socket: Socket;
  clientId: string | undefined;
}

export default function ChatSection({
  socket,
  clientId,
}: ChatSectionProps): React.ReactNode {
  const [showPaymentPopup, setShowPaymentPopup] = useState<boolean>(false);
  const { remote } = useSelector(getPeerState);
  const { guest } = useSelector(getSocket);

  const handleMessageAttempt = () => {
    if (guest.count <= 1) {
      setShowPaymentPopup(true);
      setTimeout(() => setShowPaymentPopup(false), 3000);
    }
  };

  return (
    <Fragment>
      <Box className="flex flex-col bg-[#1f1b2e] h-full rounded-xl overflow-hidden mt-1">
        <div className="flex-1 overflow-y-auto scrollbar-custom pb-0">
          <ChatMessageComponent remote={remote} clientId={clientId} />
        </div>
        <div className="mt-auto relative">
          {showPaymentPopup && guest.count <= 1 && (
            <div className="absolute bottom-full left-4 right-4 mb-2">
              <div className="bg-white rounded-xl shadow-lg p-3 text-center">
                <p className="text-sm text-gray-800 mb-2">Yetersiz bakiye, lütfen hemen yükleme yap</p>
                <button 
                  className="bg-[#FF4E4E] hover:bg-[#FF3E3E] text-white px-4 py-2 rounded-full text-sm font-medium w-full"
                  onClick={() => console.log('Yükleme yap tıklandı')}
                >
                  Yükleme yap
                </button>
              </div>
            </div>
          )}
          <ChatInputComponent 
            socket={socket} 
            clientId={clientId} 
            onMessageAttempt={handleMessageAttempt}
          />
        </div>
      </Box>
      <GameRequestModalComponent
        socket={socket}
        remote={remote}
        clientId={clientId}
      />
    </Fragment>
  );
}
