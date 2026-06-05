import React from 'react';
import { Box, Typography, Container, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: { xs: 2, md: 5, lg: 8 },
        mt: 'auto',
        backgroundColor: 'background.paper',
        borderTop: '1px solid #F3F4F6',
      }}
    >
      <Container maxWidth={false} sx={{ px: 0 }}>
        <Box sx={{ 
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 1, fontSize: 22 }}>mate</Typography>
          <Typography variant="body2" color="text.muted" sx={{ fontSize: 15 }}>
            ⓒ 2026 MATE. Connecting Creative Mates.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
