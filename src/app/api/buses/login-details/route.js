import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/Bus";

export async function GET() {
  try {
    await connectDB();
    const loginData = await Bus.find({})
      .select('zone busId password -_id')
      .sort({ zone: 1, busId: 1 });

    return NextResponse.json({ success: true, count: loginData.length, data: loginData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}