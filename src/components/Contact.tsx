'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send } from 'lucide-react';
import emailjs from 'emailjs-com';

const inputClass =
  'w-full rounded-[14px] bg-bento-page px-4 py-3 text-bento-black placeholder-bento-graphite/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-purple transition-shadow duration-200';

const Contact = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      },
      EMAILJS_PUBLIC_KEY
    );
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3500);
    setFormData({ name: '', email: '', subject: '', message: '' });
  } catch {
    setShowError(true);
    setTimeout(() => setShowError(false), 3500);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <section id="contact" className="px-4 py-6 sm:px-6 lg:px-10">
      {/* Toast de éxito */}
      {showSuccess && (
        <div className="fixed top-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-bento-mint px-6 py-3 text-sm font-medium text-bento-black animate-fade-in">
          Your message was sent successfully! I&apos;ll get back to you soon.
        </div>
      )}
      {/* Toast de error */}
      {showError && (
        <div className="fixed top-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-bento-amber px-6 py-3 text-sm font-medium text-bento-black animate-fade-in">
          Something went wrong sending your message. Please try again later.
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="mx-auto max-w-2xl rounded-[24px] bg-bento-page/40 p-6 sm:p-8"
      >
        <div className="mb-10 text-center">
          <span className="mb-3 inline-block rounded-full bg-bento-page px-4 py-1.5 text-sm font-semibold text-bento-black">
            Get In Touch
          </span>
          <h2 className="mb-4 font-display text-3xl font-extrabold text-bento-black sm:text-4xl">
            Let&apos;s work together
          </h2>
          <p className="mx-auto max-w-lg leading-relaxed text-bento-graphite">
            I&apos;m always open to discussing new opportunities, collaborations, or just having a chat about data and automation. Drop me a message!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-semibold text-bento-black">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="Your Name"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-bento-black">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={inputClass}
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="mb-2 block text-sm font-semibold text-bento-black">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className={inputClass}
              placeholder="What's this about?"
            />
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-semibold text-bento-black">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className={`${inputClass} resize-vertical`}
              placeholder="Tell me about your project, idea, or just say hello!"
            />
          </div>

          <div className="pt-2 text-center">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.04 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-bento-purple px-8 py-4 text-sm font-semibold text-bento-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bento-black focus-visible:ring-offset-2 focus-visible:ring-offset-bento-container"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-bento-black border-t-transparent" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Message</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </section>
  );
};

export default Contact;
