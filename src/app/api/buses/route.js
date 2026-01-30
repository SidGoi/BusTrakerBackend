import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/Bus";

export async function GET(req) {
  try {
    await connectDB();
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    await Bus.updateMany(
      { 
        status: "active", 
        lastUpdate: { $lt: threeMinutesAgo } 
      },
      { $set: { status: "inactive" } }
    );

    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone");
    
    const filter = {};
    if (zone) filter.zone = { $regex: zone, $options: "i" };

    const buses = await Bus.find(filter).sort({ busId: 1 });

    return NextResponse.json({ success: true, data: buses });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Your existing POST method for login
export async function POST(req) {
  try {
    await connectDB();
    const { zone, password } = await req.json();
    const admin = await AdminModel.findOne({ zone, password: password.toString() });

    if (admin) {
      return NextResponse.json({ success: true, message: "Login Successful" });
    } else {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}