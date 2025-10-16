import { NextResponse } from "next/server";
import { getGoogleSheetsClient } from "@/lib/sheets";

export type PendingOrder = {
  orderNumber: string;
  anko: number;
  custard: number;
  appleJam: number;
  orderDate: string;
  preOrder: boolean;
  subtotal: number;
  couponUsed: number;
  totalAmount: number;
};

export async function GET() {
  try {
    const sheets = getGoogleSheetsClient();
    const spreadsheetId = process.env.SPREAD_SHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID not configured" },
        { status: 500 }
      );
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "order_list!A:J",
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return NextResponse.json({ orders: [] });
    }

    const pendingOrders: PendingOrder[] = [];

    // Skip header row (index 0) and iterate through data rows
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const deliveryStatus = row[5] || "";

      // Only include orders with "未完了" status
      if (deliveryStatus === "未完了") {
        const preOrderValue = row[6];
        const isPreOrder =
          preOrderValue === "TRUE" ||
          preOrderValue === "true" ||
          preOrderValue === true ||
          preOrderValue === "はい";

        pendingOrders.push({
          orderNumber: row[0] || "",
          anko: Number(row[1]) || 0,
          custard: Number(row[2]) || 0,
          appleJam: Number(row[3]) || 0,
          orderDate: row[4] || "",
          preOrder: isPreOrder,
          subtotal: Number(row[7]) || 0,
          couponUsed: Number(row[8]) || 0,
          totalAmount: Number(row[9]) || 0,
        });
      }
    }

    return NextResponse.json({ orders: pendingOrders });
  } catch (error) {
    console.error("Failed to fetch pending orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
