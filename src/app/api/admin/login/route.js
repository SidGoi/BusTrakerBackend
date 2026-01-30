import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AdminModel from "@/models/AdminCredential";

// GET: Returns unique zones for your dropdown menu
export async function GET() {
  try {
    await connectDB();
    // distinct("zone") returns a simple array of strings: ["Zone - 1", "Zone - 2"]
    const zones = await AdminModel.distinct("zone");
    return NextResponse.json({ success: true, data: zones.sort() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Validates the zone-specific password
export async function POST(req) {
  try {
    await connectDB();
    const { zone, password } = await req.json();

    if (!zone || !password) {
      return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });
    }

    const admin = await AdminModel.findOne({ 
      zone: zone, 
      password: password.toString().trim() 
    });

    if (admin) {
      return NextResponse.json({ 
        success: true, 
        message: "Login Successful",
        role: admin.role 
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid credentials for " + zone }, 
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}