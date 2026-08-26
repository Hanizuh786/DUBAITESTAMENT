import { NextResponse } from "next/server";
import { createEspoRecord } from "@/lib/espo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    console.log("QUESTIONNAIRE DATA:");
    console.log(JSON.stringify(data, null, 2));

    const payload = {
      cName: `UAE-testament - ${
        data.testator_full_name || "Unknown"
      }`,
    };

    console.log("ESPO PAYLOAD:");
    console.log(payload);

    const result = await createEspoRecord(payload);

    return NextResponse.json(
      {
        success: true,
        id: result.id,
      },
      {
        status: 201,
      },
    );
  } catch (error: any) {
    console.error("QUESTIONNAIRE ERROR:");
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unknown server error",
      },
      {
        status: 500,
      },
    );
  }
}