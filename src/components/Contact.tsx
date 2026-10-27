'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import emailjs from 'emailjs-com';
import type { Dictionary } from '@/content/types.ts';
import {
  TIMEOUT_MS,
  readEmailConfig,
  sendContact,
  validateContact,
  type ContactData,
  type ContactError,
  type ContactField,
} from '@/lib/contact.ts';
import SectionHeading from './SectionHeading';

interface ContactProps {
  copy: Dictionary['contact'];
  email: string;
}

type Status = 'idle' | 'sending' | 'success' | 'error';

const inputClass =
  'w-full rounded-[14px] bg-bento-page px-4 py-3 text-bento-black placeholder-bento-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple transition-shadow duration-200';

const emptyData: ContactData = { name: '', email: '', subject: '', message: '' };

const Contact = ({ copy, email }: ContactProps) => {
  const [data, setData] = useState<ContactData>(emptyData);
  const [errors, setErrors] = useState<Partial<Record<ContactField, ContactError>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const failureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'error') failureRef.current?.focus();
  }, [status]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const field = event.target.name as ContactField;
    setData((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (status === 'sending') return;

    const result = validateContact(data);
    setErrors(result.errors);
    if (result.firstInvalid) {
      setStatus('idle');
      fieldRefs.current[result.firstInvalid]?.focus();
      return;
    }

    setStatus('sending');
    // Acceso literal: Next solo sustituye process.env.NEXT_PUBLIC_X escrito tal cual.
    const config = readEmailConfig({
      service: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
      template: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
      key: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    });
    const outcome = await sendContact({
      send: (cfg, payload) =>
        emailjs.send(cfg.serviceId, cfg.templateId, { ...payload }, cfg.publicKey),
      config,
      data,
      timeoutMs: TIMEOUT_MS,
    });

    if (outcome.ok) {
      setData(emptyData);
      setStatus('success');
    } else {
      setStatus('error');
    }
  };

  const errorText = (field: ContactField): string | undefined => {
    const error = errors[field];
    if (!error) return undefined;
    return error === 'required' ? copy.errors.required : copy.errors.invalidEmail;
  };

  const renderField = (field: ContactField, type: 'text' | 'email' | 'textarea') => {
    const message = errorText(field);
    const common = {
      id: `contact-${field}`,
      name: field,
      value: data[field],
      onChange: handleChange,
      'aria-invalid': message ? true : undefined,
      'aria-describedby': message ? `contact-${field}-error` : undefined,
      placeholder: copy.placeholders[field],
      className: type === 'textarea' ? `${inputClass} resize-y` : inputClass,
    };
    return (
      <div key={field}>
        <label htmlFor={common.id} className="mb-2 block text-sm font-semibold text-bento-black">
          {copy.labels[field]}
        </label>
        {type === 'textarea' ? (
          <textarea
            {...common}
            rows={6}
            ref={(node) => {
              fieldRefs.current[field] = node;
            }}
          />
        ) : (
          <input
            {...common}
            type={type}
            autoComplete={field === 'name' ? 'name' : field === 'email' ? 'email' : 'off'}
            ref={(node) => {
              fieldRefs.current[field] = node;
            }}
          />
        )}
        {message && (
          <p id={`contact-${field}-error`} className="mt-2 text-sm font-medium text-bento-black underline decoration-bento-amber decoration-2 underline-offset-4">
            {message}
          </p>
        )}
      </div>
    );
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-2xl rounded-[24px] bg-bento-page/40 p-6 sm:p-8">
        <div className="mb-10 text-center">
          <SectionHeading id="contact-title">{copy.badge}</SectionHeading>
          <p className="mb-4 font-display text-3xl font-extrabold text-bento-black sm:text-4xl">{copy.title}</p>
          <p className="mx-auto max-w-lg leading-relaxed text-bento-graphite">{copy.intro}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            {renderField('name', 'text')}
            {renderField('email', 'email')}
          </div>
          {renderField('subject', 'text')}
          {renderField('message', 'textarea')}

          <div aria-live="polite">
            {status === 'sending' && (
              <p role="status" className="rounded-[14px] bg-bento-page px-4 py-3 text-sm font-medium text-bento-black">
                {copy.sending}
              </p>
            )}
            {status === 'success' && (
              <p role="status" className="rounded-[14px] bg-bento-mint px-4 py-3 text-sm font-medium text-bento-black">
                {copy.success}
              </p>
            )}
          </div>
          {status === 'error' && (
            <div
              ref={failureRef}
              tabIndex={-1}
              role="alert"
              className="rounded-[14px] bg-bento-amber px-4 py-3 text-sm font-medium text-bento-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-black"
            >
              {copy.failure}{' '}
              <a href={`mailto:${email}`} className="font-semibold underline underline-offset-4">
                {email}
              </a>
            </div>
          )}

          <div className="pt-2 text-center">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bento-purple px-8 py-4 text-sm font-semibold text-bento-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-black focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
            >
              {status === 'sending' ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-bento-black border-t-transparent" aria-hidden="true" />
                  <span>{copy.sending}</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" aria-hidden="true" />
                  <span>{copy.submit}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;
