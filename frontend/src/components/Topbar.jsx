import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';

function Topbar() {
  // 로그아웃 핸들러(필요시)
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = "/login";
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: '#24211b',
        color: '#f7d87c',
        borderBottom: '1.5px solid #e6c75933',
        px: 3,
      }}
    >
      <Toolbar>
        <Typography variant="h6"
        sx={{
          flexGrow: 1,
          fontWeight: 700,
          letterSpacing: 1,
          color: "#fff",
          textShadow: "0 2px 12px #222, 0 0 12px #f7d87c88",
        }}>
          ODA 관리자 시스템
        </Typography>
        <Box>
          <Button variant="outlined" onClick={handleLogout}
            sx={{
              color: '#f7d87c',
              borderColor: '#f7d87c',
              background: 'rgba(255,255,255,0.02)',
              fontWeight: 600,
              '&:hover': { background: '#e6c75915', borderColor: '#e6c759' }
            }}>
            로그아웃
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Topbar;
