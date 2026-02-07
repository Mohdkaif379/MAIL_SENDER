# TODO for Contact Form Email API Modification

- [ ] Update index.js for contact form email sending without database saving
  - [ ] Keep /contact route for contact form data
  - [ ] Update transporter to use EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
  - [ ] Set from in sendMail to include EMAIL_FROM_NAME
  - [ ] Ensure email is sent to TO_EMAIL (admin's email)
  - [ ] Keep contactEmailTemplate for HTML email
  - [ ] Fix server log typo (localhost)
