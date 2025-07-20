import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'; 
import { Link, useLocation } from 'react-router-dom';


const menu = [
  { text: 'Dashboard', path: '/main/dashboard', icon: <DashboardIcon /> },
  { text: '매출마감등록', path: '/main/SalesClosingRegister', icon: <ReceiptLongIcon /> },
];

function Sidebar() {
  const location = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 210,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 210,
          background: '#28251e',
          color: '#fff',
          border: 'none',
          boxShadow: '2px 0 10px #dbbe8160',
        },
      }}
    >
      <Box sx={{ px: 3, py: 4, textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            letterSpacing: 2,
            fontWeight: 700,
            color: '#f7d87c',
            textShadow: '0 0 8px #e6c75970',
          }}
        >
          오다 ODA
        </Typography>
      </Box>
      <List sx={{ mt: 2 }}>
        {menu.map(item => (
          <ListItemButton
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              color: "#fff !important", // 중요!
              background: location.pathname === item.path
                ? 'linear-gradient(90deg,#e3bc5c 65%,#fff9e3 90%)'
                : 'none',
              borderRadius: 2,
              mx: 1,
              my: 1,
              fontWeight: location.pathname === item.path ? 800 : 600,
              fontSize: "1.08rem",
              boxShadow: location.pathname === item.path
                ? "0 2px 18px #e6c75934"
                : "none",
              '&:hover': {
                background: 'linear-gradient(90deg,#f7d87c30 80%,#fffbe8 100%)',
                color: "#fff !important",
              }
            }}
          >
            <ListItemIcon sx={{color: "#fff" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                sx: {
                  color: "#fff !important", // 폰트 항상 하얗게
                  fontWeight: 700,
                  textShadow: "0 2px 8px #222, 0 0 8px #f7d87c44",
                  fontSize: "1.07rem",
                }
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
}

export default Sidebar;
