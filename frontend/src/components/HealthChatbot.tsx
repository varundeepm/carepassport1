import React, { useState, useRef, useEffect } from 'react';
import {
    Box, Typography, Paper, IconButton, TextField,
    Avatar, List, ListItem, ListItemText, Divider,
    Fade, Zoom, CircularProgress, Badge
} from '@mui/material';
import {
    Chat as ChatIcon,
    Close as CloseIcon,
    Send as SendIcon,
    SmartToy as RobotIcon,
    Person as PersonIcon,
    AutoAwesome as MagicIcon
} from '@mui/icons-material';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

const HealthChatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hello! I am your CarePassport AI Health Assistant. How can I help you with your medical records or disease management today?',
            sender: 'ai',
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulated AI response
        setTimeout(() => {
            const aiResponse: Message = {
                id: (Date.now() + 1).toString(),
                text: generateAIResponse(input),
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 1500);
    };

    const generateAIResponse = (query: string): string => {
        const q = query.toLowerCase();
        if (q.includes('diabetes')) return "Managing diabetes involves regular monitoring of blood glucose levels, a balanced diet, and consistent physical activity. Would you like me to check your latest HbA1c results from your records?";
        if (q.includes('appointment')) return "You can book or manage your appointments directly from the dashboard. Your next scheduled visit is with Dr. Sarah Johnson on Jan 15th.";
        if (q.includes('hello') || q.includes('hi')) return "Hi there! I'm here to help you navigate your health data. You can ask about your medications, lab results, or disease tracking.";
        if (q.includes('task')) return "Your doctor has assigned several wellness tasks for you, including daily blood pressure monitoring. Have you completed today's entry?";
        return "That's an important question. I recommend discussing this specifically with your doctor. I can help you prepare a list of questions based on your recent medical reports if you'd like.";
    };

    return (
        <>
            {/* Floating Action Button */}
            <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 1000 }}>
                <Zoom in={true}>
                    <Badge badgeContent="AI" color="primary" overlap="circular">
                        <IconButton
                            onClick={() => setIsOpen(!isOpen)}
                            sx={{
                                width: 65,
                                height: 65,
                                bgcolor: '#1a237e',
                                color: 'white',
                                boxShadow: '0 8px 32px rgba(26, 35, 126, 0.4)',
                                '&:hover': { bgcolor: '#0d47a1', transform: 'scale(1.1)' },
                                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                            }}
                        >
                            {isOpen ? <CloseIcon /> : <ChatIcon fontSize="large" />}
                        </IconButton>
                    </Badge>
                </Zoom>
            </Box>

            {/* Chat Window */}
            <Fade in={isOpen}>
                <Paper
                    sx={{
                        position: 'fixed',
                        bottom: 110,
                        right: 30,
                        width: 380,
                        height: 550,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 4,
                        overflow: 'hidden',
                        boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        border: '1px solid rgba(255,255,255,0.3)',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    {/* Header */}
                    <Box sx={{ p: 2, bgcolor: '#1a237e', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                                <MagicIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">CarePassport AI</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.8 }}>Online | Smart Healthcare</Typography>
                            </Box>
                        </Box>
                        <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Messages Area */}
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {messages.map((msg) => (
                            <Box
                                key={msg.id}
                                sx={{
                                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    maxWidth: '85%'
                                }}
                            >
                                <Paper
                                    sx={{
                                        p: 2,
                                        borderRadius: msg.sender === 'user' ? '20px 20px 0 20px' : '20px 20px 20px 0',
                                        bgcolor: msg.sender === 'user' ? '#1a237e' : '#f0f2f5',
                                        color: msg.sender === 'user' ? 'white' : 'black',
                                        boxShadow: 'none'
                                    }}
                                >
                                    <Typography variant="body2">{msg.text}</Typography>
                                </Paper>
                                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, textAlign: msg.sender === 'user' ? 'right' : 'left', color: 'text.secondary' }}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Typography>
                            </Box>
                        ))}
                        {isTyping && (
                            <Box sx={{ alignSelf: 'flex-start', ml: 1 }}>
                                <CircularProgress size={20} thickness={5} />
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    <Divider />

                    {/* Input Area */}
                    <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', gap: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Ask about your health..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 4 } }}
                        />
                        <IconButton
                            color="primary"
                            onClick={handleSend}
                            disabled={!input.trim()}
                            sx={{ bgcolor: '#1a237e', color: 'white', '&:hover': { bgcolor: '#0d47a1' } }}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Paper>
            </Fade>
        </>
    );
};

export default HealthChatbot;
