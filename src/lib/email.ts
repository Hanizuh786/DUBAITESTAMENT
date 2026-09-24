import "server-only";

import nodemailer from "nodemailer";

type ConfirmationEmail = {
  fullName: string;
  email: string;
  willType: string;
  notificationEmail?: string | null;
};

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Email environment configuration is missing: ${name}`);
  return value;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;",
    };
    return entities[character];
  });
}

export async function sendQuestionnaireConfirmation({
  fullName,
  email,
  willType,
  notificationEmail,
}: ConfirmationEmail) {
  const host = requiredEnvironment("SMTP_HOST");
  const port = Number(requiredEnvironment("SMTP_PORT"));
  const user = requiredEnvironment("SMTP_USER");
  const password = requiredEnvironment("SMTP_PASSWORD");
  const from = process.env.SMTP_FROM?.trim() || user;
  const replyTo = process.env.SMTP_REPLY_TO?.trim() || from;
  const label = willType === "mirror" ? "Mirror Will" : "Single Will";
  const recipients = [email, notificationEmail?.trim()].filter(
    (address, index, all): address is string =>
      Boolean(address) && all.indexOf(address) === index,
  );

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid port number.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password },
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });

  const safeName = escapeHtml(fullName);
  const safeLabel = escapeHtml(label);
  await transporter.sendMail({
    from,
    to: recipients,
    replyTo,
    subject: `Bevestiging ontvangst testamentvragenlijst – ${label}`,
    text: [
      `Beste ${fullName},`,
      "",
      `Wij hebben je testamentvragenlijst voor een ${label} goed ontvangen.`,
      "Ons team beoordeelt je gegevens en neemt contact met je op over de volgende stappen.",
      "",
      "Met vriendelijke groet,",
      "Holland Legal Services FZ-LLC",
      "DubaiTestament.nl",
    ].join("\\n"),
    html: `<!doctype html><html lang="nl"><body style="font-family:Arial,sans-serif;line-height:1.6;color:#1d2935"><p>Beste ${safeName},</p><p>Wij hebben je testamentvragenlijst voor een <strong>${safeLabel}</strong> goed ontvangen.</p><p>Ons team beoordeelt je gegevens en neemt contact met je op over de volgende stappen.</p><p>Met vriendelijke groet,<br>Holland Legal Services FZ-LLC<br>DubaiTestament.nl</p></body></html>`,
  });
}
