import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Typography variant="body2" align="center">
          {new Date().getFullYear()} Система автосалонов by Sopirm
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 