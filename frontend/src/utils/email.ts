const EMAILJS_ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

export type ContactMessage = {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
};

export function isEmailContactConfigured() {
  return Boolean(
    import.meta.env.VITE_EMAILJS_SERVICE_ID
      && import.meta.env.VITE_EMAILJS_TEMPLATE_ID
      && import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  );
}

export async function sendContactMessage(message: ContactMessage) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error("The contact form has not been configured yet.");
  }

  const response = await fetch(EMAILJS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: {
        from_name: message.name,
        reply_to: message.email,
        subject: message.subject,
        category: message.category,
        message: message.message,
      },
    }),
  });

  if (!response.ok) {
    const responseMessage = (await response.text()).trim();
    throw new Error(
      responseMessage
        ? `Email service error (${response.status}): ${responseMessage}`
        : `Email service error (${response.status}). Please try again later.`,
    );
  }
}
