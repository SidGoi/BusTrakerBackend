import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/Bus";

export async function GET(req) {
  try {
    await connectDB();

    // REQUIREMENT: If user can't send data for 2 minutes, make inactive instantly
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    await Bus.updateMany(
      {
        lastUpdate: { $lt: twoMinutesAgo },
        status: "active",
      },
      { $set: { status: "inactive" } }
    );

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
    const { busId, location, status } = await req.json();

    if (busId === undefined) {
      return NextResponse.json({ success: false, message: "Missing Bus ID" }, { status: 400 });
    }

    const updateData = {
      lastUpdate: new Date(), // This tracks the heartbeat
    };

    // REQUIREMENT: If location is sent, make active. Store lastLocationUpdateAt.
    if (location && Array.isArray(location) && location[0] !== 0) {
      updateData.location = location;
      updateData.status = "active"; 
      updateData.lastLocationUpdateAt = new Date(); // Update the special timestamp
    }

    // REQUIREMENT: Handle explicit logout / manual status change
    if (status) {
      updateData.status = status;
    }

    const updatedBus = await Bus.findOneAndUpdate(
      { busId: Number(busId) },
      { $set: updateData },
      { new: true, upsert: false }
    );

    if (!updatedBus) {
      return NextResponse.json({ success: false, message: "Bus not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedBus });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}