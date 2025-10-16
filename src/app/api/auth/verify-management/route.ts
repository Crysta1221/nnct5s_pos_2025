import { NextResponse } from "next/server";
import * as v from "valibot";
import { signIn } from "@/auth";

const VALID_MANAGEMENT_NUMBER = process.env.MANAGEMENT_NUMBER || "1234";

const ManagementNumberSchema = v.pipe(
  v.string(),
  v.minLength(1, "管理番号を入力してください")
);

export async function POST(request: Request) {
  try {
    const { userId, managementNumber } = await request.json();

    const result = v.safeParse(ManagementNumberSchema, managementNumber);

    if (!result.success) {
      return NextResponse.json(
        { error: result.issues[0].message },
        { status: 400 }
      );
    }

    if (managementNumber !== VALID_MANAGEMENT_NUMBER) {
      return NextResponse.json(
        { error: "管理番号が無効です" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      userId,
      managementNumber,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "リクエストの処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
