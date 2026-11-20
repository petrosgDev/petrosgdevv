export interface ContactFormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactValidationErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export interface ContactSubmissionResult {
  status: 'sent' | 'mailto_ready' | 'error';
  message: string;
  mailtoUrl?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateContactForm(values: ContactFormValues): ContactValidationErrors {
  const errors: ContactValidationErrors = {};

  if (values.name.trim().length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }

  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }

  if (values.subject.trim().length < 3) {
    errors.subject = 'Please include a short subject (at least 3 characters).';
  }

  if (values.message.trim().length < 10) {
    errors.message = 'Please write a message of at least 10 characters.';
  }

  return errors;
}

export function hasValidationErrors(errors: ContactValidationErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function buildMailtoUrl(recipientEmail: string, values: ContactFormValues): string {
  const body = [
    `Name: ${values.name.trim()}`,
    `Email: ${values.email.trim()}`,
    '',
    values.message.trim(),
  ].join('\n');

  const params = new URLSearchParams({
    subject: values.subject.trim(),
    body,
  });

  return `mailto:${recipientEmail}?${params.toString()}`;
}

export function buildPlainTextMessage(values: ContactFormValues): string {
  return [
    `To: petrosgeto7@gmail.com`,
    `Subject: ${values.subject.trim()}`,
    `From: ${values.name.trim()} <${values.email.trim()}>`,
    '',
    values.message.trim(),
  ].join('\n');
}

/**
 * Submits contact inquiries honestly:
 * 1. If NEXT_PUBLIC_CONTACT_ENDPOINT is configured (e.g. Formspree, Web3Forms, or custom API),
 *    sends a real JSON POST request and reports genuine server delivery or failure.
 * 2. Otherwise, prepares a verified mailto: dispatch URL without fabricating delivery.
 */
export async function submitContactInquiry(
  values: ContactFormValues,
  recipientEmail: string,
  endpoint?: string
): Promise<ContactSubmissionResult> {
  const trimmedEndpoint = endpoint?.trim();
  const mailtoUrl = buildMailtoUrl(recipientEmail, values);

  if (trimmedEndpoint) {
    try {
      const response = await fetch(trimmedEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
        }),
      });

      if (!response.ok) {
        return {
          status: 'error',
          message: `The email endpoint returned status ${response.status}. You can still send your message directly using your email client below.`,
          mailtoUrl,
        };
      }

      return {
        status: 'sent',
        message: 'Your inquiry has been delivered. Thank you for reaching out—I will reply soon.',
      };
    } catch {
      return {
        status: 'error',
        message:
          'Unable to reach the configured contact endpoint right now. Use the direct email option below to send your message immediately.',
        mailtoUrl,
      };
    }
  }

  return {
    status: 'mailto_ready',
    message:
      'Your message is validated and formatted for direct email dispatch to petrosgeto7@gmail.com.',
    mailtoUrl,
  };
}
