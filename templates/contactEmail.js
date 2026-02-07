export function contactEmailTemplate(name, email, message) {
  return `
    <div>
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
      <hr/>
      <p style="font-size: 0.9em; color: #555;">This email was sent from your website contact form.</p>
    </div>
  `;
}
