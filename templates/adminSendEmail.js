exports.adminSendEmailTemplate = (fullName, body) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dddddd; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #333333;">فريق دعم نور يود إبلاغك بشأن خدمتك</h2>
      <p>مرحبًا ${fullName},</p>
      <p>${body}</p>
      <p>إذا كان لديك أي استفسارات، لا تتردد في <a href="https://norhomecare.com/contact" style="color: #0066cc; text-decoration: none;">التواصل معنا</a>.</p>
      <p>(Noor) شكرًا لاختيارك نور،</p>
      <p>البريد الإلكتروني: LcQDQ@example.com</p>
      <p>الهاتف: 123-456-7890</p>
      <p>(Noor) فريق دعم نور</p>
    </div>
  `;
};
