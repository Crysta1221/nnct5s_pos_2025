import { type NextRequest, NextResponse } from "next/server";
import { getGoogleSheetsClient } from "@/lib/sheets";

export interface Reservation {
  timestamp: string;
  email: string;
  studentId: string;
  name: string;
  pickupTime: string;
  anko: number;
  custard: number;
  appleJam: number;
}

export interface ReservationSummary {
  pickupTime: string;
  anko: number;
  custard: number;
  appleJam: number;
  total: number;
  reservations: Reservation[];
}

export async function GET(request: NextRequest) {
  try {
    const spreadsheetId = process.env.SPREAD_SHEET_ID;
    const sheets = getGoogleSheetsClient();

    // 高専焼き1シートからデータを取得
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "高専焼き1!A2:H", // ヘッダー行をスキップ
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json([]);
    }

    // データを変換
    const reservations: Reservation[] = rows.map((row) => ({
      timestamp: row[0] || "",
      email: row[1] || "",
      studentId: row[2] || "",
      name: row[3] || "",
      pickupTime: row[4] || "",
      anko: Number(row[5]) || 0,
      custard: Number(row[6]) || 0,
      appleJam: Number(row[7]) || 0,
    }));

    // 受け取り日時ごとに集計
    const summaryMap = new Map<string, ReservationSummary>();

    for (const reservation of reservations) {
      const time = reservation.pickupTime;

      if (!summaryMap.has(time)) {
        summaryMap.set(time, {
          pickupTime: time,
          anko: 0,
          custard: 0,
          appleJam: 0,
          total: 0,
          reservations: [],
        });
      }

      const summary = summaryMap.get(time)!;
      summary.anko += reservation.anko;
      summary.custard += reservation.custard;
      summary.appleJam += reservation.appleJam;
      summary.total +=
        reservation.anko + reservation.custard + reservation.appleJam;
      summary.reservations.push(reservation);
    }

    // 配列に変換してソート
    const summaries = Array.from(summaryMap.values()).sort((a, b) => {
      // 時刻部分を抽出 (例: "10月19日(日) 11:00~" から "11:00" を抽出)
      const timeA = a.pickupTime.match(/(\d{1,2}):(\d{2})/);
      const timeB = b.pickupTime.match(/(\d{1,2}):(\d{2})/);

      if (!timeA || !timeB) {
        return a.pickupTime.localeCompare(b.pickupTime);
      }

      // 時刻を分単位の数値に変換 (例: 11:00 → 660分)
      const minutesA =
        Number.parseInt(timeA[1]) * 60 + Number.parseInt(timeA[2]);
      const minutesB =
        Number.parseInt(timeB[1]) * 60 + Number.parseInt(timeB[2]);

      return minutesA - minutesB;
    });

    return NextResponse.json(summaries);
  } catch (error) {
    console.error("Failed to fetch reservations:", error);
    return NextResponse.json(
      { error: "Failed to fetch reservations" },
      { status: 500 }
    );
  }
}
