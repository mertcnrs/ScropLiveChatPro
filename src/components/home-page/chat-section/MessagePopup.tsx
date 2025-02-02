import React, { useState, useEffect } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import Image from 'next/image';
import { useSelector } from '@/store/store';
import { getSocket } from '@/store/slices/socketSlice';

interface Message {
  id: number;
  sender: string;
  text: string;
  time: string;
  profilePic: string;
  unreadCount: number; // Unread count for each message
}

interface MessagePopupProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onNewMessage: (count: number) => void;
}

export default function MessagePopup({ isOpen, onRequestClose, onNewMessage }: MessagePopupProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [timeouts, setTimeouts] = useState<number[]>([]);
  const { guest } = useSelector(getSocket);

  useEffect(() => {
    const profiles = [
      '/foto1.jpg', '/foto2.jpg', '/foto3.jpg', '/foto4.jpg', '/foto5.jpg',
      '/foto6.jpg', '/foto7.jpg', '/foto8.jpg', '/foto9.jpg'
    ];
    const messageTexts = [
      'Merhaba aşkım nasılsın? 🥰',
      'Benim adım Elif, senin adın ne?',
      'Yaz tatili geldi, nereye gitmek istersin?',
      'Görüşmek üzere, kendine iyi bak!',
      'Sadece seni düşündüm!',
      'Yaz tatili geldi, nereye gitmek istersin?',
      'Yaz tatili geldi, nereye gitmek istersin?',
      'Dilersen konuşabiliriz.',
      'Yaz tatili geldi, nereye gitmek istersin?'
    ];
    const senderNames = [
      'Elif', 'Ayşe', 'Zeynep', 'Fatma', 'Meryem', 'Seda', 'Havva', 'Leyla', 'Esra'
    ];

    const combinedMessages = profiles.map((profile, index) => ({
      profilePic: profile,
      text: messageTexts[index],
      sender: senderNames[index],
      unreadCount: Math.floor(Math.random() * 4) + 1
    }));

    const shuffleArray = (array: any[]) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    };

    shuffleArray(combinedMessages);

    const playNotificationSound = () => {
      const audio = new Audio('/notification.mp3');
      audio.play();
    };

    const addMessage = (text: string, profile: string, sender: string) => {
      const newMessage: Message = {
        id: Date.now(),
        sender,
        text,
        time: new Date().toLocaleTimeString(),
        profilePic: profile,
        unreadCount: Math.floor(Math.random() * 4) + 1,
      };
      setMessages(prevMessages => [...prevMessages, newMessage]);
      setUnreadCount(prevCount => {
        const newCount = prevCount + 1;
        onNewMessage(newCount);
        return newCount;
      });
      playNotificationSound();
    };

    const scheduleMessages = () => {
      const newTimeouts: number[] = [];
      combinedMessages.forEach((msg, index) => {
        const delay = index === 0 ? 5000 : Math.floor(Math.random() * (120000 - 60000 + 1)) + 60000;
        const timeout = window.setTimeout(() => {
          addMessage(msg.text, msg.profilePic, msg.sender);
        }, delay * (index + 1));
        newTimeouts.push(timeout);
      });
      setTimeouts(newTimeouts);
    };

    scheduleMessages();

    return () => {
      timeouts.forEach(timeout => window.clearTimeout(timeout));
    };
  }, [onNewMessage]);

  const handleReadMessages = () => {
    setUnreadCount(0);
    onNewMessage(0);
  };

  const handleMessageClick = (msg: Message) => {
    setSelectedMessage(msg);
    setMessages((prevMessages) => {
      return prevMessages.map((message) => {
        if (message.id === msg.id) {
          return { ...message, unreadCount: 0 }; // Mark this message as read
        }
        return message;
      });
    });
    setUnreadCount((prevCount) => prevCount - msg.unreadCount); // Decrease unread count
    onNewMessage(unreadCount - msg.unreadCount);
  };

  const closeModal = () => {
    setSelectedMessage(null);
  };

  return (
    <div
      className={`fixed left-0 bg-white shadow-lg transform transition-transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{
        width: '500px',
        maxWidth: '100%',
        height: '100vh',
        top: '0vh',
        borderRadius: '10px',
        zIndex: 1000,
        overflow: 'hidden',
      }}
    >
      <div className="p-4 border-b flex items-center">
        <IoIosArrowBack onClick={onRequestClose} className="text-xl cursor-pointer mr-2" />
        <h2 className="text-lg font-semibold">Mesajlar</h2>
      </div>
      <div className="p-4" style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', scrollbarWidth: 'none' }}>
        {selectedMessage ? (
          <div>
            <h2 className="text-lg font-semibold">{selectedMessage.sender}</h2>
            <p>{selectedMessage.text}</p>
            <button onClick={closeModal} className="mt-4 text-blue-500">
              Geri
            </button>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-center mb-2 cursor-pointer border-b pb-2 transition-transform duration-200 transform hover:translate-x-1"
              onClick={() => handleMessageClick(msg)}
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300">
                <Image src={msg.profilePic} alt="profile" width={64} height={64} className="w-full h-full object-cover" />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-lg">{msg.sender}</p>
                  <span className="text-xs text-gray-500">{msg.time}</span>
                </div>
                <p className="text-gray-800 overflow-hidden" style={{ maxWidth: 'calc(100% - 60px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
                  {msg.text}
                </p>
              </div>
              {msg.unreadCount > 0 && (
                <div
                  className="bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center ml-2"
                >
                  {msg.unreadCount}
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          .fixed {
            width: 100%;
            height: 100vh;
            top: 0;
            border-radius: 0;
          }
        }
        /* Kaydırma çubuğunu gizlemek için */
        .p-4::-webkit-scrollbar {
          display: none; /* Chrome, Safari ve Opera için */
        }
        .p-4 {
          -ms-overflow-style: none; /* Internet Explorer ve Edge için */
          scrollbar-width: none; /* Firefox için */
        }
      `}</style>
    </div>
  );
}