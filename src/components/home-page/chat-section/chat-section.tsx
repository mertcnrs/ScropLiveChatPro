import React, { Fragment } from 'react';
import { Box } from '@radix-ui/themes';
import { Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { getPeerState } from '@/store/slices/peerSlice';
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

  return (
    <Fragment>
      <Box className="flex flex-col bg-[#1f1b2e] h-full rounded-xl overflow-hidden mt-1">
        <div className="flex-1 overflow-y-auto scrollbar-custom pb-0">
          <ChatMessageComponent remote={remote} clientId={clientId} />
        </div>
        <div className="mt-auto">
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
