import "server-only";

export async function createEspoRecord(payload: Record<string, unknown>) {
  const baseUrl = process.env.ESPO_BASE_URL?.replace(/\/+$/, "");
  const apiKey = process.env.ESPO_API_KEY;
  const entity = process.env.ESPO_QUESTIONNAIRE_ENTITY;

  if (!baseUrl || !apiKey || !entity) {
    throw new Error("EspoCRM environment configuration is incomplete.");
  }

  const response = await fetch(
    `${baseUrl}/api/v1/${encodeURIComponent(entity)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `EspoCRM request failed with status ${response.status}${
        details ? `: ${details.slice(0, 500)}` : ""
      }`,
    );
  }

  return response.json() as Promise<{ id: string }>;
}
