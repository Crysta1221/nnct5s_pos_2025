import { NextResponse } from "next/server";
import * as v from "valibot";

const UserIdSchema = v.pipe(
  v.string(),
  v.transform(Number),
  v.number("ユーザーIDは数値である必要があります"),
  v.integer("ユーザーIDは整数である必要があります"),
  v.minValue(21301, "ユーザーIDが無効です"),
  v.maxValue(21344, "ユーザーIDが無効です")
);

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    const result = v.safeParse(UserIdSchema, userId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, userId: result.output });
  } catch (error) {
    return NextResponse.json(
      { error: "リクエストの処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
