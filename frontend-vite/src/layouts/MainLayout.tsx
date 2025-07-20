import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard.tsx";
import SalesClosingRegister from "../pages/SalesClosingRegister.tsx";
import { Box } from "@mui/material";

function MainLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f8f6f3' }}>
      <Sidebar />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column'  }}>
        <Topbar />
        <Box sx={{ flex: 1, p: 4, background: 'transparent' }}>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="SalesClosingRegister" element={<SalesClosingRegister />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
