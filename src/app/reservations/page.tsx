"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Menu, LogOut, Home, Clock } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import type { ReservationSummary } from "@/app/api/reservations/route";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type DayTab = "saturday" | "sunday";

export default function ReservationsPage() {
  const [summaries, setSummaries] = useState<ReservationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [activeTab, setActiveTab] = useState<DayTab>("saturday");

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reservations");
      const data = await response.json();
      setSummaries(data);

      // 初期選択を設定（アクティブなタブの最初の時間）
      if (data.length > 0) {
        const filtered = filterByDay(data, activeTab);
        if (filtered.length > 0) {
          setSelectedTime(filtered[0].pickupTime);
        }
      }
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  // タブが変更されたら選択時間をリセット
  useEffect(() => {
    const filtered = filterByDay(summaries, activeTab);
    if (filtered.length > 0) {
      setSelectedTime(filtered[0].pickupTime);
    }
  }, [activeTab]);

  // 曜日でフィルタリング
  const filterByDay = (data: ReservationSummary[], day: DayTab) => {
    return data.filter((summary) => {
      if (day === "saturday") {
        // "(土)" または "(土" にマッチ
        return (
          summary.pickupTime.includes("(土)") ||
          summary.pickupTime.includes("(土")
        );
      }
      // "(日)" または "(日" にマッチ
      return (
        summary.pickupTime.includes("(日)") ||
        summary.pickupTime.includes("(日")
      );
    });
  };

  const filteredSummaries = filterByDay(summaries, activeTab);

  const handleLogout = async () => {
    await signOut({ redirectTo: "/login" });
  };

  const selectedSummary = filteredSummaries.find(
    (s) => s.pickupTime === selectedTime
  );

  // グラフ用のデータ
  const chartData = filteredSummaries.map((summary) => ({
    time: summary.pickupTime,
    あんこ: summary.anko,
    カスタード: summary.custard,
    リンゴジャム: summary.appleJam,
    合計: summary.total,
  }));

  return (
    <div className='bg-background'>
      <div className='min-h-screen flex flex-col'>
        <div className='border-b bg-card p-3 sm:p-4'>
          <div className='flex justify-between items-center'>
            <h1 className='text-lg sm:text-2xl font-bold'>高専焼き POSシステム</h1>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' size='sm' className='sm:size-default'>
                  <Menu className='w-4 h-4 sm:w-5 sm:h-5 sm:mr-2' />
                  <span className='hidden sm:inline'>メニュー</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuItem asChild>
                  <Link href='/' className='flex items-center cursor-pointer'>
                    <Home className='w-4 h-4 mr-2' />
                    切り替え
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className='w-4 h-4 mr-2' />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto'>
          <div className='container max-w-7xl mx-auto py-4 sm:py-10 px-3 sm:px-4'>
            <div className='flex items-center justify-between mb-4 sm:mb-6'>
              <h1 className='text-2xl sm:text-3xl font-bold'>予約情報</h1>
              <Button onClick={fetchReservations} disabled={loading} size='sm' className='sm:size-default'>
                <RefreshCw
                  className={`mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 ${loading ? "animate-spin" : ""}`}
                />
                更新
              </Button>
            </div>

            {loading ? (
              <div className='flex items-center justify-center h-64'>
                <RefreshCw className='h-8 w-8 animate-spin' />
              </div>
            ) : (
              <div className='space-y-4 sm:space-y-6'>
                {/* 曜日タブ */}
                <div className='flex gap-2 border-b'>
                  <Button
                    variant={activeTab === "saturday" ? "default" : "ghost"}
                    onClick={() => setActiveTab("saturday")}
                    className='rounded-b-none flex-1 min-h-[44px] text-base'>
                    土曜日
                  </Button>
                  <Button
                    variant={activeTab === "sunday" ? "default" : "ghost"}
                    onClick={() => setActiveTab("sunday")}
                    className='rounded-b-none flex-1 min-h-[44px] text-base'>
                    日曜日
                  </Button>
                </div>

                {/* 時間選択 - スマホ版: ボタングリッド */}
                <Card className='sm:hidden'>
                  <CardHeader className='p-4'>
                    <CardTitle className='flex items-center gap-2 text-base'>
                      <Clock className='w-4 h-4' />
                      受け取り時間を選択
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-4 pt-0'>
                    <div className='grid grid-cols-2 gap-2'>
                      {filteredSummaries.map((summary) => (
                        <Button
                          key={summary.pickupTime}
                          variant={selectedTime === summary.pickupTime ? "default" : "outline"}
                          onClick={() => setSelectedTime(summary.pickupTime)}
                          className='min-h-[60px] h-auto flex flex-col items-start justify-center p-3 text-left whitespace-normal'>
                          <span className='text-sm font-semibold line-clamp-2'>
                            {summary.pickupTime}
                          </span>
                          <span className='text-xs opacity-80'>
                            {summary.total}個
                          </span>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* 時間選択 - PC版: セレクトボックス */}
                <Card className='hidden sm:block'>
                  <CardHeader className='p-4 sm:p-6'>
                    <CardTitle className='flex items-center gap-2 text-base sm:text-lg'>
                      <Clock className='w-4 h-4 sm:w-5 sm:h-5' />
                      受け取り時間を選択
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-4 sm:p-6 pt-0'>
                    <Select
                      value={selectedTime}
                      onValueChange={setSelectedTime}>
                      <SelectTrigger className='w-full'>
                        <SelectValue placeholder='時間を選択してください' />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredSummaries.map((summary) => (
                          <SelectItem
                            key={summary.pickupTime}
                            value={summary.pickupTime}>
                            {summary.pickupTime} ({summary.total}個)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* 全体グラフ */}
                <Card>
                  <CardHeader className='p-4 sm:p-6'>
                    <CardTitle className='text-base sm:text-lg'>時間帯別 予約状況</CardTitle>
                  </CardHeader>
                  <CardContent className='p-4 sm:p-6 pt-0'>
                    <ResponsiveContainer width='100%' height={300} className='sm:hidden'>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis
                          dataKey='time'
                          angle={-45}
                          textAnchor='end'
                          height={60}
                          interval={0}
                          style={{ fontSize: "10px" }}
                        />
                        <YAxis style={{ fontSize: "10px" }} />
                        <Tooltip />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        <Bar dataKey='あんこ' fill='#8b4513' />
                        <Bar dataKey='カスタード' fill='#ffd700' />
                        <Bar dataKey='リンゴジャム' fill='#dc143c' />
                      </BarChart>
                    </ResponsiveContainer>
                    <ResponsiveContainer width='100%' height={400} className='hidden sm:block'>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis
                          dataKey='time'
                          angle={-45}
                          textAnchor='end'
                          height={80}
                          interval={0}
                          style={{ fontSize: "12px" }}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey='あんこ' fill='#8b4513' />
                        <Bar dataKey='カスタード' fill='#ffd700' />
                        <Bar dataKey='リンゴジャム' fill='#dc143c' />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* 選択された時間の詳細 */}
                {selectedSummary && (
                  <>
                    <div className='grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-4'>
                      <Card>
                        <CardHeader className='pb-2 p-3 sm:p-6 sm:pb-2'>
                          <CardTitle className='text-xs sm:text-sm font-medium'>
                            あんこ
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='p-3 sm:p-6 pt-0'>
                          <div className='text-2xl sm:text-3xl font-bold'>
                            {selectedSummary.anko}個
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className='pb-2 p-3 sm:p-6 sm:pb-2'>
                          <CardTitle className='text-xs sm:text-sm font-medium'>
                            カスタード
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='p-3 sm:p-6 pt-0'>
                          <div className='text-2xl sm:text-3xl font-bold'>
                            {selectedSummary.custard}個
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className='pb-2 p-3 sm:p-6 sm:pb-2'>
                          <CardTitle className='text-xs sm:text-sm font-medium'>
                            リンゴジャム
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='p-3 sm:p-6 pt-0'>
                          <div className='text-2xl sm:text-3xl font-bold'>
                            {selectedSummary.appleJam}個
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className='pb-2 p-3 sm:p-6 sm:pb-2'>
                          <CardTitle className='text-xs sm:text-sm font-medium'>
                            合計
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='p-3 sm:p-6 pt-0'>
                          <div className='text-2xl sm:text-3xl font-bold text-primary'>
                            {selectedSummary.total}個
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* 予約詳細リスト */}
                    <Card>
                      <CardHeader className='p-4 sm:p-6'>
                        <CardTitle className='text-base sm:text-lg'>
                          {selectedSummary.pickupTime} の予約詳細
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='p-4 sm:p-6 pt-0'>
                        <div className='space-y-3'>
                          {selectedSummary.reservations.map(
                            (reservation, index) => (
                              <div
                                key={index}
                                className='p-3 sm:p-4 border rounded-lg bg-muted/30'>
                                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1 sm:gap-0'>
                                  <div>
                                    <p className='font-semibold text-sm sm:text-base'>
                                      {reservation.name}
                                    </p>
                                    <p className='text-xs sm:text-sm text-muted-foreground'>
                                      学籍番号: {reservation.studentId}
                                    </p>
                                  </div>
                                  <div className='sm:text-right'>
                                    <p className='text-xs text-muted-foreground'>
                                      {reservation.timestamp}
                                    </p>
                                  </div>
                                </div>
                                <div className='grid grid-cols-3 gap-2 text-xs sm:text-sm'>
                                  <div>
                                    あんこ:{" "}
                                    <span className='font-semibold'>
                                      {reservation.anko}個
                                    </span>
                                  </div>
                                  <div>
                                    カスタード:{" "}
                                    <span className='font-semibold'>
                                      {reservation.custard}個
                                    </span>
                                  </div>
                                  <div>
                                    リンゴジャム:{" "}
                                    <span className='font-semibold'>
                                      {reservation.appleJam}個
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
