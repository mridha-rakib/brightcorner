export type EmailConfig = {
  provider: "postmark" | "stub";
  fromName: string;
  fromAddress: string;
  replyTo?: string;
  sandboxMode: boolean;
};

export const emailConfig: EmailConfig = {
  provider: "stub",
  fromName: "Bright Corner",
  fromAddress: "noreply@brightcorner.local",
  sandboxMode: true,
};
