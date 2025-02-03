'use client';

import React, { useState } from 'react';
import { Socket } from 'socket.io-client';
import GamePopoverComponent from './game-popover';
import EmojiPopoverComponent from './emoji-popover';
import { IoIosSend } from 'react-icons/io';

interface ChatInputComponentProps {
  socket: Socket;
  clientId: string | undefined;
  onMessageAttempt: () => void;
}

export default function ChatInputComponent({
  socket,
  clientId,
  onMessageAttempt,
}: ChatInputComponentProps): React.ReactNode {
  const [clientMessage, setClientMessage] = useState<string>('');

  const onSendMessageHandler = () => {
    if (clientMessage) {
      onMessageAttempt();
      socket.emit('sendRandomMessage', {
        clientId,
        message: clientMessage,
        time: new Date(),
      });
      setClientMessage('');
    }
  };

  return (
    <div className="relative px-3 sm:px-4 py-2 sm:py-3 bg-[#1f1b2e]">
      <div className="flex items-center gap-2 bg-[#2a2438] rounded-lg border border-white/5 pr-2 sm:pr-3">
        <input
          type="text"
          placeholder="Mesajınızı yazın..."
          value={clientMessage}
          className="flex-1 bg-[#1f1b2e] text-gray-200 border-none focus:outline-none focus:ring-0 placeholder:text-gray-400 h-10 sm:h-12 text-sm sm:text-base px-3 sm:px-4 rounded-l-lg"
          onChange={(e) => setClientMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSendMessageHandler();
            }
          }}
        />
        
        <div className="flex items-center gap-1.5 sm:gap-2 border-l border-white/5 pl-2 sm:pl-3">
          <div className="text-gray-400 hover:text-purple-400 transition-colors">
            <GamePopoverComponent socket={socket} />
          </div>
          
          <div className="text-gray-400 hover:text-purple-400 transition-colors">
            <EmojiPopoverComponent setClientMessage={setClientMessage} />
          </div>
          
          <button 
            type="button"
            onClick={onSendMessageHandler}
            className="bg-purple-500 hover:bg-purple-600 transition-colors p-1.5 sm:p-2 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!clientMessage.trim()}
          >
            <IoIosSend className="text-lg sm:text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
}
