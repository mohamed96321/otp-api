// Email template for in-progress update
exports.inProgressUpdateTemplate = (fullName, message) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dddddd; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #333333;">تحديث حالة الخدمة (قيد التنفيذ)</h2>
      <p>مرحبًا ${fullName},</p>
      <p>${message}</p>
      <p>إذا كان لديك أي استفسارات، لا تتردد في <a href="https://norhomecare.com/contact" style="color: #0066cc; text-decoration: none;">التواصل معنا</a>.</p>
      <p>تابع خدمتك من خلال هذا الرابط<a href="https://norhomecare.com/FollowUp" style="color: #0066cc; text-decoration: none;">تابع هنا</a>.</p>
      <p>(Noor) شكرًا لاختيارك نور،</p>
      <p>(Noor) فريق دعم نور</p>
    </div>
  `;
};
