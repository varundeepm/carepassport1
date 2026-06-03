import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    IconButton,
    Divider,
    Chip,
    CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ForumIcon from '@mui/icons-material/Forum';
import { chat, ChatMessage } from '../services/api';
import moment from 'moment';

const CommunityChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Polling every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const fetchMessages = async () => {
        try {
            const response = await chat.getMessages();
            setMessages(response.data.messages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setLoading(false);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            await chat.sendMessage(newMessage);
            setNewMessage('');
            fetchMessages();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <Paper elevation={0} sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4,
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            bgcolor: 'white'
        }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ForumIcon />
                <Typography variant="h6" fontWeight="bold">Community Chat</Typography>
                <Chip
                    label="Public"
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                />
            </Box>

            <Box
                ref={scrollRef}
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    bgcolor: '#f8f9fa'
                }}
            >
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress size={24} />
                    </Box>
                ) : messages.length === 0 ? (
                    <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
                        No messages yet. Start the conversation!
                    </Typography>
                ) : (
                    messages.map((msg) => (
                        <Box key={msg._id} sx={{ display: 'flex', flexDirection: 'column', maxWidth: '85%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography variant="caption" fontWeight="bold">
                                    {msg.displayName}
                                </Typography>
                                <Chip
                                    label={msg.userRole}
                                    size="small"
                                    color={msg.userRole === 'doctor' ? 'secondary' : 'default'}
                                    sx={{ height: 16, fontSize: '0.6rem' }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    {moment(msg.createdAt).format('HH:mm')}
                                </Typography>
                            </Box>
                            <Paper sx={{
                                p: 1.5,
                                borderRadius: '0 12px 12px 12px',
                                bgcolor: msg.userRole === 'doctor' ? '#fff5f5' : 'white',
                                border: '1px solid #eee'
                            }}>
                                <Typography variant="body2">{msg.message}</Typography>
                            </Paper>
                        </Box>
                    ))
                )}
            </Box>

            <Divider />
            <Box component="form" onSubmit={handleSend} sx={{ p: 2, display: 'flex', gap: 1 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    disabled={sending}
                />
                <IconButton color="primary" type="submit" disabled={sending || !newMessage.trim()}>
                    <SendIcon />
                </IconButton>
            </Box>
        </Paper>
    );
};

export default CommunityChat;
