import { getGoogleSheetsClient } from "@/lib/sheets";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { reservationNumber } = await request.json();

    if (!reservationNumber) {
      return NextResponse.json(
        { error: "予約番号が必要です" },
        { status: 400 }
      );
    }

    const spreadsheetId = process.env.SPREAD_SHEET_ID;
    const sheets = getGoogleSheetsClient();

    // order_listから全てのデータを取得
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "order_list!A2:K",
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ exists: false, canOrder: true });
    }

    // 予約番号が既に使用されているかチェック（列K、インデックス10）
    const exists = rows.some((row: string[]) => row[10] === reservationNumber);

    return NextResponse.json({
      exists,
      canOrder: !exists,
      message: exists ? "この予約番号は既に使用されています" : "予約可能です",
    });
  } catch (error) {
    console.error("Failed to check reservation:", error);
    return NextResponse.json(
      { error: "予約番号の確認に失敗しました" },
      { status: 500 }
    );
  }
}
