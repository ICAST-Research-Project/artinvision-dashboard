import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `https://www.art-connect.org/auth/new-verification?token=${token}`;

  await resend.emails.send({
    from: "support@art-connect.org",
    to: email,
    subject: "Confirm your Email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email</p>`,
  });
};

export const sendPasswordEmail = async (email: string, token: string) => {
  const resetLink = `https://www.art-connect.org/auth/new-password?token=${token}`;

  await resend.emails.send({
    from: "support@art-connect.org",
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password</p>`,
  });
};
