import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';

interface Message {
    text: string;
    isBot: boolean;
    timestamp: Date;
}

export default function VirtualLibrarian() {
    const [messages, setMessages] = useState<Message[]>([
        {
            text: "Olá! Como posso ajudar hoje?",
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Add user message
        const userMessage: Message = {
            text: newMessage,
            isBot: false,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setNewMessage('');

        // TODO: Implement actual API call to get bot response
        // For now, simulate a response after a short delay
        setTimeout(() => {
            const botResponse: Message = {
                text: "Estou processando sua pergunta. Em breve implementaremos a integração com IA para respostas mais precisas.",
                isBot: true,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botResponse]);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-screen p-6">
            <div className="flex items-center gap-2 mb-6">
                <FaRobot className="text-2xl text-purple-600" />
                <h1 className="text-2xl font-bold text-purple-600">
                    Pergunte ao Bibliotecário Virtual
                </h1>
            </div>

            {/* Messages Container */}
            <div className="flex-1 bg-white rounded-lg shadow-sm overflow-y-auto mb-4 p-4">
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                    message.isBot
                                        ? 'bg-gray-100 text-gray-800'
                                        : 'bg-purple-600 text-white'
                                }`}
                            >
                                <p className="text-sm">{message.text}</p>
                                <p className="text-xs mt-1 opacity-70">
                                    {message.timestamp.toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Faça sua pergunta..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                >
                    <FaPaperPlane />
                </button>
            </form>
        </div>
    );
} 