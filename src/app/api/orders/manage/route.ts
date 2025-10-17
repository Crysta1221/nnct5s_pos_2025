import { getGoogleSheetsClient } from "@/lib/sheets";
import { type NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const { orderNumber, updates } = await request.json();

    if (!orderNumber) {
      return NextResponse.json(
        { error: "注文番号が必要です" },
        { status: 400 }
      );
    }

    const spreadsheetId = process.env.SPREAD_SHEET_ID;
    const sheets = getGoogleSheetsClient();

    // 注文を検索
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "order_list!A2:K",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "注文が見つかりません" },
        { status: 404 }
      );
    }

    // 注文番号で行を検索
    const rowIndex = rows.findIndex((row) => row[0] === orderNumber);
    if (rowIndex === -1) {
      return NextResponse.json(
        { error: "注文が見つかりません" },
        { status: 404 }
      );
    }

    // 実際のシートの行番号（ヘッダーを考慮）
    const sheetRowIndex = rowIndex + 2;

    // 更新するデータを準備
    const currentRow = rows[rowIndex];
    const updatedRow = [
      currentRow[0], // 注文番号
      updates.anko !== undefined ? updates.anko : currentRow[1],
      updates.custard !== undefined ? updates.custard : currentRow[2],
      updates.appleJam !== undefined ? updates.appleJam : currentRow[3],
      currentRow[4], // 注文日時
      updates.deliveryStatus !== undefined
        ? updates.deliveryStatus
        : currentRow[5],
      updates.preOrder !== undefined
        ? updates.preOrder
          ? "TRUE"
          : "FALSE"
        : currentRow[6],
      updates.subtotal !== undefined ? updates.subtotal : currentRow[7],
      updates.couponUsed !== undefined
        ? updates.couponUsed
          ? "TRUE"
          : "FALSE"
        : currentRow[8],
      updates.totalAmount !== undefined ? updates.totalAmount : currentRow[9],
      updates.reservationNumber !== undefined
        ? updates.reservationNumber
        : currentRow[10] || "",
    ];

    // データを更新
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: `order_list!A${sheetRowIndex}:K${sheetRowIndex}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [updatedRow],
      },
    });

    return NextResponse.json({
      success: true,
      message: "注文を更新しました",
    });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "注文の更新に失敗しました" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    if (!orderNumber) {
      return NextResponse.json(
        { error: "注文番号が必要です" },
        { status: 400 }
      );
    }

    const spreadsheetId = process.env.SPREAD_SHEET_ID;
    const sheets = getGoogleSheetsClient();

    // スプレッドシート情報を取得してシートIDを確認
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId,
    });

    // order_listシートのIDを取得
    const orderListSheet = spreadsheetInfo.data.sheets?.find(
      (sheet) => sheet.properties?.title === "order_list"
    );

    if (!orderListSheet?.properties?.sheetId) {
      return NextResponse.json(
        { error: "order_listシートが見つかりません" },
        { status: 404 }
      );
    }

    const sheetId = orderListSheet.properties.sheetId;

    // 注文を検索
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: "order_list!A2:K",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "注文が見つかりません" },
        { status: 404 }
      );
    }

    // 注文番号で行を検索
    const rowIndex = rows.findIndex((row) => row[0] === orderNumber);
    if (rowIndex === -1) {
      return NextResponse.json(
        { error: "注文が見つかりません" },
        { status: 404 }
      );
    }

    // 実際のシートの行番号（ヘッダーを考慮）
    const sheetRowIndex = rowIndex + 2;

    // 行を削除
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId, // 取得した正しいシートID
                dimension: "ROWS",
                startIndex: sheetRowIndex - 1,
                endIndex: sheetRowIndex,
              },
            },
          },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: "注文を削除しました",
    });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return NextResponse.json(
      { error: "注文の削除に失敗しました" },
      { status: 500 }
    );
  }
}
