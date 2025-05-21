import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box component="main" sx={{ mt: 4, mb: 4, flex: 1, width: '100%', margin: '0 auto' }}>
        {children}
      </Box>
    </Box>
    
  );
};

export default Layout; 