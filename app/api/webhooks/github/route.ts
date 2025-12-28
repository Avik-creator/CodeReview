import { NextResponse, NextRequest } from "next/server";

export async function POST(requst: NextRequest) {
  try {
    const payload = await requst.json();
    const event = requst.headers.get("X-gitHub-event");
    if (event === "ping") {
      return NextResponse.json({ msg: "pong" });
    }

    // Handle other GitHub webhook events here

    return NextResponse.json({ msg: "Event received" });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to process webhook: ${error}` },
      { status: 500 }
    );
  }
}
