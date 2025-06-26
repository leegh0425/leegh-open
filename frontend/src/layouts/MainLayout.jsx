import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Notice from "../pages/Notice";
import { Box } from "@mui/material";

function MainLayout() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f7f8fa' }}>
      <Sidebar />
      <Box sx={{ flex: 1 }}>
        <Topbar />
        <Box sx={{ p: 3 }}>
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="notice" element={<Notice />} />
            <Route path="*" element={<Navigate to="dashboard" />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
}

export default MainLayout;
