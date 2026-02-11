export function serviceInquiryEmailTemplate(name, email, phone, serviceName, message) {
  return `
    <div style="margin:0; padding:28px 12px; background:#eef2ff; font-family: Arial, Helvetica, sans-serif; color:#1e293b;">
      <div style="max-width:680px; margin:0 auto; background:#ffffff; border:1px solid #dbeafe; border-radius:12px; overflow:hidden;">
        <div style="padding:22px 24px; background:linear-gradient(120deg, #0f172a, #1d4ed8); color:#ffffff;">
          <p style="margin:0; font-size:12px; letter-spacing:0.08em; text-transform:uppercase; opacity:0.9;">Lead Notification</p>
          <h2 style="margin:8px 0 0; font-size:22px; line-height:1.3;">New Service Inquiry</h2>
          <p style="margin:10px 0 0; font-size:13px; opacity:0.92;">A visitor submitted a request from your service.</p>
        </div>

        <div style="padding:22px 24px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate; border-spacing:0 10px;">
            <tr>
              <td style="width:50%; padding-right:8px;">
                <div style="border:1px solid #e2e8f0; border-radius:10px; background:#f8fafc; padding:12px;">
                  <p style="margin:0 0 4px; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.06em;">Name</p>
                  <p style="margin:0; font-size:14px; font-weight:700; color:#0f172a;">${name}</p>
                </div>
              </td>
              <td style="width:50%; padding-left:8px;">
                <div style="border:1px solid #e2e8f0; border-radius:10px; background:#f8fafc; padding:12px;">
                  <p style="margin:0 0 4px; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.06em;">Email</p>
                  <p style="margin:0; font-size:14px; font-weight:700; color:#0f172a;">${email}</p>
                </div>
              </td>
            </tr>
            <tr>
              <td style="width:50%; padding-right:8px;">
                <div style="border:1px solid #e2e8f0; border-radius:10px; background:#f8fafc; padding:12px;">
                  <p style="margin:0 0 4px; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.06em;">Phone</p>
                  <p style="margin:0; font-size:14px; font-weight:700; color:#0f172a;">${phone}</p>
                </div>
              </td>
              <td style="width:50%; padding-left:8px;">
                <div style="border:1px solid #e2e8f0; border-radius:10px; background:#f8fafc; padding:12px;">
                  <p style="margin:0 0 4px; font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.06em;">Service</p>
                  <p style="margin:0; font-size:14px; font-weight:700; color:#0f172a;">${serviceName}</p>
                </div>
              </td>
            </tr>
          </table>

          <div style="margin-top:12px; border:1px solid #bfdbfe; border-left:4px solid #2563eb; border-radius:10px; background:#eff6ff; padding:14px 14px 12px;">
            <p style="margin:0 0 7px; font-size:12px; text-transform:uppercase; letter-spacing:0.06em; color:#1e40af; font-weight:700;">Message</p>
            <p style="margin:0; font-size:14px; line-height:1.65; color:#1e293b; white-space:pre-wrap;">${message}</p>
          </div>

          <p style="margin:16px 0 0; font-size:12px; color:#64748b;">This email was generated from the Service Inquiry form.</p>
        </div>
      </div>
    </div>
  `;
}
