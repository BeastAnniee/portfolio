'use client';

import { useEffect, useRef, useState } from 'react';
import { CircleAlert, CircleCheck, Loader, Send } from 'lucide-react';
import emailjs from 'emailjs-com';
import type { Dictionary } from '@/content/types.ts';
import {
  TIMEOUT_MS,
  readEmailConfig,
  sendContact,
  statusAfterEdit,
  validateContact,
  type ContactData,
  type ContactError,
  type ContactField,
} from '@/lib/contact.ts';

interface ContactProps {
  copy: Dictionary['contact'];
  email: string;
}

type Status = 'idle' | 'sending' | 'success' | 'error';

const inputClass =
  'min-h-11 w-full rounded-xl bg-carbon-2 px-4 py-3 text-base text-bone placeholder:text-bone-2';

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
    setStatus(statusAfterEdit);
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
      className: `${inputClass} ${message ? 'border-2 border-accent' : 'border border-line'}${type === 'textarea' ? ' resize-y' : ''}`,
    };
    return (
      <div key={field}>
        <label htmlFor={common.id} className="mb-2 block font-mono text-xs font-medium uppercase tracking-[0.12em] text-bone">
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
          <p id={`contact-${field}-error`} className="mt-2 flex items-start gap-2 text-base text-bone">
            <CircleAlert className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{message}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <section id="contact" aria-labelledby="contact-title" className="@container py-10">
      <div className="max-w-2xl">
        <div className="mb-8">
          <p className="mb-2 font-mono text-xs font-medium uppercase tracking-[0.12em] text-bone-2">
            {copy.badge}
          </p>
          <h2
            id="contact-title"
            className="mb-4 font-display text-[clamp(2.5rem,8cqi,4.5rem)] uppercase leading-[0.95] text-accent"
          >
            {copy.title}
          </h2>
          <p className="max-w-[65ch] text-base text-bone">{copy.intro}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="grid gap-5 @xl:grid-cols-2">
            {renderField('name', 'text')}
            {renderField('email', 'email')}
          </div>
          {renderField('subject', 'text')}
          {renderField('message', 'textarea')}

          <div aria-live="polite">
            {status === 'sending' && (
              <p role="status" className="sr-only">{copy.sending}</p>
            )}
            {status === 'success' && (
              <p role="status" className="flex items-center gap-2 rounded-xl border border-bone px-4 py-3 text-base text-bone">
                <CircleCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                {copy.success}
              </p>
            )}
          </div>
          {status === 'error' && (
            <div
              ref={failureRef}
              tabIndex={-1}
              role="alert"
              className="flex items-start gap-2 rounded-xl border-2 border-accent px-4 py-3 text-base text-bone"
            >
              <CircleAlert className="mt-1 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              <span>
                {copy.failure}{' '}
                <a href={`mailto:${email}`} className="font-semibold text-accent underline underline-offset-4">
                  {email}
                </a>
              </span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={status === 'sending'}
              className="press inline-flex h-12 items-center gap-2 rounded-xl border border-transparent bg-accent px-8 font-semibold text-carbon hover:bg-bone disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'sending' ? (
                <>
                  <Loader className="spin h-4 w-4" aria-hidden="true" />
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
