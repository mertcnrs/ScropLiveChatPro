import React, { Fragment, useState, useEffect } from 'react';
import type { MutableRefObject, RefObject } from 'react';
import { useDispatch, useSelector } from '@/store/store';
import { setRemoteLoadingState, setRemoteMessage } from '@/store/slices/peerSlice';
import { getSocket } from '@/store/slices/socketSlice';
import { decreaseBalance, resetBalance, getBalance } from '@/store/slices/balanceSlice';
import { Box, Button } from '@radix-ui/themes';
import { Socket } from 'socket.io-client';
import { AiOutlineAudio, AiOutlineAudioMuted } from 'react-icons/ai';
import { FaVideo, FaVideoSlash } from 'react-icons/fa';
import { BsCameraVideo } from 'react-icons/bs';
import { MdOutlinePersonOff } from 'react-icons/md';
import LoadingScreen from './loading-screen';
import Image from 'next/image';

interface RandomVideoSectionProps {
  socket: Socket;
  peerId: string | undefined;
  cameraRef: MutableRefObject<any>;
  videoRef: RefObject<HTMLVideoElement>;
  responsiveVideoRef: RefObject<HTMLVideoElement>;
  partnerVideoRef: RefObject<HTMLVideoElement>;
  mediaStream: MutableRefObject<any>;
  partnerLoading: boolean;
  partner: { clientId: string; peerId: string } | undefined;
}

