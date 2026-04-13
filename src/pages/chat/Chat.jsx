import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Send, User, Plus, X, ArrowLeft, MoreVertical, ShieldCheck, Clock, MessageSquare, CheckCircle } from 'lucide-react';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const Chat = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [search, setSearch] = useState('');
    const [newUserId, setNewUserId] = useState('');
    const [showNewConv, setShowNewConv] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userNames, setUserNames] = useState({});
    const [showMobileMessages, setShowMobileMessages] = useState(false);
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
            data.forEach(conv => fetchUserName(getOtherUserIdFromConv(conv)));

            const targetConvId = location.state?.conversationId;

            if (targetConvId) {
                const target = data.find(c => c.id === targetConvId);
                if (target) {
                    setSelectedConv(target);
                    setShowMobileMessages(true);
                } else if (data.length > 0) {
                    setSelectedConv(data[0]);
                }
            } else if (data.length > 0 && window.innerWidth > 768) {
                setSelectedConv(data[0]);
            }
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
        setShowMobileMessages(true);
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
            setShowMobileMessages(true);
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
                setShowMobileMessages(false);
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
        <div className="flex h-[calc(100vh-10rem)] bg-white rounded-3xl shadow-2xl shadow-black/5 border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-500">

            {/* Sidebar / Conversation List */}
            <div className={cn(
                "w-full md:w-80 lg:w-96 border-r border-gray-100 bg-gray-50/30 flex flex-col transition-all duration-300",
                showMobileMessages ? "hidden md:flex" : "flex"
            )}>
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-100/50 bg-white flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Messagerie</h2>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Plateforme AEME</p>
                    </div>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowNewConv(!showNewConv)}
                        className="h-10 w-10 rounded-xl border-gray-200 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                    >
                        <Plus size={18} />
                    </Button>
                </div>

                {/* New Conversation Modal/Overlay (simplified directly in sidebar) */}
                {showNewConv && (
                    <div className="px-6 py-4 bg-primary/5 border-b border-primary/10 animate-in slide-in-from-top duration-300">
                        <label className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 block px-1">Nouvel Interlocuteur (UUID)</label>
                        <div className="flex gap-2">
                            <Input
                                value={newUserId}
                                onChange={(e) => setNewUserId(e.target.value)}
                                placeholder="Coller l'identifiant..."
                                className="h-10 bg-white border-2 border-transparent focus:border-primary/20 rounded-xl text-sm"
                            />
                            <Button
                                onClick={handleNewConversation}
                                className="bg-primary hover:bg-primary/90 h-10 px-4 rounded-xl font-bold"
                            >
                                <Plus size={18} />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="px-6 py-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={16} />
                        <Input
                            placeholder="Rechercher un contact..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-11 h-11 bg-white border-2 border-transparent focus:border-primary/10 rounded-2xl shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* Conv List Body */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1.5 scrollbar-hide">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Synchronisation...</p>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="py-12 px-6 text-center">
                            <div className="h-16 w-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <MessageSquare className="h-8 w-8" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">Aucun message</p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight mt-1 opacity-60">Commencez une nouvelle discussion</p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => {
                            const otherUserId = getOtherUserIdFromConv(conv);
                            const isSelected = selectedConv?.id === conv.id;
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv)}
                                    className={cn(
                                        "group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2",
                                        isSelected 
                                            ? "bg-white border-primary/10 shadow-lg shadow-black/5 -translate-y-0.5" 
                                            : "border-transparent hover:bg-white hover:border-gray-100"
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm ring-1 ring-gray-100">
                                            <AvatarFallback className={cn(
                                                "font-bold text-xs",
                                                isSelected ? "bg-primary text-white" : "bg-primary/5 text-primary"
                                            )}>
                                                {(userNames[otherUserId] || 'C').charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white ring-1 ring-black/5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <p className={cn(
                                                "font-bold text-sm truncate",
                                                isSelected ? "text-primary" : "text-gray-900"
                                            )}>
                                                {userNames[otherUserId] || 'Chargement...'}
                                            </p>
                                            <Clock size={10} className="text-gray-300" />
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter truncate opacity-40">
                                            ID: {otherUserId.substring(0, 12)}...
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-all p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className={cn(
                "flex-1 flex flex-col bg-white transition-all duration-300",
                !showMobileMessages ? "hidden md:flex" : "flex"
            )}>
                {!selectedConv ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-gray-50/30">
                         <div className="h-24 w-24 bg-white rounded-[2rem] shadow-xl border border-gray-100 flex items-center justify-center text-primary/20 mb-6 animate-pulse">
                            <Send size={40} className="rotate-12 translate-x-1" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Votre Espace de Discussion</h3>
                        <p className="text-sm text-muted-foreground max-w-xs text-center mt-2 font-medium opacity-60 leading-relaxed uppercase tracking-tighter">Sélectionnez un expert pour démarrer une communication sécurisée.</p>
                        <Badge variant="outline" className="mt-8 border-primary/10 text-primary/40 font-black tracking-[0.2em] px-4 py-1.5 uppercase text-[9px]">AEME SECURE CHAT v2</Badge>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => setShowMobileMessages(false)}
                                    className="md:hidden h-10 w-10 text-gray-400 hover:text-primary rounded-xl"
                                >
                                    <ArrowLeft size={20} />
                                </Button>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-primary/10">
                                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-sm">
                                            {(userNames[getOtherUserIdFromConv(selectedConv)] || 'U').charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">
                                            {userNames[getOtherUserIdFromConv(selectedConv)] || 'Utilisateur'}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-40">
                                                En ligne · Expert AEME
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="text-gray-300 rounded-xl hover:text-primary">
                                <MoreVertical size={20} />
                            </Button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/20 scrollbar-hide">
                            {messages.length === 0 ? (
                                <div className="text-center py-20 px-8">
                                    <div className="h-12 w-12 bg-primary/5 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                                        Cette conversation est sécurisée.<br/>Commencez à échanger maintenant.
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.senderId === user?.id;
                                    return (
                                        <div
                                            key={msg.id || idx}
                                            className={cn(
                                                "flex flex-col gap-1.5 animate-in slide-in-from-bottom-2 duration-300",
                                                isMe ? "items-end" : "items-start"
                                            )}
                                        >
                                            <div className={cn(
                                                "max-w-[85%] md:max-w-[70%] p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed transition-all hover:shadow-md",
                                                isMe 
                                                    ? "bg-primary text-white rounded-tr-none shadow-primary/10" 
                                                    : "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                                            )}>
                                                {!isMe && (
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-2 opacity-60">
                                                        {userNames[msg.senderId] || 'Expert'}
                                                    </p>
                                                )}
                                                <p>{msg.content}</p>
                                                <div className={cn(
                                                    "flex items-center gap-1.5 mt-2 justify-end",
                                                    isMe ? "text-primary-foreground/50" : "text-muted-foreground/40"
                                                )}>
                                                    <span className="text-[9px] font-black uppercase tracking-tighter">
                                                        {msg.sentAt ? formatTime(msg.sentAt) : 'SYNCING'}
                                                    </span>
                                                    {isMe && <CheckCircle size={8} className="text-primary-foreground/40" />}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 border-t border-gray-100 bg-white/80 backdrop-blur-md">
                            <form onSubmit={handleSend} className="flex gap-4 items-center">
                                <div className="flex-1 relative group">
                                    <Input
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Écrivez votre message..."
                                        className="h-14 pl-6 pr-12 bg-gray-50 border-transparent focus:bg-white focus:border-primary/20 rounded-[2rem] text-sm shadow-inner transition-all"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <Badge className="bg-primary/5 text-primary border-none text-[8px] font-black opacity-40">ENTER</Badge>
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={!messageInput.trim()}
                                    className="h-14 w-14 rounded-[2rem] bg-primary text-white hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20 flex-shrink-0"
                                >
                                    <Send size={24} className="translate-x-0.5 -translate-y-0.5" />
                                </Button>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Chat;
;