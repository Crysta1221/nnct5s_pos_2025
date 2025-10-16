import { type NextRequest, NextResponse } from "next/server";
import {
  appendOrderToSheet,
  getOrdersFromSheet,
  getNextOrderNumber,
} from "@/lib/sheets";
import type { OrderData } from "@/lib/sheets";

export async function GET() {
  try {
    const orders = await getOrdersFromSheet();
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.orderDate) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const orderNumber = await getNextOrderNumber();

    const orderData: OrderData = {
      orderNumber: orderNumber.toString(),
      anko: body.anko || 0,
      custard: body.custard || 0,
      appleJam: body.appleJam || 0,
      orderDate: body.orderDate,
      deliveryStatus: body.deliveryStatus || "未完了",
      preOrder: body.preOrder || false,
      subtotal: body.subtotal || 0,
      couponUsed: body.couponUsed || 0,
      totalAmount: body.totalAmount || 0,
      reservationNumber: body.reservationNumber || "",
    };

    const result = await appendOrderToSheet(orderData);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Failed to add order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add order" },
      { status: 500 }
    );
  }
}
