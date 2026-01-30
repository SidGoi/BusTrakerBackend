import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AdminModel from "@/models/AdminCredential";

// GET method to fetch available zones for the dropdown
export async function GET() {
  try {
    await connectDB();
    // Fetch all unique zones from AdminCredentials collection
    const admins = await AdminModel.find({}, "zone");
    const zones = admins.map(a => a.zone).sort();
    
    return NextResponse.json({ success: true, data: zones });
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