import { getGoogleSheetsClient } from "@/lib/sheets";
import { type NextRequest, NextResponse } from "next/server";

export interface Order {
  orderNumber: string;
  anko: number;
  custard: number;
  appleJam: number;
  orderDate: string;
  deliveryStatus: string;
  preOrder: boolean;
  subtotal: number;
  couponUsed: boolean;
  totalAmount: number;
}

export async function GET(request: NextRequest) {
  try {
    const spreadsheetId = process.env.SPREAD_SHEET_ID;
    const sheets = getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "order_list!A2:J",
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json([]);
    }

    const orders: Order[] = rows.map((row: string[]) => {
      const preOrderValue = row[6];
      const isPreOrder =
        preOrderValue === "TRUE" ||
        preOrderValue === "true" ||
        preOrderValue === "はい";

      const couponValue = row[8];
      const isCouponUsed = couponValue === "TRUE" || couponValue === "true";

      return {
        orderNumber: row[0] || "",
        anko: Number.parseInt(row[1] || "0"),
        custard: Number.parseInt(row[2] || "0"),
        appleJam: Number.parseInt(row[3] || "0"),
        orderDate: row[4] || "",
        deliveryStatus: row[5] || "",
        preOrder: isPreOrder,
        subtotal: Number.parseInt(row[7] || "0"),
        couponUsed: isCouponUsed,
        totalAmount: Number.parseInt(row[9] || "0"),
      };
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
