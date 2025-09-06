"use client"

// 필요한 React 훅 및 UI 컴포넌트, 아이콘을 가져옵니다.
import { Card, CardContent, CardHeader, CardTitle } from "../components/dashboard/ui/card"
import { TrendingUp, TrendingDown, LineChart, AlertCircle, Loader, DollarSign } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/dashboard/ui/select"
import { Button } from "../components/dashboard/ui/button"
import { CalendarDays } from 'lucide-react'
import { useState, useEffect } from "react"

// --- TypeScript 타입 정의 ---

// 인기/부진 메뉴 데이터 구조 정의
type TopMenu = {
  menu_name: string; // 메뉴 이름
  total_qty: number; // 총 판매 수량
}

// 특이사항 데이터 구조 정의
type ReportNote = {
  close_date: string; // 마감 날짜
  note: string;       // 특이사항 내용
}

// 차트 데이터 포인트 구조 정의
type ChartPoint = {
  label: string;      // x축 레이블 (예: 날짜)
  sales: number;      // 매출액
  tables?: number;    // 테이블 수 (옵션)
  customers?: number; // 고객 수 (옵션)
  isHighest?: boolean;// 최고 매출 지점 여부 (옵션)
  isLowest?: boolean; // 최저 매출 지점 여부 (옵션)
  [key: string]: any; // 다른 추가적인 속성을 허용
};

// 대시보드 전체 데이터 구조 정의
type DashboardData = {
  type: string;       // 데이터 기간 유형 (예: "week", "month")
  sales: number;      // 총 매출
  chartTitle: string; // 차트 제목
  chartData: ChartPoint[]; // 차트에 사용될 데이터 배열
  summary: {
    total: number;      // 총 매출 요약
    average: number;    // 평균 매출
    days: number;       // 데이터 기간(일)
    highest?: ChartPoint; // 최고 매출일 데이터
    lowest?: ChartPoint;  // 최저 매출일 데이터
  };
  weeklyData?: any[];   // 주간 데이터 (현재 미사용)
  lastYearData?: any[]; // 작년 데이터 (현재 미사용)
};

/**
 * 매출 대시보드 컴포넌트
 * - 기간별 매출 데이터, 인기/부진 메뉴, 특이사항을 시각적으로 보여줍니다.
 * - 사용자는 기간을 선택하여 데이터를 필터링할 수 있습니다.
 */
