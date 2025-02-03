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
  const { guest } = useSelector(getSocket);

  useEffect(() => {
    const profiles = ['/foto1.jpg', '/foto2.jpg', '/foto3.jpg', '/foto4.jpg', '/foto5.jpg'];
    const messageTexts = [
      'Merhaba aşkım nasılsın? 🥰',
      'Benim adım Elif, senin adın ne?',
      'Yaz tatili geldi, nereye gitmek istersin?',
      'Görüşmek üzere, kendine iyi bak!',
      'Sadece seni düşündüm!'
    ];
    const senderNames = ['Elif', 'Ayşe', 'Zeynep', 'Fatma', 'Meryem'];

    const addNewMessage = () => {
      const randomIndex = Math.floor(Math.random() * profiles.length);
      const newMessage: Message = {
        id: Date.now(),
        sender: senderNames[randomIndex],
        text: messageTexts[randomIndex],
        time: new Date().toLocaleTimeString(),
        profilePic: profiles[randomIndex],
        unreadCount: 1
      };

      setMessages(prev => [...prev, newMessage]);
      setUnreadCount(prev => {
        const newCount = prev + 1;
        onNewMessage(newCount);
        return newCount;
      });

      // Bildirim sesi
      const audio = new Audio('/notification.mp3');
      audio.play().catch(console.error);

      // Bir sonraki mesaj için random süre belirle (1-2 dakika arası)
      scheduleNextMessage();
    };

    const scheduleNextMessage = () => {
      const minDelay = 60000; // 1 dakika
      const maxDelay = 120000; // 2 dakika
      const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
      
      console.log(`Bir sonraki mesaj ${randomDelay/1000} saniye sonra gelecek`);
      setTimeout(addNewMessage, randomDelay);
    };

    // İlk mesajı 5 saniye sonra gönder
    console.log('Scheduling first message in 5 seconds...');
    const initialTimer = setTimeout(() => {
      console.log('Sending first message...');
      addNewMessage();
    }, 5000);

    return () => {
      console.log('Cleaning up message system...');
      clearTimeout(initialTimer);
    };
  }, []); // Sadece component mount olduğunda çalışsın

  const handleMessageClick = (msg: Message) => {
    setSelectedMessage(msg);
    setMessages(prevMessages => 
      prevMessages.map(message => 
        message.id === msg.id ? { ...message, unreadCount: 0 } : message
      )
    );
    setUnreadCount(prev => {
      const newCount = Math.max(0, prev - msg.unreadCount);
      onNewMessage(newCount);
      return newCount;
    });
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
              className="flex items-center cursor-pointer transition-transform duration-200 transform hover:translate-x-1 py-2"
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
                <div className="bg-red-500 text-white rounded-full text-xs w-6 h-6 flex items-center justify-center ml-2">
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
        .p-4::-webkit-scrollbar {
          display: none;
        }
        .p-4 {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}