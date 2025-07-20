import React, { useState, useEffect } from "react";
import {
  Box, Table, TableBody, TableCell, TableContainer, TableRow,
  Paper, TextField, Button, Typography, Card, CardContent, Divider
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";

// 나머지는 그대로 사용


// 메뉴 아이템 타입 정의
type MenuItem = {
  id: string;
  name: string;
  category: string;
  [key: string]: any; // 추가 속성 대비
};

// 메뉴 데이터 타입: 카테고리별로 그룹핑
type MenuData = {
  [category: string]: MenuItem[];
};

const API_URL = import.meta.env.VITE_API_URL;

export default function SalesClosingRegister() {
  // 마감정보 상태
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [todaySales, setTodaySales] = useState<string>("");
  const [lastWeekSales, setLastWeekSales] = useState<string>("");
  const [guests, setGuests] = useState<string>("");
  const [tables, setTables] = useState<string>("");
  const [tableDetail, setTableDetail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [waiting, setWaiting] = useState<string>("");
  const [productivity, setProductivity] = useState<string>("");

  // 메뉴 관련
  const [menuData, setMenuData] = useState<MenuData>({});
  const [quantities, setQuantities] = useState<{ [id: string]: number }>({});
  const [collapsed, setCollapsed] = useState<{ [cat: string]: boolean }>({});
  const [search, setSearch] = useState<string>("");
  const [lastSearchResult, setLastSearchResult] = useState<MenuItem | null>(null);

  // ✅ 메뉴데이터 실제 API에서 fetch
  useEffect(() => {
    fetch(`${API_URL}/menus/`)
      .then(res => res.json())
      .then((data: MenuItem[]) => {
        const grouped = data.reduce((acc: MenuData, item: MenuItem) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {});
        setMenuData(grouped);
        // 카테고리 기본 닫힘
        const initialCollapsed: { [cat: string]: boolean } = {};
        Object.keys(grouped).forEach(cat => { initialCollapsed[cat] = true; });
        setCollapsed(initialCollapsed);
      });
  }, []);

  // 수량조정
  const handleQuantity = (id: string, delta: number) => {
    setQuantities(q => {
      const newQty = Math.max(0, (q[id] || 0) + delta);
      return { ...q, [id]: newQty };
    });
  };

  // 카테고리 접기/펴기
  const toggleCollapse = (category: string) => {
    setCollapsed(c => ({ ...c, [category]: !c[category] }));
  };

  // 검색 필터/엔터
  const filterItems = (items: MenuItem[]) => {
    if (!search.trim()) return items;
    return items.filter(item =>
      item.name.replace(/\s/g, '').toLowerCase().includes(search.replace(/\s/g, '').toLowerCase())
    );
  };

  useEffect(() => {
    let found: MenuItem | null = null;
    Object.entries(menuData).forEach(([_, items]) => {
      items.forEach(item => {
        if (
          item.name.replace(/\s/g, '').toLowerCase().includes(search.replace(/\s/g, '').toLowerCase())
        ) {
          if (!found) found = item;
        }
      });
    });
    setLastSearchResult(found);
  }, [search, menuData]);

  // 선택 요약
  const selected = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      for (const items of Object.values(menuData)) {
        const menu = items.find(item => item.id === id);
        if (menu) return { ...menu, qty };
      }
      return null;
    })
    .filter((item): item is MenuItem & { qty: number } => !!item);

  // 등록 처리
  const handleSubmit = async () => {
    const payload = {
      comp_cd: "ODA01",
      close_date: date ? date.format("YYYY-MM-DD") : "",
      today_sales: Number(todaySales.trim()),
      last_week_sales: Number(lastWeekSales.trim()),
      emp_cnt: Number(guests.trim()),
      tb_cnt: Number(tables.trim()),
      tb_detail: tableDetail,
      rmrk: notes,
      wait_note: waiting,
      pd_amt: productivity,
      items: selected.map(menu => ({
        menu_id: menu.id,
        menu_name: menu.name,
        qty: menu.qty
      }))
    };

    try {
      const res = await axios.post(`${API_URL}/closing-reports/`, payload);
      alert("마감 등록 완료!");
      console.log("등록 성공:", res.data);
    } catch (err: any) {
      console.error("등록 실패:", err.response?.data || err.message);
      alert("마감 등록에 실패했습니다.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box maxWidth="1400px" mx="auto" mt={3} marginTop={1}>
        <Typography variant="h6" fontWeight="bold" mb={1}>마감 등록</Typography>
        <TableContainer component={Paper}
          sx={{
            mb: 2, maxHeight: "200px", borderRadius: 2, boxShadow: 1,
            width: "100%", minWidth: 1000
          }}>
          <Table size="small"
            sx={{
              "& td, & th": { padding: "5px 8px", height: 30, fontSize: 14 },
            }}>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>마감일자</TableCell>
                <TableCell>
                  <DatePicker
                    value={date}
                    onChange={(newDate) => setDate(newDate)}
                    format="YYYY-MM-DD"
                    slotProps={{ textField: { size: "small", placeholder: "2024-05-24" } }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>금일매출</TableCell>
                <TableCell>
                  <TextField size="small" value={todaySales} onChange={e => setTodaySales(e.target.value)}
                    type="number" fullWidth placeholder="예: 1262000" />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>전주매출</TableCell>
                <TableCell>
                  <TextField size="small" value={lastWeekSales} onChange={e => setLastWeekSales(e.target.value)}
                    type="number" fullWidth placeholder="예: 1044200" />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>객수</TableCell>
                <TableCell>
                  <TextField size="small" value={guests} onChange={e => setGuests(e.target.value)}
                    type="number" fullWidth placeholder="예: 45" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>테이블수</TableCell>
                <TableCell>
                  <TextField size="small" value={tables} onChange={e => setTables(e.target.value)}
                    type="number" fullWidth placeholder="예: 18" />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>테이블상세</TableCell>
                <TableCell>
                  <TextField size="small" value={tableDetail} onChange={e => setTableDetail(e.target.value)}
                    fullWidth placeholder="예: 2인12, 3인4, 4인1, 5인1" />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>PT 생산성</TableCell>
                <TableCell colSpan={3}>
                  <TextField size="small" value={productivity} onChange={e => setProductivity(e.target.value)}
                    fullWidth placeholder="예: 84133원(혜정5h)" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>웨이팅/이탈</TableCell>
                <TableCell colSpan={3}>
                  <TextField size="small" value={waiting} onChange={e => setWaiting(e.target.value)}
                    fullWidth placeholder="예: -3인 10분 후 착석, -20:40 2인 이탈 등" />
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>특이사항</TableCell>
                <TableCell colSpan={3}>
                  <TextField size="small" value={notes} onChange={e => setNotes(e.target.value)}
                    fullWidth placeholder="예: -19:00 2인 예약, -우니,관자 솔드아웃 등" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        {/* 메뉴 검색 + POS 메뉴/선택한 메뉴 카드 (좌우 분할) */}
        <Grid container spacing={2} alignItems="flex-start">
          {/* --- 좌측: 메뉴 검색 + POS 그리드 --- */}
          <Grid item xs={12} md={8} lg={9}>
            <TextField
              label="메뉴명을 검색하세요"
              size="small"
              sx={{ minWidth: 320, mb: 2 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && lastSearchResult) {
                  handleQuantity(lastSearchResult.id, 1);
                  setSearch("");
                }
              }}
              placeholder="예: 삼합, 참이슬, 타르타르 등"
            />

            {/* POS 메뉴구간 */}
            {Object.entries(menuData).map(([category, items]) => {
              const filteredItems = filterItems(items);
              if (search.trim() && filteredItems.length === 0) return null;
              const isCollapsed = search.trim() ? false : collapsed[category];
              return (
                <Box key={category} mb={2}>
                  <Box
                    sx={{ cursor: "pointer", display: "flex", alignItems: "center", mb: 1 }}
                    onClick={() => !search && toggleCollapse(category)}
                  >
                    <Typography variant="subtitle1" fontWeight="bold">
                      {isCollapsed ? "▶" : "▼"} {category} ({filteredItems.length}개)
                    </Typography>
                  </Box>
                  {!isCollapsed && (
                    <Grid container={true} spacing={1}>
                      {filteredItems.map(item => (
                        <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
                          <Card
                            sx={{
                              borderRadius: 2,
                              boxShadow: 1,
                              p: 2,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              minHeight: 90,
                            }}
                          >
                            <Typography fontWeight="bold" mb={1} fontSize={15} textAlign="center">{item.name}</Typography>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Button variant="outlined" size="small" sx={{ minWidth: 32, height: 32, borderRadius: "50%" }}
                                onClick={() => handleQuantity(item.id, -1)}
                              >-</Button>
                              <Typography fontWeight="bold" minWidth={28} textAlign="center">
                                {quantities[item.id] || 0}
                              </Typography>
                              <Button variant="contained" size="small" sx={{ minWidth: 32, height: 32, borderRadius: "50%" }}
                                onClick={() => handleQuantity(item.id, 1)}
                              >+</Button>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              );
            })}
          </Grid>
          {/* --- 우측: 선택한 메뉴 카드 --- */}
          <Grid item xs={12} md={4} lg={3}>
            <Card sx={{ p: 2, boxShadow: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography fontWeight="bold" mb={1} fontSize={18} sx={{ display: "flex", alignItems: "center" }}>
                  <span role="img" aria-label="메뉴">📝</span> 선택한 메뉴
                </Typography>
                <Divider sx={{ mb: 1 }} />
                {selected.length === 0 ? (
                  <Typography color="text.secondary" sx={{ fontSize: 15 }}>선택된 메뉴가 없습니다.</Typography>
                ) : (
                  <Box>
                    <table style={{ width: "100%", fontSize: 15, marginBottom: 12 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: 4 }}>메뉴</th>
                          <th style={{ textAlign: "center", padding: 4 }}>수량</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.map(menu => (
                          <tr key={menu.id}>
                            <td style={{ padding: 4 }}>{menu.name}</td>
                            <td style={{ textAlign: "center", padding: 4 }}>{menu.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>
                )}
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ fontWeight: "bold", borderRadius: 2, width: "100%", mt: 2 }}
                  onClick={handleSubmit}
                >
                  등록하기
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
