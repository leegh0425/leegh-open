import { useState, useEffect } from "react";
import { Calendar, DollarSign, Users, Table as TableIcon, Search, Plus, Minus, ShoppingCart, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import dayjs, { Dayjs } from "dayjs";
import axios from "axios";

// 메뉴/마감 데이터 타입
type MenuItem = { id: string; name: string; category: string; [key: string]: any; };
type MenuData = { [category: string]: MenuItem[]; };
type ClosingReport = {
  comp_cd: string; close_date: string;
  today_sales: number; last_week_sales: number;
  emp_cnt: number; tb_cnt: number; tb_detail: string;
  rmrk: string; wait_note: string; pd_amt: string;
  items: { menu_id: string; menu_name: string; qty: number }[];
  is_closed: boolean;
};

const API_URL = import.meta.env.VITE_API_URL;

export default function SalesClosingRegister() {
  // 날짜 및 기본정보
  const [date, setDate] = useState<Dayjs>(dayjs());
  const [form, setForm] = useState<Omit<ClosingReport, "comp_cd" | "close_date" | "is_closed" | "items">>({
    today_sales: 0, last_week_sales: 0, emp_cnt: 0, tb_cnt: 0,
    tb_detail: "", rmrk: "", wait_note: "", pd_amt: "",
  });
  const [menuData, setMenuData] = useState<MenuData>({});
  const [lastReport, setLastReport] = useState<ClosingReport | null>(null);
  const [collapsed, setCollapsed] = useState<{ [cat: string]: boolean }>({});
  const [categoryColors, setCategoryColors] = useState<{ [cat: string]: string }>({});
  const [search, setSearch] = useState("");
  const [lastSearchResult, setLastSearchResult] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"NEW" | "EDIT" | "CLOSED">("NEW");
  const [menuQty, setMenuQty] = useState<Record<string, number>>({});


  // 메뉴 색상 테마
  const RAINBOW_COLORS = [
    "bg-red-50 border-red-200", "bg-orange-50 border-orange-200", "bg-yellow-50 border-yellow-200",
    "bg-green-50 border-green-200", "bg-teal-50 border-teal-200", "bg-sky-50 border-sky-200",
    "bg-blue-50 border-blue-200", "bg-purple-50 border-purple-200", "bg-pink-50 border-pink-200",
  ];

  // 메뉴 데이터 fetch
  useEffect(() => {
    axios.get(`${API_URL}/menus/`).then(res => {
      const data: MenuItem[] = res.data;
       console.log("[menus API data]", data);
      const grouped = data.reduce((acc: MenuData, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item); return acc;
      }, {});
      setMenuData(grouped);

      // 색상 매핑
      const cats = Object.keys(grouped);
      const colors: { [cat: string]: string } = {};
      cats.forEach((cat, idx) => { colors[cat] = RAINBOW_COLORS[idx % RAINBOW_COLORS.length]; });
      setCategoryColors(colors);

      // 접힘 상태
      const initialCollapsed: { [cat: string]: boolean } = {};
      Object.keys(grouped).forEach(cat => { initialCollapsed[cat] = true; });
      setCollapsed(initialCollapsed);
    });
  }, []);

  // 날짜 바뀌면 데이터 fetch (존재시 EDIT/마감, 없으면 NEW)
useEffect(() => {
  // 메뉴 데이터가 준비되기 전에는 아무 작업도 하지 않음!
  if (!menuData || Object.keys(menuData).length === 0) return;

  // 1) 날짜 변경시 즉시 폼/수량 초기화 (잔상 방지)
  setForm({
    today_sales: 0,
    last_week_sales: 0,
    emp_cnt: 0,
    tb_cnt: 0,
    tb_detail: "",
    rmrk: "",
    wait_note: "",
    pd_amt: ""
  });
  setMenuQty({});
  setMode("NEW");
  setLoading(true);

  // 2) 서버에서 마감 데이터 fetch
  axios.get(`${API_URL}/closing-reports/${date.format("YYYY-MM-DD")}`)
    .then(res => {
      const report = res.data;
      setLastReport(report);  // 마지막 마감데이터 저장!
      //const menuIds = Object.values(menuData).flat().map(m => m.id);
      //const closingIds = (report.items || []).map((i: { menu_id: string; }) => i.menu_id);

      setForm({
        today_sales: report.today_sales,
        last_week_sales: report.last_week_sales,
        emp_cnt: report.emp_cnt,
        tb_cnt: report.tb_cnt,
        tb_detail: report.tb_detail,
        rmrk: report.rmrk,
        wait_note: report.wait_note,
        pd_amt: report.pd_amt
      });
       
      setMenuQty(
        Object.fromEntries(
          (report.menu_items || []).map((i: { menu_id: string; qty: number; }) => [i.menu_id, i.qty])
        )
      );
       
      setMode(report.is_closed ? "CLOSED" : "EDIT");
    })
    .catch(() => {
      // 데이터 없을 때 완전 초기화
      setMenuQty({});
      setMode("NEW");
      setLastReport(null);
    })
    .finally(() => setLoading(false));
}, [date, menuData]);

    // 선택 요약 (수량 > 0)
  const selected = Object.entries(menuQty)
  .filter(([_, qty]) => qty > 0)
  .map(([id, qty]) => {
    for (const items of Object.values(menuData)) {
      const menu = items.find(item => String(item.id) === String(id));
      if (menu) return { ...menu, qty };
    }
    return null;
  }).filter((item): item is MenuItem & { qty: number } => !!item);

  console.log("[selected..]", selected);


  // --- 입력 핸들러 ---
  const setField = (field: keyof typeof form, val: any) => setForm(prev => ({ ...prev, [field]: val }));
  const setMenu = (id: string, qty: number) => setMenuQty(prev => ({ ...prev, [id]: Math.max(0, qty) }));

  // 메뉴 수량 조정
  const handleQuantity = (id: string, delta: number) => setMenu(id, (menuQty[id] || 0) + delta);

  // 검색 및 카테고리 접힘
  const filterItems = (items: MenuItem[]) => (!search.trim() ? items : items.filter(item =>
    item.name.replace(/\s/g, '').toLowerCase().includes(search.replace(/\s/g, '').toLowerCase())));

  useEffect(() => {
    let found: MenuItem | null = null;
    Object.entries(menuData).forEach(([_, items]) => {
      items.forEach(item => {
        if (item.name.replace(/\s/g, '').toLowerCase().includes(search.replace(/\s/g, '').toLowerCase())) {
          if (!found) found = item;
        }
      });
    });
    setLastSearchResult(found);
  }, [search, menuData]);
   
  const toggleCollapse = (category: string) => setCollapsed(c => ({ ...c, [category]: !c[category] }));



  // 저장/수정(등록/수정), 마감, 마감취소
  const handleSave = async () => {
    const payload = {
      comp_cd: "ODA01",
      close_date: date.format("YYYY-MM-DD"),
      ...form,
      items: Object.entries(menuQty)
        .filter(([_, qty]) => qty > 0)
        .map(([menu_id, qty]) => {
          for (const items of Object.values(menuData)) {
            const menu = items.find(item => item.id === menu_id);
            if (menu) return { menu_id, menu_name: menu.name, qty };
          }
          return null;
        })
        .filter(Boolean) as any[],
    };
    setLoading(true);
    try {
      if (mode === "NEW") {
        await axios.post(`${API_URL}/closing-reports/`, payload);
        alert("등록 완료!");
      } else {
        await axios.put(`${API_URL}/closing-reports/${date.format("YYYY-MM-DD")}`, payload);
        alert("수정 완료!");
      }
      setMode("EDIT");
    } catch (err: any) {
      alert("저장 실패: " + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  
  const handleClose = async (closed: boolean) => {
    setLoading(true);
    try {
      await axios.patch(`${API_URL}/closing-reports/${date.format("YYYY-MM-DD")}/close`, { is_closed: closed });
      setMode(closed ? "CLOSED" : "EDIT");
      alert(closed ? "마감 처리 완료!" : "마감 취소 완료!");
    } catch (err: any) {
      alert("마감 처리 실패: " + (err.response?.data?.detail || err.message));
    }
    setLoading(false);
  };

  const disableAll = mode === "CLOSED" || loading;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        {/* --- 헤더 --- */}
        <div className="flex items-center gap-3 mb-10">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-md">
            <TrendingUp className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            매출 마감 등록
          </h1>
        </div>

        {/* --- 날짜/상태 --- */}
        <div className="flex gap-4 items-center mb-6">
          <Input type="date" value={date.format("YYYY-MM-DD")} onChange={e => setDate(dayjs(e.target.value))}         
            disabled={loading} style={{ width: 170, fontSize: 18, fontWeight: "bold" }} />
          <span style={{ marginLeft: 10, color: "#666" }}>
            {mode === "NEW" && " [신규 등록]"}
            {mode === "EDIT" && " [수정 가능]"}
            {mode === "CLOSED" && " [마감됨]"}
          </span>
          {mode === "CLOSED" && <span style={{ color: "#e11d48", fontWeight: 600, fontSize: 16 }}>※ 마감 상태(수정불가)</span>}
        </div>

        {/* --- 마감 정보 카드 --- */}
        <div className="bg-white rounded-2xl shadow-xl p-10 border-0 mb-10">
          <div className="pb-8 mb-2 flex items-center gap-4">
            <Calendar className="h-7 w-7 text-blue-500" />
            <span className="text-2xl font-bold">마감 정보</span>
          </div>
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <Label className="font-bold text-base mb-2 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" /> 마감일자
                </Label>
                <Input type="date" value={date.format("YYYY-MM-DD")} onChange={e => setDate(dayjs(e.target.value))}
                  className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" disabled={disableAll} />
              </div>
              <div>
                <Label className="font-bold text-base mb-2 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" /> 금일매출
                </Label>
                <Input type="number" value={form.today_sales} onChange={e => setField("today_sales", Number(e.target.value))}
                  className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" disabled={disableAll} />
              </div>
              <div>
                <Label className="font-bold text-base mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" /> 전주매출
                </Label>
                <Input type="number" value={form.last_week_sales} onChange={e => setField("last_week_sales", Number(e.target.value))}
                  className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" disabled={disableAll} />
              </div>
              <div>
                <Label className="font-bold text-base mb-2 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" /> 객수
                </Label>
                <Input type="number" value={form.emp_cnt} onChange={e => setField("emp_cnt", Number(e.target.value))}
                  className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" disabled={disableAll} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <Label className="font-bold text-base mb-2 flex items-center gap-2">
                  <TableIcon className="w-5 h-5 text-orange-500" /> 테이블수
                </Label>
                <Input type="number" value={form.tb_cnt} onChange={e => setField("tb_cnt", Number(e.target.value))}
                  className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" disabled={disableAll} />
              </div>
              <div>
                <Label className="font-bold text-base mb-2">테이블상세</Label>
                <Input value={form.tb_detail} onChange={e => setField("tb_detail", e.target.value)}
                  className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" disabled={disableAll} />
              </div>
              <div>
                <Label className="font-bold text-base mb-2">PT 생산성</Label>
                <Input value={form.pd_amt} onChange={e => setField("pd_amt", e.target.value)}
                  placeholder="EX) 84,133원(홍길동hr)" className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" disabled={disableAll} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <Label className="font-bold text-base mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-500" /> 웨이팅/이탈
                </Label>
                <Textarea value={form.wait_note} onChange={e => setField("wait_note", e.target.value)}
                  placeholder=" EX) -3인 10분 후 착석, -20:40 2인 이탈 등"
                  className="w-full min-h-[80px] rounded-lg border-gray-200 px-4 py-3 text-base" disabled={disableAll} />
              </div>
              <div>
                <Label className="font-bold text-base mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" /> 특이사항
                </Label>
                <Textarea value={form.rmrk} onChange={e => setField("rmrk", e.target.value)}
                  placeholder="EX) -19:00 2인 예약, -우니,관자 솔드아웃 등"
                  className="w-full min-h-[80px] rounded-lg border-gray-200 px-4 py-3 text-base" disabled={disableAll} />
              </div>
            </div>
          </div>
        </div>

        {/* --- 메뉴/선택 메뉴 --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-3 space-y-8">
            {/* 검색바 */}
            <div className="bg-white rounded-xl shadow-md px-8 py-6 mb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input value={search} onChange={e => setSearch(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && lastSearchResult) { handleQuantity(lastSearchResult.id, 1); setSearch(""); } }}
                  placeholder="메뉴명을 검색하세요 (예: 삼합, 참이슬, 타르타르)"
                  className="pl-12 h-12 rounded-lg border-2 focus:border-blue-400 text-lg" />
              </div>
              {search.trim() && (
                <div className="flex flex-wrap gap-2 items-center mt-4">
                  <Badge className="text-xs border border-gray-300 bg-gray-50">
                    검색결과:{" "}
                    {Object.values(menuData).flat().filter(item =>
                      item.name.replace(/\s/g, "").toLowerCase().includes(search.replace(/\s/g, "").toLowerCase())
                    ).length}개
                  </Badge>
                  <Button
                    onClick={() => setSearch("")}
                    className="h-8 px-3 text-xs bg-gray-100 border border-gray-300 text-gray-700 rounded"
                    style={{ background: "none", color: "#4B5563", border: "1px solid #E5E7EB" }}
                  >
                    검색 초기화
                  </Button>
                </div>
              )}
            </div>
            {/* 메뉴 카테고리 */}
            {Object.entries(menuData).map(([category, items]) => {
              const filteredItems = filterItems(items);
              if (search.trim() && filteredItems.length === 0) return null;
              const isCollapsed = search.trim() ? false : collapsed[category];
              return (
                <div key={category} className={`shadow-md rounded-xl border-0 ${categoryColors[category] || "bg-gray-50"} mb-4`}>
                  <div
                    className="cursor-pointer hover:bg-white/60 transition-colors rounded-t-xl"
                    onClick={() => !search && toggleCollapse(category)}
                  >
                    <div className="flex items-center justify-between px-6 py-3 text-xl font-semibold">
                      <span className="flex items-center gap-2">
                        {isCollapsed ? "▶" : "▼"} {category}
                        <Badge className="ml-2 bg-gray-100 border border-gray-300 text-gray-700">
                          {filteredItems.length}개
                        </Badge>
                      </span>
                      {!isCollapsed && (
                        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                          <Button className="h-7 px-3 text-xs hover:bg-blue-50 rounded bg-gray-100 border border-gray-300 text-gray-700"
                            style={{ background: "none", color: "#4B5563", border: "1px solid #E5E7EB" }}
                            onClick={() => filteredItems.forEach(item => setMenu(item.id, (menuQty[item.id] || 0) + 1))}>전체 +1</Button>
                          <Button className="h-7 px-3 text-xs hover:bg-red-50 rounded bg-gray-100 border border-gray-300 text-gray-700"
                            style={{ background: "none", color: "#4B5563", border: "1px solid #E5E7EB" }}
                            onClick={() => filteredItems.forEach(item => setMenu(item.id, 0))}>전체 초기화</Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {!isCollapsed && (
                    <div className="pt-0 pb-6 px-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {filteredItems.map(item => {
                          // 🔽 여기서 원하는 모든 정보를 콘솔에 찍을 수 있습니다.
                          console.log(
                            "카드의 메뉴이름:", item.name,
                            "item.id:", item.id,
                             "menuQty[item.id]:", menuQty[(item.id)]
                          );
                          return (
                            <div key={item.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 bg-white border-2 rounded-lg p-5 text-center">
                              <h3 className="font-semibold mb-3 text-base">{item.name}</h3>
                              <div className="flex items-center justify-center gap-2">
                                <Button 
                                  className="h-10 w-10 flex items-center justify-center rounded-full p-0 border border-gray-300 bg-white text-gray-700 shadow"
                                  style={{ background: "white", color: "#4B5563", border: "1px solid #E5E7EB" }}
                                  onClick={() => handleQuantity(item.id, -1)} disabled={disableAll}>
                                  <Minus className="w-6 h-6" />
                                </Button>
                                <span className="font-bold text-xl min-w-[2rem] text-center">
                                  {menuQty[item.id] ?? 0}
                                </span>
                                <Button 
                                  className="h-10 w-10 flex items-center justify-center rounded-full p-0 border border-gray-300 bg-white text-gray-700 shadow"
                                  style={{ background: "white", color: "#4B5563", border: "1px solid #E5E7EB" }}
                                  onClick={() => handleQuantity(item.id, 1)} disabled={disableAll}>
                                  <Plus className="w-6 h-6" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* --- 선택한 메뉴 사이드바 --- */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-10">
              <div className="bg-white rounded-2xl shadow-xl border-0 p-8">
                <div className="pb-6">
                  <div className="flex items-center gap-3 text-xl">
                    <ShoppingCart className="h-6 w-6 text-green-500" />
                    선택한 메뉴
                    {selected.length > 0 && (
                      <Badge className="bg-green-500 hover:bg-green-600 ml-2"
                        style={{ verticalAlign: "bottom", marginTop: "10px" }}>{selected.length}</Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-6">
                  {selected.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                      <p>선택된 메뉴가 없습니다</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {selected.map(menu => (
                        <div key={menu.id} className="p-4 bg-white border shadow-sm hover:shadow-md transition-shadow rounded-lg">
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-base flex-1">{menu.name}</span>
                              <Button className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 bg-transparent"
                                style={{ background: "none", color: "#EF4444" ,marginTop: "1px" }} onClick={() => setMenu(menu.id, 0)} disabled={disableAll}>×</Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-[2px] w-full">
                                <Button className="h-10 w-10 flex items-center justify-center rounded-full p-0 border border-gray-300 bg-white text-gray-700 shadow"
                                  style={{ background: "white", color: "#4B5563", border: "1px solid #E5E7EB" , marginLeft: 2, marginRight: 2, height: 28, fontSize: 18}}
                                  onClick={() => handleQuantity(menu.id, -1)} disabled={disableAll}>
                                  <Minus className="w-6 h-6" />
                                </Button>
                                <Input type="number" value={menu.qty} min="0"
                                  onChange={e => setMenu(menu.id, Math.max(0, Number.parseInt(e.target.value) || 0))}
                                  className="w-10 h-8 px-1 py-0 text-center border-2 text-base font-bold"
                                  style={{ width: 36, height: 28, fontSize: 12, padding: 0, margin: "0 2px"}}
                                  disabled={disableAll} />
                                <Button className="h-10 w-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow"
                                  style={{ background: "white", color: "#4B5563", border: "1px solid #E5E7EB",marginLeft: 2, marginRight: 2 , height: 28, fontSize: 18}}
                                  onClick={() => handleQuantity(menu.id, 1)} disabled={disableAll}>
                                  <Plus className="w-6 h-6" />
                                </Button>
                              </div>
                              <span className="ml-2 text-xs text-gray-500 whitespace-nowrap" style={{
                                color: "#222",          // 진한 검정 (아주 진한 #000 원하면 "#000")
                                fontSize: "12px",       // 크기(조금 큼) - 더 크게 하고 싶으면 "20px"
                                fontWeight: 600,        // 굵게
                                background: "#F7F7F7",  // 아주 연한 회색
                                borderRadius: "6px",    // (선택) 약간 둥글게
                                padding: "2px 8px",     // (선택) 여백
                                display: "inline-block", // (선택) 배경/여백 자연스럽게
                                marginTop: "10px" 
                              }}>총 <span style={{ fontWeight: 700 }}>{menu.qty}</span>개</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-base">
                      <span className="font-medium">총 메뉴 종류:</span>
                      <span className="font-bold text-blue-600">{selected.length}개</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="font-medium">총 수량:</span>
                      <span className="font-bold text-green-600">
                        {selected.reduce((sum, menu) => sum + menu.qty, 0)}개
                      </span>
                    </div>
                  </div>
                  {/* 저장/수정/마감/마감취소 버튼 */}
                  {mode !== "CLOSED" && (
                    <div className="flex flex-col gap-2">
                      <Button onClick={handleSave}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                        style={{ background: "linear-gradient(to right, #3b82f6, #8b5cf6)", border: "none", width: "80%", margin: "32px auto 0 auto", maxWidth: "320px" }}
                        disabled={disableAll}>
                        {mode === "EDIT" ? "수정" : "등록"}
                      </Button>
                      {mode === "EDIT" &&
                        <Button onClick={() => handleClose(true)}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                          style={{ background: "linear-gradient(to right, #3b82f6, #8b5cf6)", border: "none", width: "80%", margin: "32px auto 0 auto", maxWidth: "320px" }}
                          disabled={disableAll}>마감</Button>
                      }
                    </div>
                  )}
                  {mode === "CLOSED" && (
                    <Button onClick={() => handleClose(false)}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                     style={{ background: "linear-gradient(to right, #3b82f6, #8b5cf6)", border: "none", width: "80%", margin: "32px auto 0 auto", maxWidth: "320px" }}
                      disabled={disableAll}>마감취소</Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
