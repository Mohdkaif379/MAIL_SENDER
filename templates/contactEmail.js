export function contactEmailTemplate(name, email, message) {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; line-height: 1.5; padding: 20px; background-color: #f9f9f9;">
      <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #111;">New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${message}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="margin: 0;">Best regards,</p>
        <p style="margin: 0; font-weight: bold;">${name}</p>
      </div>
    </div>
  `;
}
