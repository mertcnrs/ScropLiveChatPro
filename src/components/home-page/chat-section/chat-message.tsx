import React, { useEffect, useRef } from 'react';
import {
  RandomParticipantType,
  type PeerState,
} from '@/store/slices/peerSlice';
import { Text } from '@radix-ui/themes';
import { format } from 'timeago.js';
import Image from 'next/image';

interface ChatMessageComponentProps {
  remote: PeerState['remote'];
  clientId: string | undefined;
}

export default function ChatMessageComponent({
  remote,
  clientId,
}: ChatMessageComponentProps): React.ReactNode {
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (remote.messages.length) {
      messageRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [remote.messages]);

  return (
    <div className="flex flex-col px-4 py-2 min-h-0 scrollbar-hide h-full">
      <div className="flex-1">
        {remote.messages.map((msg, i) =>
          msg.clientId !== RandomParticipantType.System ? (
            <div
              key={i}
              ref={messageRef}
              className={`flex items-start gap-2 mb-2 ${
                msg.clientId === clientId ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Profil Resmi */}
              {msg.clientId !== clientId && (
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src="/foto2.jpg"
                    alt="profile"
                    width={45}
                    height={45}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Mesaj İçeriği */}
              <div className={`flex flex-col max-w-[75%] ${
                msg.clientId === clientId ? 'items-end' : 'items-start'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-purple-300">
                    {msg.clientId === clientId
                      ? RandomParticipantType.You
                      : RandomParticipantType.Guest}
                  </span>
                  <span className="text-xs text-gray-500">{format(msg.time)}</span>
                </div>
                <div className={`rounded-lg px-4 py-2 break-words ${
                  msg.clientId === clientId 
                    ? 'bg-purple-500/20 text-purple-100' 
                    : 'bg-[#2a2438] text-gray-200'
                }`}>
                  <Text size="3" weight="medium" className="whitespace-pre-wrap">{msg.message}</Text>
                </div>
              </div>
            </div>  
          ) : (
            <div
              className="flex flex-col items-center text-xs mb-2 text-gray-500"
              ref={messageRef}
              key={i}
            >
              {msg.message}
            </div>
          )
        )}
      </div>
    </div>
  );
}
