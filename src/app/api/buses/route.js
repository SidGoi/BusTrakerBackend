import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/Bus";


export async function GET(req) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const zone = searchParams.get("zone");
    const status = searchParams.get("status");

    const filter = {};
    if (zone) filter.zone = { $regex: zone, $options: "i" };
    if (status) filter.status = { $regex: status, $options: "i" };

    const buses = await Bus.find(filter).sort({ zone: 1, busId: 1 });

    return NextResponse.json({ success: true, count: buses.length, data: buses });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


export async function PATCH(req) {
  try {
    await connectDB();
    const { busId, location } = await req.json();

    if (busId === undefined || !Array.isArray(location)) {
      return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 });
    }

    const updatedBus = await Bus.findOneAndUpdate(
      { busId: Number(busId) },
      { $set: { location, lastUpdate: new Date() } },
      { new: true }
    );

    if (!updatedBus) {
      return NextResponse.json({ success: false, message: "Bus not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedBus });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}