export default function SalesDashboard() {
  // --- 상태 관리 (useState 훅) ---

  // 사용자가 선택한 기간(today, week, month, custom 등)을 저장합니다. 기본값은 'custom'.
  const [selectedPeriod, setSelectedPeriod] = useState("yearly");
  
  // 'custom' 기간 선택 시 사용될 시작 날짜. 기본값은 6일 전.
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  
  // 'custom' 기간 선택 시 사용될 종료 날짜. 기본값은 오늘.
  const [customEndDate, setCustomEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // 상세 정보 모달의 열림/닫힘 상태를 관리합니다.
  const [modalOpen, setModalOpen] = useState(false);
  
  // 사용자가 차트에서 클릭한 특정 데이터 포인트를 저장합니다.
  const [selectedData, setSelectedData] = useState<any>(null);

  // API로부터 받아와 가공된 대시보드 전체 데이터를 저장합니다.
  const [currentData, setCurrentData] = useState<DashboardData | null>(null);
  
  // 상위 5개 인기 메뉴 목록을 저장합니다.
  const [topMenus, setTopMenus] = useState<TopMenu[]>([]);
  
  // 하위 5개 부진 메뉴 목록을 저장합니다.
  const [bottomMenus, setBottomMenus] = useState<TopMenu[]>([]);
  
  // 기간 내 특이사항 목록을 저장합니다.
  const [specialNotes, setSpecialNotes] = useState<ReportNote[]>([]);
  
  // 데이터 로딩 상태를 관리합니다. true이면 로딩 인디케이터를 보여줍니다.
  const [isLoading, setIsLoading] = useState(true);
  
  // 데이터 로딩 중 발생한 오류 메시지를 저장합니다.
  const [error, setError] = useState<string | null>(null);

  // --- 데이터 로딩 및 처리 (useEffect 훅) ---
  useEffect(() => {
    // 비동기 데이터 페칭 함수
    const fetchData = async () => {
      setIsLoading(true); // 로딩 시작
      setError(null);     // 이전 오류 초기화
      // 각 데이터 상태 초기화
      setTopMenus([]);
      setBottomMenus([]);
      setSpecialNotes([]);

      // 선택된 기간에 맞는 시작일과 종료일을 계산합니다.
      const { startDate, endDate } = getDateRangeForPeriod(selectedPeriod, customStartDate, customEndDate);

      // 날짜 범위가 유효하지 않으면 오류를 설정하고 중단합니다.
      if (!startDate || !endDate) {
        setError("Invalid date range.");
        setIsLoading(false);
        return;
      }

      try {
        // 여러 API 엔드포인트에 동시에 요청을 보냅니다.
        const [mainResponse, topMenusResponse, bottomMenusResponse, notesResponse] = await Promise.all([
          fetch(`/api/v1/closing-reports/?start_date=${startDate}&end_date=${endDate}`),      // 기간별 매출 데이터
          fetch(`/api/v1/closing-reports/stats/top-menus?start_date=${startDate}&end_date=${endDate}`), // 인기 메뉴
          fetch(`/api/v1/closing-reports/stats/bottom-menus?start_date=${startDate}&end_date=${endDate}`),// 부진 메뉴
          fetch(`/api/v1/closing-reports/stats/notes?start_date=${startDate}&end_date=${endDate}`)      // 특이사항
        ]);

        // 주 데이터 요청이 실패하면 오류를 발생시킵니다.
        if (!mainResponse.ok) {
          const errorData = await mainResponse.json().catch(() => ({ detail: "서버에서 오류가 발생했습니다." }));
          throw new Error(errorData.detail || `HTTP 오류! 상태: ${mainResponse.status}`);
        }
        
        // 주 데이터를 JSON으로 파싱하고 UI에 맞게 가공합니다.
        const rawData: any[] = await mainResponse.json();
        const processedData = processApiData(rawData, selectedPeriod);
        setCurrentData(processedData);

        // 각 추가 데이터 요청의 성공 여부를 확인하고 상태를 업데이트합니다.
        if (topMenusResponse.ok) setTopMenus(await topMenusResponse.json());
        else console.error("Top menus could not be fetched.");

        if (bottomMenusResponse.ok) setBottomMenus(await bottomMenusResponse.json());
        else console.error("Bottom menus could not be fetched.");

        if (notesResponse.ok) setSpecialNotes(await notesResponse.json());
        else console.error("Special notes could not be fetched.");

      } catch (e: any) {
        // 데이터 페칭 중 오류 발생 시 오류 상태를 설정합니다.
        setError(e.message || "데이터를 불러오는 데 실패했습니다.");
        setCurrentData(null);
      } finally {
        // 모든 과정이 끝나면 로딩 상태를 해제합니다.
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriod, customStartDate, customEndDate]); // 기간 관련 상태가 변경될 때마다 이 훅을 다시 실행합니다.

  // --- 헬퍼 함수 ---

  /**
   * 선택된 기간 문자열에 따라 실제 시작일과 종료일을 계산하여 반환합니다.
   * @param period - "today", "week", "month", "yearly", "custom"
   * @param customStart - 'custom'일 경우 사용될 시작일
   * @param customEnd - 'custom'일 경우 사용될 종료일
   * @returns { startDate: string, endDate: string }
   */
  const getDateRangeForPeriod = (period: string, customStart: string, customEnd: string): { startDate: string, endDate: string } => {
    const today = new Date();
    const formatDate = (d: Date) => d.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
    switch (period) {
      case 'today': return { startDate: formatDate(today), endDate: formatDate(today) };
      case 'week': { const d = new Date(today); d.setDate(d.getDate() - d.getDay()); return { startDate: formatDate(d), endDate: formatDate(today) };}
      case 'month': { const d = new Date(today.getFullYear(), today.getMonth(), 1); return { startDate: formatDate(d), endDate: formatDate(today) };}
      case 'yearly': { const d = new Date(today.getFullYear(), 0, 1); return { startDate: formatDate(d), endDate: formatDate(today) };}
      case 'custom': return { startDate: customStart, endDate: customEnd };
      default: { const d = new Date(); d.setDate(d.getDate() - d.getDay()); return { startDate: formatDate(d), endDate: formatDate(today) };}
    }
  };

  /**
   * API로부터 받은 원시 데이터를 대시보드 UI에 맞는 형태로 가공합니다.
   * @param apiData - API에서 받은 매출 보고서 배열
   * @param period - 현재 선택된 기간
   * @returns {DashboardData} - UI에 필요한 형태로 가공된 데이터 객체
   */
  const processApiData = (apiData: any[], period: string): DashboardData => {
    // 데이터가 없으면 기본 빈 객체를 반환합니다.
    if (!apiData || apiData.length === 0) {
      return { type: period, sales: 0, chartTitle: "데이터 없음", chartData: [], summary: { total: 0, average: 0, days: 0 } };
    }
    // 총 매출, 총 기간, 일평균 매출을 계산합니다.
    const totalSales = apiData.reduce((sum, item) => sum + item.today_sales, 0);
    const totalDays = apiData.length;
    const averageSales = totalDays > 0 ? Math.floor(totalSales / totalDays) : 0;
    
    // 차트 데이터를 생성합니다.
    const chartData: ChartPoint[] = apiData.map(item => ({ 
      label: new Date(item.close_date + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' }), 
      sales: item.today_sales, 
      tables: item.tb_cnt, 
      customers: item.emp_cnt, 
      isHighest: false, 
      isLowest: false 
    }));
    
    // 최고/최저 매출일을 찾아 표시합니다.
    if (chartData.length > 0) {
        const maxSales = Math.max(...chartData.map(d => d.sales));
        const minSales = Math.min(...chartData.map(d => d.sales));
        chartData.forEach(d => { 
          if (d.sales === maxSales) d.isHighest = true; 
          if (d.sales === minSales) d.isLowest = true; 
        });
    }
    
    // 최종 데이터 객체를 구성하여 반환합니다.
    return { 
      type: period, 
      sales: totalSales, 
      chartTitle: "기간별 매출 현황", 
      chartData: chartData.sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime()), // 날짜순 정렬
      summary: { 
        total: totalSales, 
        average: averageSales, 
        days: totalDays, 
        highest: chartData.find(d => d.isHighest), 
        lowest: chartData.find(d => d.isLowest) 
      }, 
      weeklyData: [], 
      lastYearData: [] 
    };
  };

  // 숫자를 통화 형식(원)으로 변환하는 함수
  const formatCurrency = (amount: number) => new Intl.NumberFormat('ko-KR').format(amount) + '원';
  
  // 차트의 데이터 포인트를 클릭했을 때 모달을 여는 함수
  const handleChartClick = (data: any) => { 
    setSelectedData({ ...data, hourlyBreakdown: [], topMenusDetail: [], paymentMethods: [] }); // 클릭한 데이터로 상태 업데이트
    setModalOpen(true); // 모달 열기
  };

  // --- 렌더링 로직 ---

  // 로딩 중일 때 표시할 UI
  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center"><div className="flex items-center space-x-3"><Loader className="w-8 h-8 animate-spin text-blue-500" /><span className="text-lg text-gray-600">데이터를 불러오는 중...</span></div></div>;
  }

  // 오류 발생 시 표시할 UI
  if (error) {
    return <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center"><div className="text-center"><AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" /><h2 className="text-xl font-bold text-red-600">오류 발생</h2><p className="text-gray-600 mt-2">{error}</p><Button onClick={() => window.location.reload()} className="mt-6">새로고침</Button></div></div>;
  }
  
  // 데이터가 없을 때 표시할 UI
  if (!currentData) {
    return <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center"><div className="text-center"><AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h2 className="text-xl font-bold text-gray-600">데이터 없음</h2><p className="text-gray-500 mt-2">선택된 기간에 대한 데이터가 없습니다.</p></div></div>;
  }

  // 메인 대시보드 UI
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 페이지 헤더: 제목 및 기간 선택 컨트롤 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">매출 대시보드</h1>
            <p className="text-gray-600 mt-1">
              {selectedPeriod === "custom" 
                ? `${customStartDate} ~ ${customEndDate}`
                : new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) + " 기준"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3" >
            {/* 기간 선택 드롭다운 */}
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-56 h-11 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 flex items-center gap-2 !text-base !font-medium">
                <CalendarDays className="w-5 h-5" />
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-md">
                {[["today", "오늘"], ["week", "이번 주"], ["month", "이번 달"],["yearly", "연간"], ["custom", "사용자 지정"]].map(([v, label]) => (
                  <SelectItem key={v} value={v} className="hover:bg-gray-100 cursor-pointer min-h-10 px-3 !text-base">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* '사용자 지정' 선택 시 날짜 입력 필드 표시 */}
            {selectedPeriod === "custom" && (
              <div className="flex gap-2">
                <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
                <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
              </div>
            )}
          </div>
        </div>

        {/* 요약 카드 섹션: 총 매출, 일평균, 최고/최저 매출일 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium opacity-90">총 매출</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(currentData.summary.total)}</div><div className="text-sm opacity-90">{currentData.summary.days}일간</div></CardContent></Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium opacity-90">일평균 매출</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(currentData.summary.average)}</div><div className="text-sm opacity-90">하루 평균</div></CardContent></Card>
            {currentData.summary.highest && (<Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium opacity-90">최고 매출일</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{currentData.summary.highest.label}</div><div className="text-sm opacity-90">{formatCurrency(currentData.summary.highest.sales)}</div></CardContent></Card>)}
            {currentData.summary.lowest && (<Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium opacity-90">최저 매출일</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{currentData.summary.lowest.label}</div><div className="text-sm opacity-90">{formatCurrency(currentData.summary.lowest.sales)}</div></CardContent></Card>)}
        </div>

        {/* 매출 추이 차트 섹션 */}
        <Card>
          <CardHeader><CardTitle className="flex items-center"><LineChart className="w-5 h-5 mr-2 text-blue-500" />{currentData.chartTitle}</CardTitle></CardHeader>
          <CardContent>
            <div className="relative h-80 bg-gray-50 rounded-lg p-4">
              {currentData.chartData.length > 0 ? (
                // SVG를 이용한 커스텀 차트 렌더링
                <svg className="w-full h-full" viewBox="0 0 800 250">
                  {/* 차트 배경 그라데이션 정의 */}
                  <defs><linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" /></linearGradient></defs>
                  {/* Y축 그리드 및 레이블 */}
                  {[0, 0.25, 0.5, 0.75, 1].map(f => { const y = 210 - (f * 200); const maxSales = Math.max(...currentData.chartData.map(d => d.sales)) || 1; const label = formatCurrency(maxSales * f).replace("원", ""); return (<g key={f}><line x1="0" y1={y} x2="800" y2={y} stroke="#E5E7EB" strokeWidth="1" /><text x="-10" y={y+5} textAnchor="end" className="text-xs fill-gray-500">{label}</text></g>)})}
                  {/* 매출 영역 경로 */}
                  <path d={`M 0 230 ${currentData.chartData.map((item, index) => { const x = (index / (currentData.chartData.length - 1)) * 800; const maxSales = Math.max(...currentData.chartData.map(d => d.sales)) || 1; const y = 210 - (item.sales / maxSales) * 200; return `L ${x} ${y}`;}).join(' ')} L 800 230 Z`} fill="url(#areaGradient)" />
                  {/* 매출 라인 및 데이터 포인트 */}
                  {currentData.chartData.map((item, index) => { const x = (index / (currentData.chartData.length - 1)) * 800; const maxSales = Math.max(...currentData.chartData.map(d => d.sales)) || 1; const y = 210 - (item.sales / maxSales) * 200; const nextItem = currentData.chartData[index + 1]; return (<g key={index}>{nextItem && (<line x1={x} y1={y} x2={(index + 1) / (currentData.chartData.length - 1) * 800} y2={210 - (nextItem.sales / maxSales) * 200} stroke="#3B82F6" strokeWidth="2" />)}<circle cx={x} cy={y} r={item.isHighest || item.isLowest ? "5" : "3"} fill={item.isHighest ? "#EF4444" : item.isLowest ? "#F59E0B" : "#3B82F6"} stroke="white" strokeWidth="2" className="cursor-pointer hover:r-6 transition-all" onClick={() => handleChartClick(item)} /><text x={x} y={240} textAnchor="middle" className="text-xs fill-gray-600">{item.label}</text></g>)})}
                </svg>
              ) : (
                <div className="flex items-center justify-center h-full"><p className="text-gray-500">차트 데이터를 표시할 수 없습니다.</p></div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 하단 상세 정보: 인기 메뉴, 개선 필요 메뉴, 특이사항 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 인기 메뉴 TOP 5 카드 */}
          <Card>
            <CardHeader><CardTitle className="flex items-center text-green-600"><TrendingUp className="w-5 h-5 mr-2" />인기 메뉴 TOP 5</CardTitle></CardHeader>
            <CardContent>
              {topMenus.length > 0 ? (
                <div className="space-y-3">
                  {topMenus.map((menu, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</div>
                        <span className="font-medium">{menu.menu_name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-green-600">{menu.total_qty}개</div>
                        <div className="text-xs text-gray-500">판매됨</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">기간 내 메뉴 데이터가 없습니다.</p>
              )}
            </CardContent>
          </Card>
          {/* 개선 필요 메뉴 카드 */}
          <Card>
            <CardHeader><CardTitle className="flex items-center text-red-600"><TrendingDown className="w-5 h-5 mr-2" />개선 필요 메뉴</CardTitle></CardHeader>
            <CardContent>
              {bottomMenus.length > 0 ? (
                <div className="space-y-3">
                  {bottomMenus.map((menu, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">{index + 1}</div>
                        <span className="font-medium">{menu.menu_name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-red-600">{menu.total_qty}개</div>
                        <div className="text-xs text-gray-500">판매됨</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">기간 내 메뉴 데이터가 없습니다.</p>
              )}
            </CardContent>
          </Card>
          {/* 기간별 특이사항 카드 */}
          <Card>
            <CardHeader><CardTitle className="flex items-center text-purple-600"><DollarSign className="w-5 h-5 mr-2" />기간별 특이사항</CardTitle></CardHeader>
            <CardContent>
              {specialNotes.length > 0 ? (
                <div className="space-y-3">
                  {specialNotes.map((note, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm font-medium text-purple-700">{note.close_date}: {note.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">기간 내 특이사항이 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 상세 데이터 모달 */}
        {modalOpen && selectedData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedData.label} 상세 분석</h2>
                  <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-2xl font-bold">×</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg text-center"><div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedData.sales)}</div><div className="text-sm text-gray-600">총 매출</div></div>
                  <div className="bg-green-50 p-4 rounded-lg text-center"><div className="text-2xl font-bold text-green-600">{selectedData.tables}개</div><div className="text-sm text-gray-600">테이블 수</div></div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center"><div className="text-2xl font-bold text-purple-600">{selectedData.customers}명</div><div className="text-sm text-gray-600">방문 고객 (직원 수)</div></div>
                </div>
                {/* TODO: 모달 내부에 시간대별 분석, 메뉴별 상세, 결제수단 등 추가 데이터 표시 영역 */}
                <div className="mt-8 flex justify-end">
                  <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">닫기</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}