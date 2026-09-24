import "server-only";

import { readFileSync } from "node:fs";
import { join } from "node:path";
import nodemailer from "nodemailer";

type ConfirmationEmail = {
  fullName: string;
  email: string;
  willType: string;
  additionalEmails?: Array<string | null | undefined>;
  notificationEmail?: string | null;
};

let fileEnvironment: Record<string, string> | null = null;

function loadFileEnvironment() {
  if (fileEnvironment) return fileEnvironment;

  fileEnvironment = {};
  const paths = [
    process.env.SMTP_ENV_FILE,
    join(process.cwd(), ".env.production"),
    join(process.cwd(), ".env"),
  ].filter((value): value is string => Boolean(value));

  for (const path of paths) {
    try {
      const contents = readFileSync(path, "utf8");
      for (const line of contents.split(/\r?\n/)) {
        const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (!match) continue;
        const value = match[2].trim().replace(/^(['"])(.*)\1$/, "$2");
        fileEnvironment[match[1]] = value;
      }
      break;
    } catch {
      // Try the next environment-file location.
    }
  }

  return fileEnvironment;
}

function environmentValue(name: string) {
  return process.env[name]?.trim() || loadFileEnvironment()[name]?.trim();
}

function requiredEnvironment(name: string) {
  const value = environmentValue(name);
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
  additionalEmails = [],
  notificationEmail,
}: ConfirmationEmail) {
  const host = requiredEnvironment("SMTP_HOST");
  const port = Number(requiredEnvironment("SMTP_PORT"));
  const user = requiredEnvironment("SMTP_USER");
  const password = requiredEnvironment("SMTP_PASSWORD");
  const from = environmentValue("SMTP_FROM") || user;
  const replyTo = environmentValue("SMTP_REPLY_TO") || from;
  const label = willType === "mirror" ? "Mirror Will" : "Single Will";
  const recipients = [email, ...additionalEmails, notificationEmail?.trim()].filter(
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
