import React, { useState } from 'react';
import { useWallet, ConnectButton } from '@suiet/wallet-kit';
import {
  Box, Typography, Paper,
  Avatar, List, ListItem, ListItemText
} from '@mui/material';
import {
  AccountBalanceWallet as WalletIcon,
  FiberManualRecord as ActiveIcon
} from '@mui/icons-material';

export const WalletConnectButton: React.FC = () => {
  const { connected, account } = useWallet();
  const [balance] = useState('124.50'); // Mock balance

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {connected && account ? (
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: 'rgba(26, 35, 126, 0.05)',
            border: '1px solid rgba(26, 35, 126, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minWidth: 280
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: '#1a237e', width: 32, height: 32 }}>
              <WalletIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
                Sui Wallet Connected
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1 }}>
              Balance
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              {balance} SUI
            </Typography>
          </Box>
        </Paper>
      ) : (
        <ConnectButton
          style={{
            backgroundColor: '#1a237e',
            borderRadius: '12px',
            padding: '10px 20px',
            fontSize: '14px'
          }}
        >
          Connect Sui Wallet
        </ConnectButton>
      )}
    </Box>
  );
};

export const WalletHistory: React.FC = () => {
  const { connected } = useWallet();

  const history = [
    { type: 'Received', amount: '0.05 SUI', status: 'Success', date: '2 hours ago', action: 'Medical Record Decryption' },
    { type: 'Sent', amount: '0.01 SUI', status: 'Success', date: '1 day ago', action: 'Data Share Grant' },
  ];

  if (!connected) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ActiveIcon sx={{ fontSize: 10, color: 'success.main' }} />
        Recent On-Chain Activity
      </Typography>
      <List disablePadding>
        {history.map((item, idx) => (
          <ListItem key={idx} sx={{ px: 0, py: 0.5 }}>
            <ListItemText
              primary={<Typography variant="caption" fontWeight="bold">{item.action}</Typography>}
              secondary={<Typography variant="caption" color="text.secondary">{item.date} • {item.status}</Typography>}
            />
            <Typography variant="caption" color={item.type === 'Sent' ? 'error.main' : 'success.main'} fontWeight="bold">
              {item.type === 'Sent' ? '-' : '+'}{item.amount}
            </Typography>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default WalletConnectButton;