'use client';

import React from 'react';
import { Box } from '@radix-ui/themes';
import { useSelector } from 'react-redux';
import useSocket from '@/hooks/useSocket';
import usePeer from '@/hooks/usePeer';
import useRandomVideo from '@/hooks/useRandomVideo';
import { getSocket } from '@/store/slices/socketSlice';
import { getPeerState } from '@/store/slices/peerSlice';
import ChatSection from './chat-section/chat-section';
import RandomVideoSection from './video-section/video-section';
import HeaderSection from './header-section/header-section';

export default function HomePage(): React.ReactNode {
  useSocket();
  usePeer();

  const { peer, id: peerId, remote } = useSelector(getPeerState);
  const { id: clientId, socket, guest } = useSelector(getSocket);
  const {
    cameraRef,
    videoRef,
    responsiveVideoRef,
    partnerVideoRef,
    myStream: mediaStream,
  } = useRandomVideo({
    socket,
    peer,
    partner: remote.participants.find((e) => e.peerId !== peerId),
  });

  return (
    <Box className="flex-1 flex flex-col p-2 pt-1 md:px-6 md:py-2 overflow-y-auto bg-[#1a1625]">
      <HeaderSection guest={guest} />

      <div className="flex flex-col xl:flex-row gap-2 h-[calc(100vh-90px)]">
        <div className="xl:flex-[4] h-full">
          <RandomVideoSection
            socket={socket}
            peerId={peerId}
            cameraRef={cameraRef}
            videoRef={videoRef}
            responsiveVideoRef={responsiveVideoRef}
            partnerVideoRef={partnerVideoRef}
            mediaStream={mediaStream}
            partnerLoading={remote.loading}
            partner={remote.participants.find((e) => e.peerId !== peerId)}
          />
        </div>

        <div className="xl:flex-[1] h-full">
          <ChatSection socket={socket} clientId={clientId} />
        </div>
      </div>
    </Box>
  );
}
