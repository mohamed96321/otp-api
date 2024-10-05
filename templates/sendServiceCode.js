exports.sendServiceCodeTemplate = (fullName, type, serviceCode) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #dddddd; border-radius: 10px; background-color: #f9f9f9;">
      <h2 style="color: #333333;">Service Inquiry Code</h2>
      <p>Hello ${fullName},</p>
      <p>Your inquiry for the service '${type}' has the code: <strong>${serviceCode}</strong>.</p>
      <p>If you have any questions, feel free to contact our support team.</p>
      <p>Email: LcQDQ@example.com</p>
      <p>Phone: 123-456-7890</p>
      <p>Thank you,</p>
      <p>Your Service Team</p>
    </div>
  `;
};
