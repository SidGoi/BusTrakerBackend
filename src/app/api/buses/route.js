import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Bus from "@/models/Bus";

export async function GET(req) {
  try {
    await connectDB();

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    await Bus.updateMany(
      {
        lastUpdate: { $lt: fiveMinutesAgo },
        status: "active",
      },
      { $set: { status: "inactive" } },
    );

    // 2. FETCH DATA
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
      { status: 500 },
    );
  }
}

export async function PATCH(req) {
  try {
    await connectDB();
    const { busId, location, status } = await req.json(); // Add status here

    if (busId === undefined) {
      return NextResponse.json(
        { success: false, message: "Invalid data" },
        { status: 400 },
      );
    }

    const updateData = {
      lastUpdate: new Date(),
    };

    if (location) updateData.location = location;

    // If a status is provided (like 'inactive'), use it.
    // Otherwise, default to 'active' for normal GPS pings.
    updateData.status = status || "active";

    const updatedBus = await Bus.findOneAndUpdate(
      { busId: Number(busId) },
      { $set: updateData },
      { new: true },
    );

    return NextResponse.json({ success: true, data: updatedBus });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
