import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/Bus";

export async function GET(req) {
  try {
    await connectDB();

    // PRODUCTION BEST PRACTICE: 
    // If we haven't heard from a bus in 2 minutes, it's definitely offline.
    // (1.5x to 2x your 60s interval is the standard buffer)
    const timeoutThreshold = new Date(Date.now() - 2 * 60 * 1000);

    await Bus.updateMany(
      {
        lastUpdate: { $lt: timeoutThreshold },
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

    return NextResponse.json({
      success: true,
      count: buses.length,
      data: buses,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { busId, location, status } = await req.json();

    if (busId === undefined) {
      return NextResponse.json(
        { success: false, message: "Missing Bus ID" },
        { status: 400 }
      );
    }

    const updateData = {
      lastUpdate: new Date(),
    };

    if (location && Array.isArray(location)) {
      updateData.location = location;
      updateData.status = "active"; 
    }


    const updatedBus = await Bus.findOneAndUpdate(
      { busId: Number(busId) },
      { $set: updateData },
      { new: true, upsert: false } // upsert: false ensures we don't create fake buses
    );

    if (!updatedBus) {
      return NextResponse.json(
        { success: false, message: "Bus ID not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedBus });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}