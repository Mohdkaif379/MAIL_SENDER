export function contactEmailTemplate(name, email, message) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong><br/>${message}</p>
      <hr/>
      <p style="font-size: 0.9em; color: #777;">This email was sent from your website contact form.</p>
    </div>
  `;
}
