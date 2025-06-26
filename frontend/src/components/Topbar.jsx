import { AppBar, Toolbar, Typography, Box } from '@mui/material';

function Topbar() {
  return (
    <AppBar position="static" sx={{ background: '#21284d' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          오다
        </Typography>
        <Box>Welcome!</Box>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;
