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

interface MessageBubble {
  messageId: number;
  messages: Array<{
    text: string;
    isUser: boolean;
  }>;
}

interface Friend {
  id: number;
  name: string;
  profilePic: string;
  country: string;
  countryFlag: string;
}

interface MessagePopupProps {
  isOpen: boolean;
  onRequestClose: () => void;
  onNewMessage: (count: number) => void;
  initialTab: 'messages' | 'friends';
}

export default function MessagePopup({ 
  isOpen, 
  onRequestClose, 
  onNewMessage,
  initialTab
}: MessagePopupProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showFriends, setShowFriends] = useState(initialTab === 'friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isFromFriendsList, setIsFromFriendsList] = useState(false);
  const { guest } = useSelector(getSocket);
  const [messageBubbles, setMessageBubbles] = useState<MessageBubble[]>([]);

  const messagesList = [
    "Eğer şimdi müsaitsen",
    "Hadi konuşalım ve biraz eğlenelim",
    "Nasıl gidiyor?",
    "Seni tanımak isterim",
    "Biraz sohbet edelim mi?",
    "Müsait misin?",
    "Selam, nasılsın?",
    "Bugün çok güzel bir gün, değil mi?",
    "Sohbet etmek ister misin?",
    "Merhaba, ben buradayım"
  ];

  useEffect(() => {
    const profiles = ['/foto1.jpg', '/foto2.jpg', '/foto3.jpg', '/foto4.jpg', '/foto5.jpg'];
    const senderNames = ['Elif', 'Ayşe', 'Zeynep', 'Fatma', 'Meryem'];

    const addNewMessage = () => {
      const randomIndex = Math.floor(Math.random() * profiles.length);
      const newMessage: Message = {
        id: Date.now(),
        sender: senderNames[randomIndex],
        text: messagesList[Math.floor(Math.random() * messagesList.length)],
        time: new Date().toLocaleTimeString(),
        profilePic: profiles[randomIndex],
        unreadCount: Math.floor(Math.random() * 4) + 1 // 1-4 arası rastgele sayı
      };

      setMessages(prev => [...prev, newMessage]);
      setUnreadCount(prev => prev + 1);
      onNewMessage(unreadCount + 1);

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

  // Benzersiz rastgele mesajlar seçme fonksiyonu
  const getUniqueRandomMessages = (count: number, firstMessage: string) => {
    const availableMessages = messagesList.filter(msg => msg !== firstMessage);
    const selectedMessages = [firstMessage];
    
    for (let i = 1; i < count; i++) {
      const remainingMessages = availableMessages.filter(msg => !selectedMessages.includes(msg));
      if (remainingMessages.length === 0) break;
      
      const randomIndex = Math.floor(Math.random() * remainingMessages.length);
      selectedMessages.push(remainingMessages[randomIndex]);
    }
    
    return selectedMessages;
  };

  const handleMessageClick = (msg: Message) => {
    setSelectedMessage(msg);
    setIsFromFriendsList(false);
    
    // Eğer bu mesaj için daha önce balon oluşturulmamışsa oluştur
    if (!messageBubbles.find(bubble => bubble.messageId === msg.id)) {
      const bubbleMessages = getUniqueRandomMessages(msg.unreadCount, msg.text);
      setMessageBubbles(prev => [...prev, { 
        messageId: msg.id, 
        messages: bubbleMessages.map(text => ({ text, isUser: false }))
      }]);
    }

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

  // initialTab değiştiğinde showFriends'i güncelle
  useEffect(() => {
    setShowFriends(initialTab === 'friends');
  }, [initialTab]);

  const handleAcceptFriend = () => {
    if (selectedMessage) {
      // Arkadaşı listeye ekle
      const newFriend: Friend = {
        id: selectedMessage.id,
        name: selectedMessage.sender,
        profilePic: selectedMessage.profilePic,
        country: '',
        countryFlag: ''
      };
      setFriends(prev => [...prev, newFriend]);
      
      // Mesajı listeden kaldır
      setMessages(prev => prev.filter(msg => msg.id !== selectedMessage.id));
      
      // Detay görünümünü kapat
      setSelectedMessage(null);
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedMessage) {
      // Yeni mesajı balonlara ekle
      const updatedBubbles = [...messageBubbles];
      const existingBubble = updatedBubbles.find(b => b.messageId === selectedMessage.id);
      
      if (existingBubble) {
        existingBubble.messages.push({ text: newMessage, isUser: true });
      } else {
        updatedBubbles.push({
          messageId: selectedMessage.id,
          messages: [{ text: newMessage, isUser: true }]
        });
      }
      
      setMessageBubbles(updatedBubbles);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFriendClick = (friend: Friend) => {
    const friendMessage: Message = {
      id: friend.id,
      sender: friend.name,
      text: '',
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      profilePic: friend.profilePic,
      unreadCount: 0
    };
    setSelectedMessage(friendMessage);
    setIsFromFriendsList(true);

    // Arkadaş için boş mesaj balonu oluştur
    if (!messageBubbles.find(bubble => bubble.messageId === friend.id)) {
      setMessageBubbles(prev => [...prev, { 
        messageId: friend.id, 
        messages: []
      }]);
    }
  };

  return (
    <div className={`fixed left-0 bg-white shadow-lg transform transition-transform ${
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
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Tabs with purple underline */}
      <div className="border-b">
        <div className="flex px-4">
          <div className="relative flex items-center">
            <IoIosArrowBack onClick={onRequestClose} className="text-xl cursor-pointer mr-2" />
            <button 
              className={`py-3 px-1 font-medium text-base ${!showFriends ? 'text-[#8B5CF6]' : 'text-gray-500'}`}
              onClick={() => setShowFriends(false)}
            >
              Mesajlarım
            </button>
            {!showFriends && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6]"></div>}
          </div>
          <div className="relative">
            <button 
              className={`py-3 px-1 ml-6 font-medium text-base ${showFriends ? 'text-[#8B5CF6]' : 'text-gray-500'}`}
              onClick={() => setShowFriends(true)}
            >
              Arkadaşlarım
            </button>
            {showFriends && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B5CF6]"></div>}
          </div>
        </div>
      </div>

      <div className="p-4" style={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto', scrollbarWidth: 'none' }}>
        {selectedMessage ? (
          <div className="flex flex-col h-full">
            {/* Mesaj detay başlığı düzeni */}
            <div className="flex-none px-4 py-3 border-b">
              <div className="flex items-center">
                <button onClick={() => setSelectedMessage(null)} className="text-gray-600 hover:text-gray-800 p-2">
                  <IoIosArrowBack className="text-xl" />
                </button>
                <div className="flex items-center gap-3 ml-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <Image 
                      src={selectedMessage.profilePic} 
                      alt="profile" 
                      width={40} 
                      height={40} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedMessage.sender}</h3>
                  </div>
                </div>
              </div>
            </div>

            {!isFromFriendsList && (
              <div className="flex-none px-4 text-center">
                <p className="text-gray-800 mb-3">{selectedMessage.sender} sana bir arkadaşlık isteği gönderdi</p>
                <div className="flex justify-center gap-2 mb-4">
                  <button
                    className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition-colors"
                    onClick={handleAcceptFriend}
                  >
                    Kabul et
                  </button>
                  <button
                    className="bg-gray-100 text-gray-600 px-6 py-2 rounded-full hover:bg-gray-200 transition-colors"
                    onClick={() => setSelectedMessage(null)}
                  >
                    Kapat
                  </button>
                </div>
              </div>
            )}

            {/* Mesaj balonları arka plan rengi değişikliği */}
            <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              <div className="bg-white p-4 rounded-lg">
                <div className="space-y-4">
                  {messageBubbles
                    .find(bubble => bubble.messageId === selectedMessage.id)
                    ?.messages.map((message, index) => (
                      <div key={index} className={`flex items-start gap-2 ${message.isUser ? 'flex-row-reverse' : ''}`}>
                        {!message.isUser && (
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                            <Image 
                              src={selectedMessage.profilePic} 
                              alt="profile" 
                              width={32} 
                              height={32} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={`p-3 rounded-lg ${
                          message.isUser 
                            ? 'bg-[#8B5CF6] text-white rounded-br-none ml-auto' 
                            : 'bg-gray-100 rounded-tl-none'
                        }`}>
                          <p className={message.isUser ? 'text-white' : 'text-gray-800'}>{message.text}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Mesaj input alanı */}
            <div className="absolute bottom-0 bg-white border-t w-full">
              <div className="p-2">
                <div className="relative bg-white rounded-lg shadow-sm border border-gray-200">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Mesajınızı yazın..."
                    className="w-full px-3 py-1.5 pr-10 text-sm rounded-lg focus:outline-none resize-none"
                    style={{ minHeight: '36px', maxHeight: '80px' }}
                  />
                  <button
                    onClick={handleSendMessage}
                    className={`absolute right-2 bottom-1 p-1.5 rounded-full transition-colors ${
                      newMessage.trim() 
                        ? 'text-[#8B5CF6] hover:bg-purple-50' 
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!newMessage.trim()}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : showFriends ? (
          // Arkadaşlar listesi
          <div className="space-y-4">
            {/* Arama kutusu */}
            <div className="relative">
              <input
                type="text"
                placeholder="Ara"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-gray-500 text-sm mb-3 text-left pl-2">Arkadaşlar</h3>
              <div className="space-y-3">
                {filteredFriends.length > 0 ? (
                  filteredFriends.map((friend) => (
                    <div 
                      key={friend.id} 
                      className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => handleFriendClick(friend)}
                    >
                      <div className="relative flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden">
                          <Image src={friend.profilePic} alt="profile" width={48} height={48} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-medium text-base">{friend.name}</h3>
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{friend.countryFlag}</span>
                            <span className="text-sm text-gray-500">{friend.country}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : searchQuery ? (
                  <p className="text-gray-500 text-center py-4">Sonuç bulunamadı</p>
                ) : (
                  <p className="text-gray-500 text-center py-4">Henüz arkadaş listeniz boş</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Yeni arkadaş istekleri */}
            <div className="flex items-center mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-16 h-16">
                  <Image src="/icon-likeyou.png" alt="Like" width={64} height={64} className="w-full h-full" />
                </div>
                <h3 className="font-bold text-base">Yeni arkadaş istekleri</h3>
              </div>
              <div className="flex -space-x-2">
                <Image src="/foto1.jpg" alt="Profile" width={24} height={24} className="w-6 h-6 rounded-full border-2 border-white" />
                <Image src="/foto2.jpg" alt="Profile" width={24} height={24} className="w-6 h-6 rounded-full border-2 border-white" />
                <Image src="/foto3.jpg" alt="Profile" width={24} height={24} className="w-6 h-6 rounded-full border-2 border-white" />
              </div>
            </div>

            {/* Message list */}
            {messages.map((msg) => (
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
            ))}
          </>
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