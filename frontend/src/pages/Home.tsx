import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Card sx={{ maxWidth: 400, margin: '2rem auto', boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h4" component="div" gutterBottom>
          Welcome to CarePassport
        </Typography>
        <Typography variant="body1">
          Your secure, patient-controlled cross-border medical data sharing platform.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Home; 