import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AdminModel from "@/models/AdminCredential";

export async function GET() {
  return NextResponse.json(
    { success: false, message: "Only POST requests are allowed on this route." },
    { status: 405 }
  );
}

export async function POST(req) {
  try {
    await connectDB();
    const { zone, password } = await req.json();

    // Validating input presence
    if (!zone || !password) {
      return NextResponse.json(
        { success: false, message: "Zone and Password are required" },
        { status: 400 }
      );
    }

    // Find admin with matching zone and password
    const admin = await AdminModel.findOne({ 
      zone: zone, 
      password: password.toString() // Ensure it's treated as a string
    });

    if (admin) {
      return NextResponse.json({ 
        success: true, 
        message: "Login Successful",
        role: admin.role 
      });
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid credentials for this zone" }, 
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Admin Login API Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}