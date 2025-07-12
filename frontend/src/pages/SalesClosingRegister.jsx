import React, { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
const API_URL = process.env.REACT_APP_API_URL;

export default function SalesClosingRegister() {
  const [menuData, setMenuData] = useState({});
  const [quantities, setQuantities] = useState({});
  const [collapsed, setCollapsed] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastSearchResult, setLastSearchResult] = useState(null); // 최근 1개 결과 저장

  // 메뉴 데이터 불러오기
  useEffect(() => {
    fetch(`${API_URL}/menus/`)
      .then(res => res.json())
      .then(data => {
        const grouped = data.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = [];
          acc[item.category].push(item);
          return acc;
        }, {});
        setMenuData(grouped);
         // 모든 카테고리 접기!
        const initialCollapsed = {};
        Object.keys(grouped).forEach(cat => {
          initialCollapsed[cat] = true;
        });
        setCollapsed(initialCollapsed);

        setLoading(false);
        });
  }, []);

  // 수량 조정
  const handleQuantity = (id, delta) => {
    setQuantities(q => {
      const newQty = Math.max(0, (q[id] || 0) + delta);
      return { ...q, [id]: newQty };
    });
  };

  // 카테고리 접기/펴기
  const toggleCollapse = (category) => {
    setCollapsed(c => ({
      ...c,
      [category]: !c[category],
    }));
  };

  // 검색 필터
  const filterItems = (items) => {
    if (!search.trim()) return items;
    return items.filter(item =>
      item.name.replace(/\s/g, '').toLowerCase().includes(search.replace(/\s/g, '').toLowerCase())
    );
  };

  // 선택 메뉴 요약
  const selected = Object.entries(quantities)
    .filter(([_, qty]) => qty > 0)
    .map(([id, qty]) => {
      for (const items of Object.values(menuData)) {
        const menu = items.find(item => item.id === id);
        if (menu) return { ...menu, qty };
      }
      return null;
    })
    .filter(Boolean);

  if (loading) return <Box p={5}>메뉴 불러오는 중...</Box>;

  return (
    <Box display="flex" gap={5} p={4}>
      {/* 좌측: 검색 + 카테고리별 그리드 */}
      <Box flex={1} minWidth={0}>
        <TextField
          fullWidth
          label="메뉴명을 검색하세요"
          size="small"
          variant="outlined"
          sx={{ mb: 3 }}
          value={search}
           onChange={e => {
            setSearch(e.target.value);

            // 검색 결과 추적
            let found = null;
            Object.entries(menuData).forEach(([category, items]) => {
              items.forEach(item => {
                if (
                  item.name.replace(/\s/g, '').toLowerCase().includes(e.target.value.replace(/\s/g, '').toLowerCase())
                ) {
                  if (!found) found = item;
                }
              });
            });
            setLastSearchResult(found);
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && lastSearchResult) {
              handleQuantity(lastSearchResult.id, 1);
              setSearch(""); // 검색어 초기화(원하면)
            }
          }}
        />
        {Object.entries(menuData).map(([category, items]) => {
          const filteredItems = filterItems(items);
          if (search.trim() && filteredItems.length === 0) return null;

          // "검색 중이면" 해당 카테고리는 무조건 펼침
          const isCollapsed = search.trim() ? false : collapsed[category];

          return (
            <Box key={category} mb={4}>
              <Box display="flex" alignItems="center" mb={1}>
                <IconButton size="small" onClick={() => toggleCollapse(category)}>
                  {isCollapsed ? <ExpandMore /> : <ExpandLess />}
                </IconButton>
                <Typography fontWeight="bold" variant="h6" ml={1}>{category}</Typography>
                <Typography variant="caption" color="text.secondary" ml={1}>
                  ({filteredItems.length}개)
                </Typography>
              </Box>
              <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
                <Grid container spacing={2}>
                  {filteredItems.map(item => (
                    <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
                      <Card
                        sx={{
                          borderRadius: 2,
                          boxShadow: 3,
                          padding: 2,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          minHeight: 120,
                        }}
                      >
                        <Typography fontWeight="bold" mb={1} textAlign="center" fontSize={15}>
                          {item.name}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 36, height: 36, borderRadius: "50%" }}
                            onClick={() => handleQuantity(item.id, -1)}
                          >-</Button>
                          <Typography fontWeight="bold" minWidth={30} textAlign="center">
                            {quantities[item.id] || 0}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            sx={{ minWidth: 36, height: 36, borderRadius: "50%" }}
                            onClick={() => handleQuantity(item.id, 1)}
                          >+</Button>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Collapse>
            </Box>
          );
        })}
      </Box>
      {/* 우측: 선택 메뉴 요약 */}
      <Box width={340} bgcolor="#fff" borderRadius={4} boxShadow={2} p={3} alignSelf="flex-start">
        <Typography fontWeight="bold" mb={2}>📝 선택한 메뉴</Typography>
        {selected.length === 0 ? (
          <Typography color="text.secondary">선택된 메뉴가 없습니다.</Typography>
        ) : (
          <Box>
            <table style={{ width: "100%", fontSize: 14 }}>
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
          fullWidth
          sx={{ mt: 3, fontWeight: "bold", borderRadius: 2 }}
        >
          등록하기
        </Button>
      </Box>
    </Box>
  );
}
