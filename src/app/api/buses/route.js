import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/Bus";

export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone");
    
    const filter = zone ? { zone: { $regex: zone, $options: "i" } } : {};
    const buses = await Bus.find(filter).sort({ busId: 1 });

    return NextResponse.json({ success: true, data: buses });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { busId, location } = await req.json();

    const updatedBus = await Bus.findOneAndUpdate(
      { busId: Number(busId) },
      { 
        $set: { 
          location: location,
          lastUpdate: new Date() // Store the exact time of update
        } 
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedBus });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}