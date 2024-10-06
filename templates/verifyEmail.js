exports.verifyEmailTemplate = (resetCode) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dddddd; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #333333;">تأكيد بريدك الإلكتروني</h2>
      <p>مرحباً،</p>
      <p>لقد تلقينا طلبًا لتأكيد بريدك الإلكتروني. هذا الرمز صالح لمدة 10 دقائق.</p>
      <div style="text-align: center; margin: 20px 0;">
        <p style="font-size: 24px; font-weight: bold; color: #333333;">${resetCode}</p>
      </div>
      <p>إذا لم تطلب التحقق، يرجى تجاهل هذا البريد الإلكتروني أو التواصل مع الدعم إذا كان لديك أي استفسار.</p>
      <p>إذا كان لديك أي استفسارات، لا تتردد في <a href="https://norhomecare.com/contact" style="color: #0066cc; text-decoration: none;">التواصل معنا</a>.</p>
      <p>(Noor) شكرًا لاختيارك نور،</p>
      <p>(Noor) فريق دعم نور</p>
    </div>
  `;
};
