import { type NextRequest, NextResponse } from "next/server";
import { getPreOrderFromSheet } from "@/lib/sheets";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reservationNumber, studentId } = body;

    if (!reservationNumber) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const preOrder = await getPreOrderFromSheet(reservationNumber);

    if (!preOrder) {
      return NextResponse.json(
        { success: false, error: "Pre-order not found" },
        { status: 404 }
      );
    }

    if (studentId && preOrder.studentId !== studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID does not match" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: preOrder,
    });
  } catch (error) {
    console.error("Failed to verify pre-order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify pre-order" },
      { status: 500 }
    );
  }
}
