import React, { Fragment, useState, useEffect } from 'react';
import { Box } from '@radix-ui/themes';
import { Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { getPeerState } from '@/store/slices/peerSlice';
import { getSocket } from '@/store/slices/socketSlice';
import ChatMessageComponent from './chat-message';
import ChatInputComponent from './chat-input';
import GameRequestModalComponent from './game-request';

interface ChatSectionProps {
  socket: Socket;
  clientId: string | undefined;
}

export default function ChatSection({
  socket,
  clientId,
}: ChatSectionProps): React.ReactNode {
  const { remote } = useSelector(getPeerState);
  const { guest } = useSelector(getSocket);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Geri sayım için useEffect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showPaymentPopup && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
      if (countdown === 0) {
        setCountdown(3);
      }
    };
  }, [showPaymentPopup, countdown]);

  // Mesaj geldiğinde popup'ı göster
  useEffect(() => {
    if (remote.messages.length > 0 && guest.count <= 1) {
      const lastMessage = remote.messages[remote.messages.length - 1];
      if (lastMessage.clientId !== 'SYSTEM' && lastMessage.clientId !== clientId) {
        setTimeout(() => {
          setShowPaymentPopup(true);
          setTimeout(() => {
            setShowPaymentPopup(false);
          }, 3000);
        }, 1000);
      }
    }
  }, [remote.messages, guest.count, clientId]);

  return (
    <Fragment>
      <Box className="flex flex-col bg-[#1f1b2e] h-full rounded-xl overflow-hidden mt-1">
        <div className="flex-1 overflow-y-auto scrollbar-custom pb-0">
          <ChatMessageComponent remote={remote} clientId={clientId} />
        </div>
        <div className="mt-auto relative">
          {/* Ödeme Popup'ı */}
          {showPaymentPopup && guest.count <= 1 && (
            <div className="absolute bottom-full left-4 right-4 mb-2">
              <div className="bg-white rounded-xl shadow-lg p-3 text-center">
                <p className="text-sm text-gray-800 mb-2">Yetersiz bakiye, lütfen hemen yükleme yap</p>
                <button 
                  className="bg-[#FF4E4E] hover:bg-[#FF3E3E] text-white px-4 py-2 rounded-full text-sm font-medium w-full"
                  onClick={() => console.log('Yükleme yap tıklandı')}
                >
                  Yükleme yap {countdown}s
                </button>
              </div>
            </div>
          )}
          <ChatInputComponent socket={socket} clientId={clientId} />
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
