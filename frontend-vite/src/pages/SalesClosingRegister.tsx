import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { Calendar, DollarSign, Users, Table as TableIcon, Search, Plus, Minus, ShoppingCart, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
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
  const [categoryColors, setCategoryColors] = useState<{ [cat: string]: string }>({});

  const RAINBOW_COLORS = [
  "bg-red-50 border-red-200",
  "bg-orange-50 border-orange-200",
  "bg-yellow-50 border-yellow-200",
  "bg-green-50 border-green-200",
  "bg-teal-50 border-teal-200",
  "bg-sky-50 border-sky-200",
  "bg-blue-50 border-blue-200",
  "bg-purple-50 border-purple-200",
  "bg-pink-50 border-pink-200",
];


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

         // ★★★ 여기 추가! 카테고리별 색상 동적 할당
        const cats = Object.keys(grouped);
        const colors: { [cat: string]: string } = {};
        cats.forEach((cat, idx) => {
            colors[cat] = RAINBOW_COLORS[idx % RAINBOW_COLORS.length];
        });
        setCategoryColors(colors);

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

  function handleNumberInput(value: any, setTodaySales: Dispatch<SetStateAction<string>>) {
    throw new Error("Function not implemented.");
  }

  // ... (import, useState 등 동일, 기존 코드 그대로)

return (
   <div className="min-h-screen bg-gray-50 py-10">
    <div className="max-w-7xl mx-auto px-4">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-10">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-md">
          <TrendingUp className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          매출 마감 등록
        </h1>
      </div>

      {/* 마감 정보 카드 */}
      <div className="bg-white rounded-2xl shadow-xl p-10 border-0 mb-10">
        <div className="pb-8 mb-2 flex items-center gap-4">
          <Calendar className="h-7 w-7 text-blue-500" />
          <span className="text-2xl font-bold">마감 정보</span>
        </div>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* 입력 폼 */}
            <div>
              <Label className="font-bold text-base mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" /> 마감일자
              </Label>
              <Input type="date" value={date ? date.format("YYYY-MM-DD") : ""} onChange={(e: { target: { value: string | number | dayjs.Dayjs | Date | null | undefined; }; }) => setDate(dayjs(e.target.value))} className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" />
            </div>
            <div>
              <Label className="font-bold text-base mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" /> 금일매출
              </Label>
              <Input value={todaySales} onChange={(e: { target: { value: any; }; }) => handleNumberInput(e.target.value, setTodaySales)} placeholder="1,262,000" className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" />
            </div>
            <div>
              <Label className="font-bold text-base mb-2 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" /> 전주매출
              </Label>
              <Input value={lastWeekSales} onChange={(e: { target: { value: any; }; }) => handleNumberInput(e.target.value, setLastWeekSales)} placeholder="1,044,200" className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" />
            </div>
            <div>
              <Label className="font-bold text-base mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" /> 객수
              </Label>
              <Input value={guests} onChange={(e: { target: { value: any; }; }) => handleNumberInput(e.target.value, setGuests)} placeholder="45" className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Label className="font-bold text-base mb-2 flex items-center gap-2">
                <TableIcon className="w-5 h-5 text-orange-500" /> 테이블수
              </Label>
              <Input value={tables} onChange={(e: { target: { value: any; }; }) => handleNumberInput(e.target.value, setTables)} placeholder="18" className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" />
            </div>
            <div>
              <Label className="font-bold text-base mb-2">테이블상세</Label>
              <Input value={tableDetail} onChange={(e: { target: { value: SetStateAction<string>; }; }) => setTableDetail(e.target.value)} placeholder="2인12, 3인4, 4인1, 5인1" className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" />
            </div>
            <div>
              <Label className="font-bold text-base mb-2">PT 생산성</Label>
              <Input value={productivity} onChange={(e: { target: { value: SetStateAction<string>; }; }) => setProductivity(e.target.value)} placeholder="84,133원(혜정5h)" className="w-full h-12 rounded-lg border-gray-200 px-4 text-base" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <Label className="font-bold text-base mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" /> 웨이팅/이탈
              </Label>
              <Textarea value={waiting} onChange={(e: { target: { value: SetStateAction<string>; }; }) => setWaiting(e.target.value)} placeholder="-3인 10분 후 착석, -20:40 2인 이탈 등" className="w-full min-h-[80px] rounded-lg border-gray-200 px-4 py-3 text-base" />
            </div>
            <div>
              <Label className="font-bold text-base mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> 특이사항
              </Label>
              <Textarea value={notes} onChange={(e: { target: { value: SetStateAction<string>; }; }) => setNotes(e.target.value)} placeholder="-19:00 2인 예약, -우니,관자 솔드아웃 등" className="w-full min-h-[80px] rounded-lg border-gray-200 px-4 py-3 text-base" />
            </div>
          </div>
        </div>
      </div>

      {/* 메뉴/선택 메뉴 */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* 메뉴 그리드 */}
        <div className="lg:col-span-3 space-y-8">
          {/* 검색바 */}
          <div className="bg-white rounded-xl shadow-md px-8 py-6 mb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={search}
                onChange={(e: { target: { value: SetStateAction<string>; }; }) => setSearch(e.target.value)}
                onKeyDown={(e: { key: string; }) => {
                  if (e.key === "Enter" && lastSearchResult) {
                    handleQuantity(lastSearchResult.id, 1);
                    setSearch("");
                  }
                }}
                placeholder="메뉴명을 검색하세요 (예: 삼합, 참이슬, 타르타르)"
                className="pl-12 h-12 rounded-lg border-2 focus:border-blue-400 text-lg"
              />
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
                        <Button
                          className="h-7 px-3 text-xs hover:bg-blue-50 rounded bg-gray-100 border border-gray-300 text-gray-700"
                          style={{ background: "none", color: "#4B5563", border: "1px solid #E5E7EB" }}
                          onClick={() => {
                            filteredItems.forEach(item => {
                              setQuantities(q => ({ ...q, [item.id]: (q[item.id] || 0) + 1 }));
                            });
                          }}
                        >
                          전체 +1
                        </Button>
                        <Button
                          className="h-7 px-3 text-xs hover:bg-red-50 rounded bg-gray-100 border border-gray-300 text-gray-700"
                          style={{ background: "none", color: "#4B5563", border: "1px solid #E5E7EB" }}
                          onClick={() => {
                            filteredItems.forEach(item => {
                              setQuantities(q => ({ ...q, [item.id]: 0 }));
                            });
                          }}
                        >
                          전체 초기화
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                {!isCollapsed && (
                  <div className="pt-0 pb-6 px-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {filteredItems.map(item => (
                        <div
                          key={item.id}
                          className="hover:shadow-lg transition-all duration-200 hover:scale-105 bg-white border-2 rounded-lg p-5 text-center"
                        >
                          <h3 className="font-semibold mb-3 text-base">{item.name}</h3>
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              className="h-10 w-10 flex items-center justify-center rounded-full p-0 border border-gray-300 bg-white text-gray-700 shadow"
                              style={{ background: "white", color: "#4B5563", border: "1px solid #E5E7EB" }}
                              onClick={() => handleQuantity(item.id, -1)}>
                              <Minus className="w-6 h-6" />
                            </Button>
                            <span className="font-bold text-xl min-w-[2rem] text-center">
                              {quantities[item.id] || 0}
                            </span>
                            <Button
                              className="h-10 w-10 flex items-center justify-center rounded-full p-0 border border-gray-300 bg-white text-gray-700 shadow"
                              style={{ background: "white", color: "#4B5563", border: "1px solid #E5E7EB" }}
                              onClick={() => handleQuantity(item.id, 1)}>
                              <Plus className="w-6 h-6" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 선택한 메뉴 사이드바 */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-10">
            <div className="bg-white rounded-2xl shadow-xl border-0 p-8">
              <div className="pb-6">
                <div className="flex items-center gap-3 text-xl">
  <ShoppingCart className="h-6 w-6 text-green-500" />
  선택한 메뉴
  {selected.length > 0 && (
    <Badge
      className="bg-green-500 hover:bg-green-600 ml-2"
      style={{ verticalAlign: "bottom", marginTop: "10px" }}
    >
      {selected.length}
    </Badge>
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
                            <Button
                              className="h-6 w-6 p-0 text-red-500 hover:bg-red-50 bg-transparent"
                              style={{ background: "none", color: "#EF4444" ,marginTop: "1px" }}
                              onClick={() => setQuantities(q => ({ ...q, [menu.id]: 0 }))}
                            >
                              ×
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-[2px] w-full">
                            <Button
                              className="h-10 w-10 flex items-center justify-center rounded-full p-0 border border-gray-300 bg-white text-gray-700 shadow"
                              style={{ background: "white", color: "#4B5563", border: "1px solid #E5E7EB" , marginLeft: 2, marginRight: 2, height: 28, fontSize: 18}}
                              onClick={() => handleQuantity(menu.id, -1)}>
                              <Minus className="w-6 h-6" />
                            </Button>                      
                              <Input
                                type="number"
                                value={menu.qty}
                                onChange={(e: { target: { value: string; }; }) => {
                                  const newQty = Math.max(0, Number.parseInt(e.target.value) || 0);
                                  setQuantities(q => ({ ...q, [menu.id]: newQty }));
                                }}
                                 className="w-10 h-8 px-1 py-0 text-center border-2 text-base font-bold"
                                 style={{ width: 36, height: 28, fontSize: 12, padding: 0, margin: "0 2px"}}
                                 min="0"/>
                              <Button
                              className="h-10 w-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow"
                              style={{ background: "white", color: "#4B5563", border: "1px solid #E5E7EB",marginLeft: 2, marginRight: 2 , height: 28, fontSize: 18}}
                              onClick={() => handleQuantity(menu.id, 1)}>
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
                              }}>
                            총 <span className="font-bold text-black">{menu.qty}</span>개
                          </span>
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
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                  style={{
                    background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
                    border: "none",
                    width: "80%",         // 버튼의 너비(원하면 100%로)
                    display: "block",     // block으로 만들어야 margin 적용됨
                    margin: "32px auto 0 auto", // (위/가운데/아래) 가운데 정렬
                    maxWidth: "320px",    // 버튼 너무 넓어지지 않도록 제한(원하면 제거)
                  }}
                >
                  마감 등록하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
