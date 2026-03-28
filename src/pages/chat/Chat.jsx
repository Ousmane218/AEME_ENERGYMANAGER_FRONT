import { useState, useEffect, useRef } from 'react';
import { Search, Send, User, Plus, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
    getMyConversations,
    getMessages,
    getOrCreateConversation,
    deleteConversation,
    getUserById
} from '../../services/chatService';
import {
    connectWebSocket,
    sendWebSocketMessage,
    disconnectWebSocket
} from '../../services/webSocketService';

const Chat = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [search, setSearch] = useState('');
    const [newUserId, setNewUserId] = useState('');
    const [showNewConv, setShowNewConv] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userNames, setUserNames] = useState({});
    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (!selectedConv) return;
        fetchMessages(selectedConv.id);
        connectWebSocket(selectedConv.id, (newMessage) => {
            setMessages(prev => [...prev, newMessage]);
        });
        return () => disconnectWebSocket();
    }, [selectedConv]);

    const fetchUserName = async (userId) => {
        if (!userId || userNames[userId]) return;
        try {
            const data = await getUserById(userId);
            setUserNames(prev => ({ ...prev, [userId]: data.fullName || 'Utilisateur' }));
        } catch (err) {
            setUserNames(prev => ({ ...prev, [userId]: 'Utilisateur' }));
        }
    };

    const fetchConversations = async () => {
        try {
            setLoading(true);
            const data = await getMyConversations();
            setConversations(data);
            if (data.length > 0) setSelectedConv(data[0]);
            data.forEach(conv => fetchUserName(getOtherUserIdFromConv(conv)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const data = await getMessages(conversationId);
            setMessages(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectConversation = (conv) => {
        disconnectWebSocket();
        setSelectedConv(conv);
        setMessages([]);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !selectedConv) return;
        sendWebSocketMessage(selectedConv.id, messageInput.trim());
        setMessageInput('');
    };

    const handleNewConversation = async () => {
        if (!newUserId.trim()) return;
        try {
            const conv = await getOrCreateConversation(newUserId.trim());
            setConversations(prev => {
                const exists = prev.find(c => c.id === conv.id);
                return exists ? prev : [conv, ...prev];
            });
            fetchUserName(newUserId.trim());
            setSelectedConv(conv);
            setShowNewConv(false);
            setNewUserId('');
        } catch (err) {
            alert('Utilisateur introuvable');
        }
    };

    const handleDeleteConversation = async (e, convId) => {
        e.stopPropagation();
        if (!window.confirm('Supprimer cette conversation ?')) return;
        try {
            await deleteConversation(convId);
            setConversations(prev => prev.filter(c => c.id !== convId));
            if (selectedConv?.id === convId) {
                setSelectedConv(null);
                setMessages([]);
                disconnectWebSocket();
            }
        } catch (err) {
            alert(err.message);
        }
    };

    const getOtherUserIdFromConv = (conv) => {
        return conv.userOneId === user?.id ? conv.userTwoId : conv.userOneId;
    };

    const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
    });

    const filteredConversations = conversations.filter(conv => {
        const otherUserId = getOtherUserIdFromConv(conv);
        const name = userNames[otherUserId] || '';
        return name.toLowerCase().includes(search.toLowerCase()) ||
               otherUserId.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

            {/* Sidebar */}
            <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-[#003366] text-white flex items-center justify-between">
                    <h2 className="font-bold">Conversations</h2>
                    <button
                        onClick={() => setShowNewConv(!showNewConv)}
                        className="p-1 hover:bg-[#002244] rounded transition-colors"
                        title="Nouvelle conversation"
                    >
                        <Plus size={18} />
                    </button>
                </div>

                {showNewConv && (
                    <div className="p-3 border-b border-gray-200 bg-white">
                        <p className="text-xs text-gray-500 mb-2">ID de l'utilisateur :</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newUserId}
                                onChange={(e) => setNewUserId(e.target.value)}
                                placeholder="UUID du user..."
                                className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#003366]"
                            />
                            <button
                                onClick={handleNewConversation}
                                className="px-3 py-1 bg-[#003366] text-white rounded text-sm hover:bg-[#002244]"
                            >
                                OK
                            </button>
                            <button
                                onClick={() => setShowNewConv(false)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="p-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-2 py-2 rounded border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-[#003366]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-sm text-gray-400">Chargement...</div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-400">
                            Aucune conversation.
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const otherUserId = getOtherUserIdFromConv(conv);
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={`p-3 cursor-pointer hover:bg-gray-200 transition-colors relative group ${
                                        selectedConv?.id === conv.id
                                            ? 'bg-blue-100 border-l-4 border-[#003366]'
                                            : 'border-l-4 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 w-full">
                                        <div className="h-8 w-8 rounded-full bg-[#003366] text-white flex items-center justify-center flex-shrink-0">
                                            <User size={16} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-sm text-gray-800 truncate">
                                                {userNames[otherUserId] || 'Chargement...'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {otherUserId.substring(0, 16)}...
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteConversation(e, conv.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-400 hover:text-red-600 flex-shrink-0 ml-auto"
                                            title="Supprimer"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                {!selectedConv ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400">
                        Sélectionne une conversation pour commencer.
                    </div>
                ) : (
                    <>
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
                            <div>
                                <h3 className="font-bold text-[#003366]">
                                    {userNames[getOtherUserIdFromConv(selectedConv)] || 'Chargement...'}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {getOtherUserIdFromConv(selectedConv).substring(0, 24)}...
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-400 text-sm mt-8">
                                    Aucun message. Commencez la conversation !
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?.id;
                                    return (
                                        <div
                                            key={msg.id || idx}
                                            className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                                        >
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                isMe ? 'bg-[#003366] text-white' : 'bg-gray-300 text-gray-600'
                                            }`}>
                                                <User size={16} />
                                            </div>
                                            <div className={`p-3 rounded-lg shadow-sm max-w-md ${
                                                isMe ? 'bg-[#003366] text-white' : 'bg-white text-gray-800'
                                            }`}>
                                                {!isMe && (
                                                    <p className="text-xs font-bold text-gray-500 mb-1">
                                                        {userNames[msg.senderId] || msg.senderId.substring(0, 8) + '...'}
                                                    </p>
                                                )}
                                                <p className="text-sm">{msg.content}</p>
                                                <span className={`text-[10px] block mt-1 text-right ${
                                                    isMe ? 'text-blue-200' : 'text-gray-400'
                                                }`}>
                                                    {msg.sentAt ? formatTime(msg.sentAt) : '...'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={handleSend} className="flex gap-2 items-center">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Type your message..."
                                        className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#003366] transition-shadow"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-[#003366] text-white p-3 rounded-full hover:bg-[#002244] transition-colors shadow-md flex-shrink-0"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Chat;