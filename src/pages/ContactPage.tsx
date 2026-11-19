import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Copy,
  Mail,
  Send,
} from 'lucide-react';
import { SITE_PROFILE, SOCIAL_LINKS } from '../data/portfolio';
import {
  buildPlainTextMessage,
  hasValidationErrors,
  submitContactInquiry,
  validateContactForm,
  type ContactFormValues,
  type ContactSubmissionResult,
  type ContactValidationErrors,
} from '../utils/contact';
import { updatePageSeo } from '../utils/seo';

const INITIAL_VALUES: ContactFormValues = {
  name: '',
  email: '',
  subject: '',
  message: '',
};

export function ContactPage() {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<ContactValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ContactSubmissionResult | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  const configuredEndpoint = (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined) ?? '';

  useEffect(() => {
    updatePageSeo({
      title: `Contact — ${SITE_PROFILE.fullName} (${SITE_PROFILE.brand})`,
      description:
        'Reach out to Petros Geto via email, LinkedIn, GitHub, Telegram, WhatsApp, or the direct inquiry form for software engineering collaborations.',
      path: '/contact',
    });
  }, []);

  const handleFieldChange = (field: keyof ContactFormValues, nextValue: string) => {
    setValues((prev) => ({ ...prev, [field]: nextValue }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SITE_PROFILE.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2400);
    } catch {
      // Clipboard API may be unavailable
    }
  };

  const handleCopyDraft = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainTextMessage(values));
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2400);
    } catch {
      // Clipboard API may be unavailable
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateContactForm(values);
    setErrors(validationErrors);

    if (hasValidationErrors(validationErrors)) {
      return;
    }

    setSubmitting(true);
    setResult(null);

    try {
      const submission = await submitContactInquiry(
        values,
        SITE_PROFILE.email,
        configuredEndpoint
      );
      setResult(submission);

      if (submission.status === 'sent') {
        setValues(INITIAL_VALUES);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setResult(null);
    setCopiedDraft(false);
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-10 md:py-16">
      <header className="pb-12 border-b border-[#EAEAEA] dark:border-[#222220]">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8 space-y-2.5">
            <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
              Contact · {SITE_PROFILE.location}
            </p>
            <h1 className="font-display text-[2.4rem] sm:text-[3.1rem] font-extrabold uppercase leading-[0.98] tracking-[-0.01em] text-[#1A1A1A] dark:text-[#F0F0EE]">
              Get in Touch.
            </h1>
          </div>
          <div className="lg:col-span-4">
            <p className="text-[13px] leading-[1.75] text-[#666666] dark:text-[#9A9A96]">
              {SITE_PROFILE.availabilityNote}
            </p>
          </div>
        </div>
      </header>

      <div className="pt-12 grid grid-cols-1 gap-14 lg:grid-cols-12">
        {/* Left Column: Direct Channels */}
        <aside className="lg:col-span-5 space-y-8">
          <div className="space-y-2">
            <h2 className="font-display text-[22px] font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
              Direct Channels
            </h2>
            <p className="text-[13px] leading-[1.75] text-[#666666] dark:text-[#9A9A96]">
              Prefer reaching out directly? Use email, LinkedIn, GitHub, Telegram, or WhatsApp—every
              channel below connects straight to me.
            </p>
          </div>

          <div className="divide-y divide-[#EAEAEA] dark:divide-[#222220] border-y border-[#EAEAEA] dark:border-[#222220]">
            {SOCIAL_LINKS.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between gap-4 py-3.5">
                <div className="min-w-0">
                  <p className="text-[11px] text-[#666666] dark:text-[#9A9A96]">{channel.label}</p>
                  <a
                    href={channel.href}
                    target={channel.external ? '_blank' : undefined}
                    rel={channel.external ? 'noopener noreferrer' : undefined}
                    className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:underline underline-offset-4 break-all"
                  >
                    <span>{channel.handle}</span>
                    {channel.external && (
                      <ArrowUpRight className="h-3 w-3 shrink-0 opacity-55" aria-hidden="true" />
                    )}
                  </a>
                </div>

                {channel.id === 'email' && (
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    aria-label="Copy email address"
                    className="inline-flex h-8 items-center gap-1.5 border border-[#EAEAEA] dark:border-[#222220] px-2.5 text-[11px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="h-3 w-3" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1.5 text-[11.5px] text-[#666666] dark:text-[#9A9A96]">
            <p className="font-mono">Delivery Transparency</p>
            <p className="leading-relaxed">
              {configuredEndpoint
                ? 'This form submits directly to the configured contact webhook endpoint.'
                : 'Submitting the form validates your inquiry and prepares an immediate email dispatch to petrosgeto7@gmail.com (or connect VITE_CONTACT_ENDPOINT in .env for webhook delivery).'}
            </p>
          </div>
        </aside>

        {/* Right Column: Validated Form */}
        <section aria-label="Contact inquiry form" className="lg:col-span-7">
          {result?.status === 'sent' ? (
            <div
              role="status"
              className="border border-[#EAEAEA] dark:border-[#222220] bg-[#FAFAFA] dark:bg-[#111110] p-8 space-y-4"
            >
              <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#1A1A1A] dark:text-[#F0F0EE]">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Message Delivered</span>
              </div>
              <h2 className="font-display text-2xl font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                Thank you for reaching out.
              </h2>
              <p className="text-[13px] leading-relaxed text-[#666666] dark:text-[#9A9A96]">
                {result.message}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex h-10 items-center bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-80 transition-opacity cursor-pointer"
              >
                Send another message
              </button>
            </div>
          ) : result?.status === 'mailto_ready' ? (
            <div
              role="status"
              className="border border-[#EAEAEA] dark:border-[#222220] bg-[#FAFAFA] dark:bg-[#111110] p-8 space-y-5"
            >
              <div className="space-y-1.5">
                <p className="text-[11px] font-mono text-[#666666] dark:text-[#9A9A96]">
                  Validated · Ready for Email Dispatch
                </p>
                <h2 className="font-display text-2xl font-bold uppercase text-[#1A1A1A] dark:text-[#F0F0EE]">
                  Send Your Prepared Email
                </h2>
                <p className="text-[13px] leading-relaxed text-[#666666] dark:text-[#9A9A96]">
                  {result.message} Click below to launch your mail client or copy the formatted
                  message.
                </p>
              </div>

              <pre className="overflow-x-auto border border-[#EAEAEA] dark:border-[#222220] bg-white dark:bg-[#0A0A0A] p-4 font-mono text-[11.5px] leading-relaxed text-[#1A1A1A] dark:text-[#F0F0EE] whitespace-pre-wrap">
                {buildPlainTextMessage(values)}
              </pre>

              <div className="flex flex-wrap items-center gap-3">
                {result.mailtoUrl && (
                  <a
                    href={result.mailtoUrl}
                    className="inline-flex h-10 items-center gap-2 bg-[#1A1A1A] dark:bg-[#F0F0EE] px-4 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-80 transition-opacity whitespace-nowrap"
                  >
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Open in Email Client</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={handleCopyDraft}
                  className="inline-flex h-10 items-center gap-1.5 border border-[#EAEAEA] dark:border-[#222220] px-4 text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE] hover:border-[#1A1A1A] dark:hover:border-[#F0F0EE] transition-colors whitespace-nowrap cursor-pointer"
                >
                  {copiedDraft ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Message Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Message</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex h-10 items-center px-2 text-[12px] text-[#666666] dark:text-[#9A9A96] hover:text-[#1A1A1A] dark:hover:text-[#F0F0EE] underline underline-offset-4 cursor-pointer"
                >
                  Edit or start new
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {result?.status === 'error' && (
                <div
                  role="alert"
                  className="border border-red-600/35 bg-red-50 dark:bg-red-950/30 p-4 text-[13px] text-red-800 dark:text-red-200 space-y-2"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Delivery Notice</span>
                  </div>
                  <p>{result.message}</p>
                  {result.mailtoUrl && (
                    <a
                      href={result.mailtoUrl}
                      className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4"
                    >
                      <span>Open pre-filled email instead</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-name"
                    className="block text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]"
                  >
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={values.name}
                    onChange={(event) => handleFieldChange('name', event.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? 'contact-name-error' : undefined}
                    placeholder="Enter your full name"
                    className={`h-10 w-full border bg-transparent px-3 text-[13px] text-[#1A1A1A] dark:text-[#F0F0EE] placeholder:text-[#666666]/65 dark:placeholder:text-[#9A9A96]/65 focus:outline-none transition-colors ${
                      errors.name
                        ? 'border-red-600 dark:border-red-400'
                        : 'border-[#EAEAEA] dark:border-[#222220] focus:border-[#1A1A1A] dark:focus:border-[#F0F0EE]'
                    }`}
                  />
                  {errors.name && (
                    <p
                      id="contact-name-error"
                      role="alert"
                      className="text-[11.5px] text-red-700 dark:text-red-400"
                    >
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="contact-email"
                    className="block text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]"
                  >
                    Your Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={values.email}
                    onChange={(event) => handleFieldChange('email', event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'contact-email-error' : undefined}
                    placeholder="name@example.com"
                    className={`h-10 w-full border bg-transparent px-3 text-[13px] text-[#1A1A1A] dark:text-[#F0F0EE] placeholder:text-[#666666]/65 dark:placeholder:text-[#9A9A96]/65 focus:outline-none transition-colors ${
                      errors.email
                        ? 'border-red-600 dark:border-red-400'
                        : 'border-[#EAEAEA] dark:border-[#222220] focus:border-[#1A1A1A] dark:focus:border-[#F0F0EE]'
                    }`}
                  />
                  {errors.email && (
                    <p
                      id="contact-email-error"
                      role="alert"
                      className="text-[11.5px] text-red-700 dark:text-red-400"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-subject"
                  className="block text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  value={values.subject}
                  onChange={(event) => handleFieldChange('subject', event.target.value)}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? 'contact-subject-error' : undefined}
                  placeholder="Project inquiry, collaboration, or technical question"
                  className={`h-10 w-full border bg-transparent px-3 text-[13px] text-[#1A1A1A] dark:text-[#F0F0EE] placeholder:text-[#666666]/65 dark:placeholder:text-[#9A9A96]/65 focus:outline-none transition-colors ${
                    errors.subject
                      ? 'border-red-600 dark:border-red-400'
                      : 'border-[#EAEAEA] dark:border-[#222220] focus:border-[#1A1A1A] dark:focus:border-[#F0F0EE]'
                  }`}
                />
                {errors.subject && (
                  <p
                    id="contact-subject-error"
                    role="alert"
                    className="text-[11.5px] text-red-700 dark:text-red-400"
                  >
                    {errors.subject}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="contact-message"
                  className="block text-[12px] font-medium text-[#1A1A1A] dark:text-[#F0F0EE]"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={6}
                  required
                  value={values.message}
                  onChange={(event) => handleFieldChange('message', event.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? 'contact-message-error' : undefined}
                  placeholder="Share context about your project, goals, or timeline..."
                  className={`w-full border bg-transparent p-3 text-[13px] leading-relaxed text-[#1A1A1A] dark:text-[#F0F0EE] placeholder:text-[#666666]/65 dark:placeholder:text-[#9A9A96]/65 focus:outline-none transition-colors ${
                    errors.message
                      ? 'border-red-600 dark:border-red-400'
                      : 'border-[#EAEAEA] dark:border-[#222220] focus:border-[#1A1A1A] dark:focus:border-[#F0F0EE]'
                  }`}
                />
                {errors.message && (
                  <p
                    id="contact-message-error"
                    role="alert"
                    className="text-[11.5px] text-red-700 dark:text-red-400"
                  >
                    {errors.message}
                  </p>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex h-10 items-center gap-2 bg-[#1A1A1A] dark:bg-[#F0F0EE] px-5 text-[12px] font-medium text-white dark:text-[#0A0A0A] hover:opacity-80 disabled:opacity-60 transition-opacity whitespace-nowrap cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>
                    {submitting
                      ? 'Processing...'
                      : configuredEndpoint
                      ? 'Send Message'
                      : 'Prepare Email Inquiry'}
                  </span>
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
