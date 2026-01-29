import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/Bus";

export async function GET(req) {
  try {
    await connectDB();

    // 1. AUTO-INACTIVE LOGIC
    // Define the threshold (5 minutes ago)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Update all buses that haven't sent an update in 5 mins to 'inactive'
    await Bus.updateMany(
      { 
        lastUpdate: { $lt: fiveMinutesAgo },
        status: "active" 
      },
      { $set: { status: "inactive" } }
    );

    // 2. FETCH DATA
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

    // When a location update comes in, we reset status to 'active'
    const updatedBus = await Bus.findOneAndUpdate(
      { busId: Number(busId) },
      { 
        $set: { 
          location, 
          lastUpdate: new Date(),
          status: "active" // Reset to active on every successful ping
        } 
      },
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