import { reviewPullRequest } from "@/app/actions/ai";
import { NextResponse, NextRequest } from "next/server";

export async function POST(requst: NextRequest) {
  try {
    const payload = await requst.json();
    const event = requst.headers.get("X-gitHub-event");
    if (event === "ping") {
      return NextResponse.json({ msg: "pong" });
    }

    if (event === "pull_request") {
      const action = payload.action;
      const repo = payload.repository.full_name;
      const prNumber = payload.number;

      const [owner, repoName] = repo.split("/");

      if (action === "opened" || action === "synchronize") {
        reviewPullRequest(owner, repoName, prNumber)
          .then(() => console.log("Pull request review triggered"))
          .catch(() => console.error("Failed to trigger pull request review"));
      }
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
