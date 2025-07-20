import { Card, CardContent, Typography } from "@mui/material";

function Dashboard() {
  return (
    <Card sx={{
      maxWidth: 600,
      margin: "36px auto",
      borderRadius: 4,
      background: "#fffbe8",
      boxShadow: "0 4px 24px #e6c75938",
      textAlign: "center"
    }}>
      <CardContent>
        <Typography variant="h4" fontWeight={800} color="#24211b">
          어서오세요, 오다 관리자!
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, color: "#857442" }}>
          오늘도 멋진 하루 되세요 😊
        </Typography>
      </CardContent>
    </Card>
  );
}
export default Dashboard;
