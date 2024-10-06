exports.sendServiceCodeTemplate = (fullName, serviceCode) => {
  return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dddddd; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #333333;">رمز الاستعلام عن الخدمة</h2>
      <p>مرحباً ${fullName}،</p>
      <p>تم استلام طلبك بنجاح. سنقوم بالمتابعة قريبًا.</p>
      <p>رمز الاستعلام عن خدمتك هو:</p>
      <div style="text-align: center; margin: 20px 0;">
        <p style="font-size: 24px; font-weight: bold; color: #333333;">${serviceCode}</p>
      </div>
      <p>إذا كان لديك أي استفسارات، لا تتردد في <a href="https://norhomecare.com/contact" style="color: #0066cc; text-decoration: none;">التواصل معنا</a>.</p>
      <p>(Noor) شكرًا لاختيارك نور،</p>
      <p>البريد الإلكتروني: LcQDQ@example.com</p>
      <p>الهاتف: 123-456-7890</p>
      <p>(Noor) فريق دعم نور</p>
    </div>
  `;
};