export default function RandomVideoSection({
  socket,
  peerId,
  cameraRef,
  videoRef,
  responsiveVideoRef,
  partnerVideoRef,
  mediaStream,
  partnerLoading,
  partner,
}: RandomVideoSectionProps): React.ReactNode {
  const dispatch = useDispatch();
  const { guest } = useSelector(getSocket);
  const { amount } = useSelector(getBalance);
  const [showLoading, setShowLoading] = useState<boolean>(false);
  const [videoCount, setVideoCount] = useState<number>(0);
  const [showPaywall, setShowPaywall] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [currentProfile, setCurrentProfile] = useState<{ image: string; name: string; location: string; clientId: string }>({
    image: '/foto1.jpg',
    name: 'İsimsiz',
    location: 'Suriye',
    clientId: 'CLIENT_1'
  });
  const [messages, setMessages] = useState<Array<{ text: string; sender: string }>>([]);
  const [showMessage, setShowMessage] = useState<boolean>(false);

  // Mesaj listesi
  const messagesList = [
    "Merhaba 👋",
    "Nasılsın?",
    "Tanıştığımıza memnun oldum ☺️",
    "Seni tanımak isterim",
    "Selam, ben buradayım",
    "Merhaba, konuşalım mı?",
    "Hey! Nasıl gidiyor?",
    "Selam! Nasılsın?",
    "Merhaba, sohbet edelim mi?"
  ];

  // Random profil seçme fonksiyonu
  const getRandomProfile = () => {
    const names = [
      { name: 'Ayşe', location: 'İstanbul' },
      { name: 'Zeynep', location: 'Ankara' },
      { name: 'Fatma', location: 'İzmir' },
      { name: 'Merve', location: 'Bursa' },
      { name: 'Elif', location: 'Antalya' },
      { name: 'Selin', location: 'Eskişehir' },
      { name: 'Deniz', location: 'Muğla' },
      { name: 'Ceren', location: 'Çanakkale' },
      { name: 'Yasemin', location: 'Trabzon' }
    ];

    const randomNum = Math.floor(Math.random() * 9) + 1;
    return {
      image: `/foto${randomNum}.jpg`,
      name: names[randomNum - 1].name,
      location: names[randomNum - 1].location,
      clientId: `CLIENT_${randomNum}`
    };
  };

  // Video oynatma fonksiyonu
  const playVideo = (videoNumber: number, currentCount: number) => {
    if (partnerVideoRef.current) {
      if (currentCount >= 3 || amount <= 10) {
        setShowPaywall(true);
        return;
      }

      partnerVideoRef.current.src = `/video${videoNumber}.mp4`;
      partnerVideoRef.current.play().catch(console.error);

      // Video başladıktan 3 saniye sonra mesaj gönder
      if (currentCount > 0) {
        setTimeout(() => {
          const randomMessage = messagesList[Math.floor(Math.random() * messagesList.length)];
          dispatch(setRemoteMessage([{
            clientId: currentProfile.clientId,
            message: randomMessage,
            time: new Date()
          }]));
        }, 3000);
      }

      setTimeout(() => {
        const nextCount = currentCount + 1;
        setVideoCount(nextCount);
        dispatch(decreaseBalance());

        if (nextCount >= 3 || amount <= 30) {
          setShowPaywall(true);
        } else {
          setShowLoading(true);
          const newProfile = getRandomProfile();
          setCurrentProfile(newProfile);
          setTimeout(() => {
            setShowLoading(false);
            const nextVideo = Math.floor(Math.random() * 12) + 1;
            playVideo(nextVideo, nextCount);
          }, 3000);
        }
      }, 6000);
    }
  };

  useEffect(() => {
    if (guest.count <= 1 && videoCount >= 3) {
      setShowPaywall(true);
    }
  }, [guest.count, videoCount]);

  const onRandomHandler = () => {
    if (guest.count <= 1) {
      // Video modu için bakiye kontrolü
      if (videoCount >= 3 || amount <= 10) {
        setShowPaywall(true);
        return;
      }

      const newProfile = getRandomProfile();
      setCurrentProfile(newProfile);
      setShowLoading(true);
      setTimeout(() => {
        setShowLoading(false);
        setVideoCount(prev => prev + 1);
        const nextVideo = Math.floor(Math.random() * 12) + 1;
        playVideo(nextVideo, videoCount);
      }, 3000);
    } else {
      // Normal sohbet modu için
      socket.emit('joinRandomRoom', peerId);
      dispatch(setRemoteLoadingState(true));
    }
  };

  const onStopHandler = () => {
    socket.emit('leaveRandomRoom', peerId);
    if (partnerVideoRef.current) {
      if (guest.count <= 1) {
        setShowLoading(false);
        setShowPaywall(false);
        setVideoCount(0);
        partnerVideoRef.current.src = '';
      } else {
        partnerVideoRef.current.srcObject = null;
      }
    }
  };

  const onAudioToggler = () => {
    const audioTracks = mediaStream.current?.getAudioTracks();
    if (audioTracks && audioTracks.length > 0) {
      audioTracks.forEach((track: MediaStreamTrack) => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  const onVideoToggler = () => {
    const videoTracks = mediaStream.current?.getVideoTracks();
    if (videoTracks && videoTracks.length > 0) {
      videoTracks.forEach((track: MediaStreamTrack) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // Kamera erişimi için useEffect
  useEffect(() => {
    const initWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          mediaStream.current = stream;
        }
        if (cameraRef.current) {
          cameraRef.current = '';
        }
      } catch (error: any) {
        if (error.name === 'NotAllowedError') {
          console.error('User denied webcam access');
          cameraRef.current = 'DISABLED';
        } else {
          console.error('Error accessing webcam:', error.message);
          cameraRef.current = 'DISABLED';
        }
      }
    };

    initWebcam();

    return () => {
      if (mediaStream.current) {
        const tracks = mediaStream.current.getTracks();
        tracks.forEach((track: MediaStreamTrack) => {
          track.stop();
        });
      }
    };
  }, [videoRef]);

  // Mobil kontrolü için
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1280;
  const localVideoRef = isMobile ? responsiveVideoRef : videoRef;

  return (
    <div className="flex flex-col xl:flex-row align-middle gap-1 mt-1">
      <Box className="w-full bg-[#1f1b2e] relative h-[65vh] sm:h-[75vh] xl:h-[85vh] rounded-xl overflow-hidden">
        {showLoading && guest.count <= 1 && (
          <LoadingScreen 
            imageUrl={currentProfile.image}
            userName={currentProfile.name}
            location={currentProfile.location}
          />
        )}

        <div className="w-full h-full flex items-center justify-center bg-black">
          <div className="relative h-full w-full bg-black">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative h-full w-full max-w-[calc(100vh*16/9)]">
                <video
                  playsInline
                  ref={partnerVideoRef}
                  autoPlay
                  className={`w-full h-full object-contain ${showPaywall && guest.count <= 1 ? 'blur-lg' : ''}`}
                />

                {/* Profil bilgileri */}
                {videoCount > 0 && !showPaywall && !showLoading && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20">
                        <Image 
                          src={currentProfile.image} 
                          alt="Profile" 
                          width={48} 
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-white">
                        <div className="text-lg font-medium">{currentProfile.name}</div>
                        <div className="text-sm text-white/70">{currentProfile.location}</div>
                      </div>
                    </div>
                  </div>
                )}

                {showPaywall && guest.count <= 1 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl text-center max-w-sm mx-4">
                      <div className="text-black text-sm space-y-1">
                        <p>Bakiyeniz yetersiz. Eşleşme yapabilmeniz için</p>
                        <div className="flex items-center justify-center gap-1">
                          <Image 
                            src="/altın_para.png" 
                            alt="Altın Para" 
                            width={24} 
                            height={24}
                            className="w-6 h-6"
                          />
                          <span className="flex items-center">20 Altın Para gerekli.</span>
                        </div>
                      </div>
                      <div className="flex gap-3 justify-center mt-4">
                        <button
                          onClick={() => window.location.reload()}
                          className="px-8 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full transition-colors"
                        >
                          Yükle
                        </button>
                        <button
                          onClick={() => window.location.reload()}
                          className="px-8 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kamera preview ve kontrol butonları */}
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4">
          <div className="w-[90px] h-[120px] sm:w-[120px] sm:h-[160px] bg-black rounded-xl overflow-hidden border border-white/10 relative group">
            {/* Kontrol butonları */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
              <Button
                className="p-1.5 sm:p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm"
                onClick={onAudioToggler}
              >
                {isAudioEnabled ? (
                  <AiOutlineAudio size={14} className="sm:w-4 sm:h-4" />
                ) : (
                  <AiOutlineAudioMuted size={14} className="sm:w-4 sm:h-4" />
                )}
              </Button>
              <Button
                className="p-1.5 sm:p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm"
                onClick={onVideoToggler}
              >
                {isVideoEnabled ? (
                  <FaVideo size={14} className="sm:w-4 sm:h-4" />
                ) : (
                  <FaVideoSlash size={14} className="sm:w-4 sm:h-4" />
                )}
              </Button>
            </div>

            {/* Kamera görüntüsü */}
            {cameraRef?.current === 'DISABLED' ? (
              <div className="flex items-center justify-center h-full">
                <MdOutlinePersonOff size={50} className="text-white/50" />
              </div>
            ) : (
              <div className="relative w-full h-full">
                <video
                  playsInline
                  ref={localVideoRef}
                  autoPlay
                  className="w-full h-full object-cover"
                  muted={true}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mesaj gösterimi */}
        {showMessage && messages.length > 0 && !showPaywall && !showLoading && (
          <div className="absolute bottom-20 sm:bottom-24 left-4 sm:left-6 right-4 sm:right-6 flex items-start gap-2 sm:gap-3 animate-fade-in">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image 
                src={currentProfile.image} 
                alt="Profile" 
                width={40} 
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl rounded-tl-none">
              <div className="text-white/80 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">{currentProfile.name}</div>
              <div className="text-white text-sm sm:text-base">{messages[messages.length - 1].text}</div>
            </div>
          </div>
        )}

        {/* Başla/Sonraki/Geç butonları */}
        {!showLoading && !showPaywall && (
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex justify-center">
              {partner ? (
                <Button
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-full text-sm sm:text-base"
                  onClick={onStopHandler}
                >
                  Sonraki
                </Button>
              ) : videoCount > 0 ? (
                <Button
                  className="w-[100px] sm:w-[120px] h-[28px] sm:h-[32px] bg-red-500 hover:bg-red-600 text-white font-medium rounded-[50px] flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-110"
                  onClick={() => {
                    setShowLoading(true);
                    setTimeout(() => {
                      setShowLoading(false);
                      const nextVideo = Math.floor(Math.random() * 12) + 1;
                      playVideo(nextVideo, videoCount);
                    }, 3000);
                  }}
                >
                  <span className="text-base sm:text-lg">Geç</span>
                </Button>
              ) : (
                <Button
                  className={`w-[100px] sm:w-[120px] h-[36px] sm:h-[42px] bg-[#FF00FF] hover:opacity-90 text-white font-medium rounded-[50px] flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-300 transform hover:scale-110
                    ${partnerLoading ? 'animate-pulse' : ''}`}
                  onClick={onRandomHandler}
                >
                  <BsCameraVideo size={20} className="sm:w-6 sm:h-6" />
                  <span className="text-base sm:text-lg">Başla</span>
                </Button>
              )}
            </div>
          </div>
        )}
      </Box>
    </div>
  );
}
