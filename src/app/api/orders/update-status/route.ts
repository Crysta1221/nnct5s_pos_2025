import { NextRequest, NextResponse } from "next/server";
import { getGoogleSheetsClient } from "@/lib/sheets";

export async function POST(request: NextRequest) {
  try {
    const { orderNumber, status } = await request.json();

    if (!orderNumber || !status) {
      return NextResponse.json(
        { error: "Order number and status are required" },
        { status: 400 }
      );
    }

    const sheets = getGoogleSheetsClient();
    const spreadsheetId = process.env.SPREAD_SHEET_ID;

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: "Spreadsheet ID not configured" },
        { status: 500 }
      );
    }

    // Find the row with the matching order number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "order_list!A:F",
    });

    const rows = response.data.values;
    if (!rows || rows.length <= 1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === orderNumber) {
        rowIndex = i + 1; // +1 because sheets are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update the status in column F (delivery status)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `order_list!F${rowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[status]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update order status:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}
