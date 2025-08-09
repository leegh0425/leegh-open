"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../components/dashboard/ui/card"
import { Badge } from "../components/dashboard/ui/badge"
import { TrendingUp, TrendingDown, Calendar, Users, DollarSign, Target, BarChart3, LineChart } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/dashboard/ui/select"
import { Button } from "../components/dashboard/ui/button"
import { CalendarDays, Filter } from 'lucide-react'
import { useState, useMemo } from "react"

export default function SalesDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("today")
  const [customStartDate, setCustomStartDate] = useState("2025-08-01")
  const [customEndDate, setCustomEndDate] = useState("2025-08-21")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedData, setSelectedData] = useState<any>(null)
  const [chartUnit, setChartUnit] = useState("auto") // auto, daily, weekly, monthly

  // 기간 분석 함수
  const analyzePeriod = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 31) return "daily"
    if (diffDays <= 90) return "weekly"
    return "monthly"
  }

  type ChartPoint = {
    label: string
    sales: number
    isHighest?: boolean
    isLowest?: boolean
  }

  type SummaryInfo = {
    total: number
    average: number
    highest?: ChartPoint
    lowest?: ChartPoint
  }

  type DashboardBlock = {
    type: string
    sales: number
    chartTitle: string
    chartData: ChartPoint[]
    lastYearData?: ChartPoint[]
    summary?: SummaryInfo
    weeklyData?: Array<{
      label: string
      sales: number
    }>
  }

  type Summary = {
    total: number
    average: number
    days?: number
    highest?: unknown
    lowest?: unknown
  }

  function hasSummary(
    d: unknown
  ): d is { summary: Summary } {
    return !!d && typeof d === "object" && "summary" in (d as any) && (d as any).summary != null
  }

  type WeeklyPoint = { label: string; sales: number };

  function hasWeeklyData(d: unknown): d is { weeklyData: WeeklyPoint[] } {
    return !!d && typeof d === "object" && "weeklyData" in (d as any);
  }

  // 스마트 데이터 생성
  const generateSmartData = (period: string, startDate?: string, endDate?: string) => {
    if (period === "custom" && startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffTime = Math.abs(end.getTime() - start.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // 2025-08-01 ~ 2025-08-21 (21일) 케이스
      if (diffDays <= 31) {
        const dailyData = []
        const weeklyData = []
        let totalSales = 0
        
        // 일별 데이터 생성
        for (let i = 0; i <= diffDays; i++) {
          const currentDate = new Date(start)
          currentDate.setDate(start.getDate() + i)
          const sales = Math.floor(Math.random() * 2000000) + 1000000
          totalSales += sales
          
          dailyData.push({
            label: `${currentDate.getDate()}일`,
            sales,
            tables: Math.floor(sales / 30000),
            customers: Math.floor(sales / 15000),
            isHighest: false
          })
        }
        
        // 최고값 표시
        const maxSales = Math.max(...dailyData.map(d => d.sales))
        dailyData.forEach(d => {
          if (d.sales === maxSales) d.isHighest = true
        })
        
        // 주차별 데이터 생성
        const weeksCount = Math.ceil(diffDays / 7)
        for (let week = 1; week <= weeksCount; week++) {
          const weekStart = (week - 1) * 7
          const weekEnd = Math.min(week * 7, diffDays + 1)
          const weekSales = dailyData.slice(weekStart, weekEnd).reduce((sum, day) => sum + day.sales, 0)
          
          weeklyData.push({
            label: `${week}주차`,
            sales: weekSales,
            tables: Math.floor(weekSales / 30000),
            customers: Math.floor(weekSales / 15000),
            isHighest: false
          })
        }
        
        const maxWeekSales = Math.max(...weeklyData.map(d => d.sales))
        weeklyData.forEach(d => {
          if (d.sales === maxWeekSales) d.isHighest = true
        })
        
        return {
          type: "custom_daily",
          sales: totalSales,
          averageDaily: Math.floor(totalSales / (diffDays + 1)),
          chartTitle: "일별 매출 현황",
          chartData: dailyData,
          weeklyData,
          summary: {
            total: totalSales,
            average: Math.floor(totalSales / (diffDays + 1)),
            days: diffDays + 1
          }
        }
      }
      
      // 2025-01-01 ~ 2025-12-31 (1년) 케이스
      if (diffDays > 300) {
        const monthlyData = []
        const lastYearData = []
        let totalSales = 0
        
        const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
        
        for (let i = 0; i < 12; i++) {
          const sales = Math.floor(Math.random() * 50000000) + 30000000
          const lastYearSales = Math.floor(Math.random() * 45000000) + 25000000
          totalSales += sales
          
          monthlyData.push({
            label: months[i],
            sales,
            tables: Math.floor(sales / 30000),
            customers: Math.floor(sales / 15000),
            isHighest: false,
            isLowest: false,
            lastYearSales,
            growth: ((sales - lastYearSales) / lastYearSales * 100).toFixed(1)
          })
          
          lastYearData.push({
            label: months[i],
            sales: lastYearSales
          })
        }
        
        const maxSales = Math.max(...monthlyData.map(d => d.sales))
        const minSales = Math.min(...monthlyData.map(d => d.sales))
        monthlyData.forEach(d => {
          if (d.sales === maxSales) d.isHighest = true
          if (d.sales === minSales) d.isLowest = true
        })
        
        return {
          type: "custom_yearly",
          sales: totalSales,
          chartTitle: "월별 매출 현황",
          chartData: monthlyData,
          lastYearData,
          summary: {
            total: totalSales,
            average: Math.floor(totalSales / 12),
            highest: monthlyData.find(d => d.isHighest),
            lowest: monthlyData.find(d => d.isLowest)
          }
        }
      }
    }
    
    // 기존 데이터 구조
    const baseData = {
      today: {
        type: "today",
        sales: 2450000,
        chartTitle: "동일 요일 매출 비교 (수요일)",
        chartData: [
          { label: "지지난주", sales: 2100000, tables: 72, customers: 115, isHighest: false },
          { label: "지난주", sales: 2300000, tables: 78, customers: 125, isHighest: false },
          { label: "이번주", sales: 2450000, tables: 84, customers: 139, isHighest: true },
          { label: "다음주", sales: 2600000, tables: 88, customers: 142, isHighest: false },
          { label: "다다음주", sales: 2200000, tables: 75, customers: 120, isHighest: false }
        ]
      },
      week: {
        type: "week",
        sales: 16800000,
        chartTitle: "요일별 매출 현황",
        chartData: [
          { label: "월요일", sales: 1800000, tables: 65, customers: 98, isHighest: false },
          { label: "화요일", sales: 2100000, tables: 72, customers: 115, isHighest: false },
          { label: "수요일", sales: 2300000, tables: 78, customers: 125, isHighest: false },
          { label: "목요일", sales: 2600000, tables: 85, customers: 142, isHighest: false },
          { label: "금요일", sales: 3200000, tables: 95, customers: 168, isHighest: false },
          { label: "토요일", sales: 3800000, tables: 110, customers: 195, isHighest: true },
          { label: "일요일", sales: 2900000, tables: 88, customers: 156, isHighest: false }
        ]
      },
      month: {
        type: "month",
        sales: 45600000,
        chartTitle: "일별 매출 현황 (상위 7일)",
        chartData: [
          { label: "8/1", sales: 3800000, tables: 110, customers: 195, isHighest: true },
          { label: "8/2", sales: 3200000, tables: 95, customers: 168, isHighest: false },
          { label: "8/3", sales: 2900000, tables: 88, customers: 156, isHighest: false },
          { label: "8/4", sales: 2600000, tables: 85, customers: 142, isHighest: false },
          { label: "8/5", sales: 2300000, tables: 78, customers: 125, isHighest: false },
          { label: "8/6", sales: 2450000, tables: 84, customers: 139, isHighest: false },
          { label: "8/7", sales: 2100000, tables: 72, customers: 115, isHighest: false }
        ]
      },
      yearly: {
        type: "yearly",
        sales: 485600000,
        chartTitle: "월별 매출 현황",
        chartData: [
          { label: "1월", sales: 38200000, tables: 1980, customers: 3120, isHighest: false, lastYearSales: 35000000 },
          { label: "2월", sales: 35400000, tables: 1850, customers: 2890, isHighest: false, lastYearSales: 32000000 },
          { label: "3월", sales: 42300000, tables: 2180, customers: 3420, isHighest: false, lastYearSales: 39000000 },
          { label: "4월", sales: 39800000, tables: 2050, customers: 3200, isHighest: false, lastYearSales: 37000000 },
          { label: "5월", sales: 45200000, tables: 2340, customers: 3680, isHighest: false, lastYearSales: 41000000 },
          { label: "6월", sales: 48600000, tables: 2520, customers: 3950, isHighest: false, lastYearSales: 44000000 },
          { label: "7월", sales: 54900000, tables: 2860, customers: 4440, isHighest: true, lastYearSales: 49000000 },
          { label: "8월", sales: 45600000, tables: 2280, customers: 3680, isHighest: false, lastYearSales: 42000000 },
          { label: "9월", sales: 41200000, tables: 2140, customers: 3350, isHighest: false, lastYearSales: 38000000 },
          { label: "10월", sales: 43800000, tables: 2270, customers: 3560, isHighest: false, lastYearSales: 40000000 },
          { label: "11월", sales: 39900000, tables: 2070, customers: 3240, isHighest: false, lastYearSales: 36000000 },
          { label: "12월", sales: 50700000, tables: 2630, customers: 4120, isHighest: false, lastYearSales: 46000000 }
        ]
      },
      quarter: {
        type: "quarter",
        sales: 142800000,
        chartTitle: "분기별 매출 현황",
        chartData: [
          { label: "1분기", sales: 38200000, tables: 1980, customers: 3120, isHighest: false },
          { label: "2분기", sales: 42300000, tables: 2180, customers: 3420, isHighest: false },
          { label: "3분기", sales: 54900000, tables: 2860, customers: 4440, isHighest: true },
          { label: "4분기", sales: 45600000, tables: 2280, customers: 3680, isHighest: false }
        ]
      }
    }
    
    return baseData[period as keyof typeof baseData] || baseData.today
  }

  const currentData = useMemo(() => {
    return generateSmartData(selectedPeriod, customStartDate, customEndDate)
  }, [selectedPeriod, customStartDate, customEndDate])

  const handleChartClick = (data: any) => {
    const detailData = {
      ...data,
      hourlyBreakdown: [
        { time: "10:00", sales: Math.floor(data.sales * 0.05), customers: Math.floor(data.customers * 0.05) },
        { time: "11:00", sales: Math.floor(data.sales * 0.08), customers: Math.floor(data.customers * 0.08) },
        { time: "12:00", sales: Math.floor(data.sales * 0.15), customers: Math.floor(data.customers * 0.15) },
        { time: "13:00", sales: Math.floor(data.sales * 0.12), customers: Math.floor(data.customers * 0.12) },
        { time: "14:00", sales: Math.floor(data.sales * 0.08), customers: Math.floor(data.customers * 0.08) },
        { time: "15:00", sales: Math.floor(data.sales * 0.06), customers: Math.floor(data.customers * 0.06) },
        { time: "16:00", sales: Math.floor(data.sales * 0.07), customers: Math.floor(data.customers * 0.07) },
        { time: "17:00", sales: Math.floor(data.sales * 0.09), customers: Math.floor(data.customers * 0.09) },
        { time: "18:00", sales: Math.floor(data.sales * 0.12), customers: Math.floor(data.customers * 0.12) },
        { time: "19:00", sales: Math.floor(data.sales * 0.10), customers: Math.floor(data.customers * 0.10) },
        { time: "20:00", sales: Math.floor(data.sales * 0.08), customers: Math.floor(data.customers * 0.08) }
      ],
      topMenusDetail: [
        { name: "삼겹살", sales: Math.floor(data.sales * 0.18), orders: Math.floor(data.customers * 0.15) },
        { name: "소주", sales: Math.floor(data.sales * 0.15), orders: Math.floor(data.customers * 0.25) },
        { name: "김치찌개", sales: Math.floor(data.sales * 0.13), orders: Math.floor(data.customers * 0.12) },
        { name: "된장찌개", sales: Math.floor(data.sales * 0.11), orders: Math.floor(data.customers * 0.10) },
        { name: "계란말이", sales: Math.floor(data.sales * 0.10), orders: Math.floor(data.customers * 0.08) }
      ],
      paymentMethods: [
        { method: "카드결제", amount: Math.floor(data.sales * 0.75), percentage: 75 },
        { method: "현금결제", amount: Math.floor(data.sales * 0.15), percentage: 15 },
        { method: "기타", amount: Math.floor(data.sales * 0.10), percentage: 10 }
      ]
    }
    setSelectedData(detailData)
    setModalOpen(true)
  }

  // 카테고리별 상세 데이터
  const categoryDetails = [
    {
      name: "주류",
      data: [
        { name: "소주", percentage: 45.2, sales: 1800000, color: "#3B82F6" },
        { name: "맥주", percentage: 32.1, sales: 1280000, color: "#60A5FA" },
        { name: "막걸리", percentage: 15.3, sales: 612000, color: "#93C5FD" },
        { name: "와인", percentage: 7.4, sales: 296000, color: "#DBEAFE" }
      ],
      total: 3988000,
      color: "blue"
    },
    {
      name: "메인메뉴",
      data: [
        { name: "삼겹살", percentage: 38.5, sales: 2200000, color: "#EF4444" },
        { name: "갈비", percentage: 28.2, sales: 1610000, color: "#F87171" },
        { name: "불고기", percentage: 20.1, sales: 1148000, color: "#FCA5A5" },
        { name: "닭갈비", percentage: 13.2, sales: 754000, color: "#FECACA" }
      ],
      total: 5712000,
      color: "red"
    },
    {
      name: "사이드메뉴",
      data: [
        { name: "김치찌개", percentage: 35.8, sales: 980000, color: "#10B981" },
        { name: "된장찌개", percentage: 28.4, sales: 778000, color: "#34D399" },
        { name: "계란말이", percentage: 22.1, sales: 605000, color: "#6EE7B7" },
        { name: "파전", percentage: 13.7, sales: 375000, color: "#A7F3D0" }
      ],
      total: 2738000,
      color: "green"
    },
    {
      name: "음료/디저트",
      data: [
        { name: "콜라", percentage: 42.3, sales: 320000, color: "#F59E0B" },
        { name: "사이다", percentage: 28.7, sales: 217000, color: "#FBBF24" },
        { name: "아이스크림", percentage: 18.2, sales: 138000, color: "#FCD34D" },
        { name: "커피", percentage: 10.8, sales: 82000, color: "#FDE68A" }
      ],
      total: 757000,
      color: "yellow"
    }
  ]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount) + '원'
  }

  const topMenus = [
    { name: "삼겹살", sales: 450000, orders: 45 },
    { name: "소주", sales: 380000, orders: 76 },
    { name: "김치찌개", sales: 320000, orders: 32 },
    { name: "된장찌개", sales: 280000, orders: 28 },
    { name: "계란말이", sales: 240000, orders: 24 }
  ]

  const bottomMenus = [
    { name: "사과", sales: 45000, orders: 3 },
    { name: "아이스크림", sales: 52000, orders: 4 },
    { name: "과일주스", sales: 68000, orders: 5 },
    { name: "샐러드", sales: 75000, orders: 6 },
    { name: "디저트세트", sales: 89000, orders: 7 }
  ]

  const specialNotes = [
    "웨이팅", "단체예약", "이벤트", "할인", "프로모션", "VIP고객", "생일파티", "회식", "데이트", "가족모임"
  ]

  const barColors = [
    "#3B82F6", // blue
    "#EF4444", // red
    "#10B981", // green
    "#F59E0B", // orange
    "#8B5CF6", // purple
    "#EC4899", // pink
    "#6B7280", // gray
    "#06B6D4", // cyan
    "#F43F5E", // rose
    "#A855F7", // violet
    "#EAB308", // yellow
    "#22C55E", // emerald
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 및 기간 선택 */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">매출 대시보드</h1>
            <p className="text-gray-600 mt-1">
              {selectedPeriod === "today" && "2025년 8월 6일 기준"}
              {selectedPeriod === "week" && "2025년 8월 1일 ~ 8월 6일"}
              {selectedPeriod === "month" && "2025년 8월"}
              {selectedPeriod === "yearly" && "2025년 전체"}
              {selectedPeriod === "quarter" && "2025년 3분기"}
              {selectedPeriod === "custom" && `${customStartDate} ~ ${customEndDate}`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <CalendarDays className="w-4 h-4 mr-2" />
                <SelectValue placeholder="기간 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">오늘</SelectItem>
                <SelectItem value="week">이번 주</SelectItem>
                <SelectItem value="month">이번 달</SelectItem>
                <SelectItem value="yearly">연간 (1월~12월)</SelectItem>
                <SelectItem value="quarter">분기</SelectItem>
                <SelectItem value="custom">사용자 지정</SelectItem>
              </SelectContent>
            </Select>
            
            {selectedPeriod === "custom" && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            )}
            
            <Badge variant="outline" className="text-sm px-3 py-1 self-start">
              <Filter className="w-3 h-3 mr-1" />
              실시간 업데이트
            </Badge>
          </div>
        </div>

        {/* 사용자 지정 기간 요약 카드 */}
        {selectedPeriod === "custom" && hasSummary(currentData) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">총 매출</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(currentData.summary.total)}</div>
                <div className="text-sm opacity-90">
                  {currentData.summary.days && `${currentData.summary.days}일간`}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">일평균 매출</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold"> {hasSummary(currentData) ? formatCurrency(currentData.summary.average) : "-"}</div>
                <div className="text-sm opacity-90">하루 평균</div>
              </CardContent>
            </Card>

            {currentData.summary.highest && (
              <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">최고 매출월</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentData.summary.highest.label}</div>
                  <div className="text-sm opacity-90">{formatCurrency(currentData.summary.highest.sales)}</div>
                </CardContent>
              </Card>
            )}

            {currentData.summary.lowest && (
              <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium opacity-90">최저 매출월</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentData.summary.lowest.label}</div>
                  <div className="text-sm opacity-90">{formatCurrency(currentData.summary.lowest.sales)}</div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* 기본 KPI 카드 (사용자 지정이 아닐 때) */}
        {selectedPeriod !== "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">
                  {selectedPeriod === "today" ? "오늘 매출" : 
                   selectedPeriod === "week" ? "주간 매출" :
                   selectedPeriod === "month" ? "월간 매출" :
                   selectedPeriod === "yearly" ? "연간 매출" :
                   selectedPeriod === "quarter" ? "분기 매출" : "기간 매출"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(currentData.sales)}</div>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  전일 대비 +8.2%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">월 누계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(45600000)}</div>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  전월 대비 +12.5%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">최고 매출일</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(3200000)}</div>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  <Calendar className="w-4 h-4 mr-1" />
                  2025-08-03
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium opacity-90">현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">84테이블</div>
                <div className="flex items-center mt-2 text-sm opacity-90">
                  <Users className="w-4 h-4 mr-1" />
                  139명 방문
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 gap-6">
          {/* 메인 차트 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  {currentData.type === "custom_daily" ? (
                    <LineChart className="w-5 h-5 mr-2 text-blue-500" />
                  ) : (
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                  )}
                  {currentData.chartTitle}
                </CardTitle>
                
                {selectedPeriod === "custom" && hasWeeklyData(currentData) && (
                  <div className="flex gap-2">
                    <Button
                      variant={chartUnit === "daily" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartUnit("daily")}
                    >
                      일별
                    </Button>
                    {currentData.weeklyData && (
                      <Button
                        variant={chartUnit === "weekly" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setChartUnit("weekly")}
                      >
                        주별
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* 사용자 지정 기간 - 일별 꺾은선 그래프 */}
              {currentData.type === "custom_daily" && chartUnit !== "weekly" && (
                <div className="relative h-64 bg-gray-50 rounded-lg p-4">
                  <svg className="w-full h-full" viewBox="0 0 800 200">
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    
                    {/* 그리드 라인 */}
                    {[0, 50, 100, 150, 200].map(y => (
                      <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#E5E7EB" strokeWidth="0.5" />
                    ))}
                    
                    {/* 면적 그래프 */}
                    <path
                      d={`M 0 200 ${currentData.chartData.map((item: any, index: number) => {
                        const x = (index / (currentData.chartData.length - 1)) * 800
                        const maxSales = Math.max(...currentData.chartData.map((d: any) => d.sales))
                        const y = 180 - (item.sales / maxSales) * 160
                        return `L ${x} ${y}`
                      }).join(' ')} L 800 200 Z`}
                      fill="url(#areaGradient)"
                    />
                    
                    {/* 데이터 라인과 포인트 */}
                    {currentData.chartData.map((item: any, index: number) => {
                      const x = (index / (currentData.chartData.length - 1)) * 800
                      const maxSales = Math.max(...currentData.chartData.map((d: any) => d.sales))
                      const y = 180 - (item.sales / maxSales) * 160
                      const nextItem = currentData.chartData[index + 1]
                      
                      return (
                        <g key={index}>
                          {/* 라인 */}
                          {nextItem && (
                            <line
                              x1={x}
                              y1={y}
                              x2={(index + 1) / (currentData.chartData.length - 1) * 800}
                              y2={180 - (nextItem.sales / maxSales) * 160}
                              stroke="#3B82F6"
                              strokeWidth="3"
                            />
                          )}
                          {/* 포인트 */}
                          <circle
                            cx={x}
                            cy={y}
                            r={item.isHighest ? "6" : "4"}
                            fill={item.isHighest ? "#EF4444" : "#3B82F6"}
                            stroke="white"
                            strokeWidth="2"
                            className="cursor-pointer hover:r-6 transition-all"
                            onClick={() => handleChartClick(item)}
                          />
                          {item.isHighest && (
                            <circle cx={x} cy={y} r="8" fill="none" stroke="#EF4444" strokeWidth="2" opacity="0.5">
                              <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                              <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
                            </circle>
                          )}
                          {/* 라벨 */}
                          <text x={x} y="195" textAnchor="middle" className="text-xs fill-gray-600">
                            {item.label}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>
              )}

              {/* 주별 바 차트 */}
              {hasWeeklyData(currentData) &&  chartUnit === "weekly" && (
                <div className="space-y-4">
                  {currentData.weeklyData.map((item: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={() => handleChartClick(item)}
                    >
                      <div className="w-16 text-sm font-medium text-gray-600">{item.label}</div>
                      <div className="flex-1 relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${item.isHighest ? 'text-red-600 font-bold' : ''}`}>
                            {formatCurrency(item.sales)}
                            {item.isHighest && <span className="ml-2 text-red-500">🔥 최고!</span>}
                          </span>
                          <span className="text-xs text-gray-500">{item.tables}테이블 / {item.customers}명</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              item.isHighest 
                                ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg' 
                                : 'bg-gradient-to-r from-blue-400 to-blue-500'
                            }`}
                            style={{ width: `${(item.sales / Math.max(...currentData.weeklyData.map((d: any) => d.sales))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* 연간 비교 차트 (세로 막대) */}
            {(currentData.type === "custom_yearly" || currentData.type === "yearly") && (
              <div className="relative h-80 bg-gray-50 rounded-lg p-4 overflow-x-auto">
                <div className="flex h-full items-end justify-around gap-4 pb-8 pt-4">
                  {currentData.chartData.map((item: any, index: number) => {
                    const maxSales = Math.max(...currentData.chartData.map((d: any) => d.sales));
                    const barHeight = (item.sales / maxSales) * 180; // Max height for current year bar
                    const prevYearBarHeight = (item.lastYearSales / maxSales) * 180; // Max height for previous year bar

                    const barColor = barColors[index % barColors.length];
                    const growthColor = item.growth > 0 ? "text-green-600" : "text-red-600";

                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center justify-end w-1/12 min-w-[40px] cursor-pointer group"
                        onClick={() => handleChartClick(item)}
                      >
                        {/* 성장률 텍스트 */}
                        {item.growth && (
                          <span className={`text-[10px] font-semibold mb-1 ${growthColor}`}>
                            {item.growth > 0 ? '▲' : '▼'} {Math.abs(item.growth)}%
                          </span>
                        )}
                        {/* 매출액 텍스트 */}
                        <span className="text-xs font-bold text-gray-800 mb-1">
                          {formatCurrency(item.sales).replace('원', '')}
                        </span>

                        {/* 막대 그래프 컨테이너 */}
                        <div className="relative w-full h-[180px] flex items-end justify-center">
                          {/* 전년도 라인 (수평선) */}
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-gray-400 h-[2px] rounded-full transition-all duration-500"
                            style={{ bottom: `${prevYearBarHeight}px` }}
                          />
                          {/* 현재 연도 막대 */}
                          <div
                            className={`w-full rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-80 ${
                              item.isHighest 
                                ? 'bg-gradient-to-t from-red-500 to-red-600 shadow-lg' 
                                : item.isLowest
                                ? 'bg-gradient-to-t from-blue-400 to-blue-500'
                                : `bg-gradient-to-t from-[${barColor}] to-[${barColor}]`
                            }`}
                            style={{ height: `${barHeight}px`, backgroundColor: barColor }}
                          ></div>
                          {/* 최고/최저 포인트 */}
                          {(item.isHighest || item.isLowest) && (
                            <div className={`absolute -top-2 left-1/2 -translate-x-1/2 size-3 rounded-full border-2 border-white ${
                              item.isHighest ? 'bg-red-500' : 'bg-blue-500'
                            }`}>
                              <div className="absolute inset-0 rounded-full animate-ping-slow" style={{ backgroundColor: item.isHighest ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.5)' }}></div>
                            </div>
                          )}
                        </div>
                        
                        {/* 라벨 */}
                        <span className="text-sm text-gray-700 mt-2">{item.label}</span>
                        {/* 전년 매출 텍스트 */}
                        <span className="text-xs text-gray-400 mt-1">
                          전년: {formatCurrency(item.lastYearSales).replace('원', '')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

              {/* 기본 차트 (사용자 지정이 아닐 때) */}
              {!currentData.type?.startsWith("custom") && currentData.type !== "yearly" && (
                <div className="space-y-4">
                  {currentData.chartData.map((item: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                      onClick={() => handleChartClick(item)}
                    >
                      <div className="w-16 text-sm font-medium text-gray-600">{item.label}</div>
                      <div className="flex-1 relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${item.isHighest ? 'text-red-600 font-bold' : ''}`}>
                            {formatCurrency(item.sales)}
                            {item.isHighest && <span className="ml-2 text-red-500">🔥 최고!</span>}
                          </span>
                          <span className="text-xs text-gray-500">{item.tables}테이블 / {item.customers}명</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              item.isHighest 
                                ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg' 
                                : 'bg-gradient-to-r from-blue-400 to-blue-500'
                            }`}
                            style={{ width: `${(item.sales / Math.max(...currentData.chartData.map((d: any) => d.sales))) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 카테고리별 상세 분석 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {categoryDetails.map((category, categoryIndex) => (
            <Card key={categoryIndex}>
              <CardHeader>
                <CardTitle className={`flex items-center text-${category.color}-600`}>
                  <Target className="w-5 h-5 mr-2" />
                  {category.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-4">
                  {/* 개별 원형 차트 */}
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {(() => {
                        let cumulativePercentage = 0
                        return category.data.map((item, index) => {
                          const startAngle = (cumulativePercentage / 100) * 360
                          const endAngle = ((cumulativePercentage + item.percentage) / 100) * 360
                          const largeArcFlag = item.percentage > 50 ? 1 : 0
                          
                          const startAngleRad = (startAngle * Math.PI) / 180
                          const endAngleRad = (endAngle * Math.PI) / 180
                          
                          const x1 = 50 + 40 * Math.cos(startAngleRad)
                          const y1 = 50 + 40 * Math.sin(startAngleRad)
                          const x2 = 50 + 40 * Math.cos(endAngleRad)
                          const y2 = 50 + 40 * Math.sin(endAngleRad)
                          
                          const pathData = [
                            `M 50 50`,
                            `L ${x1} ${y1}`,
                            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            'Z'
                          ].join(' ')
                          
                          const result = (
                            <path
                              key={index}
                              d={pathData}
                              fill={item.color}
                              stroke="white"
                              strokeWidth="1"
                              className="hover:opacity-80 transition-opacity cursor-pointer"
                              onClick={() => handleChartClick({
                                label: item.name,
                                sales: item.sales,
                                tables: Math.floor(item.sales / 30000),
                                customers: Math.floor(item.sales / 15000),
                                category: category.name,
                                percentage: item.percentage
                              })}
                            />
                          )
                          
                          cumulativePercentage += item.percentage
                          return result
                        })
                      })()}
                    </svg>
                    
                    {/* 중앙 텍스트 */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs font-bold text-gray-800">{formatCurrency(category.total)}</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 범례 */}
                <div className="space-y-2">
                  {category.data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <span className="text-gray-500">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 메뉴 순위 및 특이사항 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top 5 메뉴 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-green-600">
                <TrendingUp className="w-5 h-5 mr-2" />
                인기 메뉴 TOP 5
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topMenus.map((menu, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{menu.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-green-600">{formatCurrency(menu.sales)}</div>
                      <div className="text-xs text-gray-500">{menu.orders}주문</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 하위 5개 메뉴 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-red-600">
                <TrendingDown className="w-5 h-5 mr-2" />
                개선 필요 메뉴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {bottomMenus.map((menu, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{menu.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-600">{formatCurrency(menu.sales)}</div>
                      <div className="text-xs text-gray-500">{menu.orders}주문</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 특이사항 워드클라우드 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-purple-600">
                <DollarSign className="w-5 h-5 mr-2" />
                {selectedPeriod === "today" ? "오늘의 특이사항" : 
                 selectedPeriod === "week" ? "주간 특이사항" :
                 selectedPeriod === "month" ? "월간 특이사항" : "기간별 특이사항"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {specialNotes.map((note, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className={`
                      ${index % 4 === 0 ? 'text-blue-600 border-blue-200 bg-blue-50' : ''}
                      ${index % 4 === 1 ? 'text-green-600 border-green-200 bg-green-50' : ''}
                      ${index % 4 === 2 ? 'text-purple-600 border-purple-200 bg-purple-50' : ''}
                      ${index % 4 === 3 ? 'text-orange-600 border-orange-200 bg-orange-50' : ''}
                      ${Math.random() > 0.5 ? 'text-lg px-3 py-1' : 'text-sm px-2 py-1'}
                    `}
                  >
                    {note}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>주요 이벤트:</strong> 단체예약 3건, VIP고객 방문, 생일파티 2건
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 추이 예측 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" />
              매출 추이 및 예측
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-2">↗️ 성장세</div>
                <div className="text-sm text-gray-600">주간 평균 12.5% 증가</div>
                <div className="text-xs text-gray-500 mt-1">지속적인 상승 추세</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-2">📈 예상 매출</div>
                <div className="text-sm text-gray-600">내일: 2,650,000원</div>
                <div className="text-xs text-gray-500 mt-1">금요일 패턴 기준</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-2">🎯 월말 목표</div>
                <div className="text-sm text-gray-600">달성률: 78.5%</div>
                <div className="text-xs text-gray-500 mt-1">목표까지 12,400,000원</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 상세 데이터 모달 */}
        {modalOpen && selectedData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* 모달 헤더 */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedData.label} 상세 분석
                    {selectedData.isHighest && <span className="ml-2 text-red-500">🔥</span>}
                  </h2>
                  <button
                    onClick={() => setModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                  >
                    ×
                  </button>
                </div>

                {/* 요약 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedData.sales)}</div>
                    <div className="text-sm text-gray-600">총 매출</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedData.tables}개</div>
                    <div className="text-sm text-gray-600">테이블 수</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedData.customers}명</div>
                    <div className="text-sm text-gray-600">방문 고객</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 시간대별 매출 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                      시간대별 매출 현황
                    </h3>
                    <div className="space-y-3">
                      {selectedData.hourlyBreakdown?.map((hour: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-700">{hour.time}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-blue-600">{formatCurrency(hour.sales)}</div>
                            <div className="text-xs text-gray-500">{hour.customers}명</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 인기 메뉴 상세 */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                      해당 기간 인기 메뉴
                    </h3>
                    <div className="space-y-3">
                      {selectedData.topMenusDetail?.map((menu: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                            <span className="font-medium">{menu.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-bold text-green-600">{formatCurrency(menu.sales)}</div>
                            <div className="text-xs text-gray-500">{menu.orders}주문</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 결제 방법 분석 */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <DollarSign className="w-5 h-5 mr-2 text-purple-500" />
                    결제 방법별 분석
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedData.paymentMethods?.map((payment: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-700">{payment.method}</span>
                          <span className="text-sm text-gray-500">{payment.percentage}%</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${payment.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 추가 인사이트 */}
                <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">📊 인사이트</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• 평균 테이블당 매출: {formatCurrency(Math.floor(selectedData.sales / selectedData.tables))}</li>
                    <li>• 평균 고객당 매출: {formatCurrency(Math.floor(selectedData.sales / selectedData.customers))}</li>
                    <li>• 테이블 회전율: {(selectedData.customers / selectedData.tables).toFixed(1)}회</li>
                    {selectedData.isHighest && <li>• 🔥 이 기간은 최고 매출을 기록했습니다!</li>}
                  </ul>
                </div>

                {/* 모달 푸터 */}
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    닫기
                  </button>
                  <button
                    onClick={() => {
                      // 여기에 리포트 내보내기 기능 추가 가능
                      alert('리포트 내보내기 기능은 추후 구현 예정입니다.')
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    리포트 내보내기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
