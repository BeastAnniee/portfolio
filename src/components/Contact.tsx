'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send } from 'lucide-react';

const Contact = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setIsSubmitting(false);
      // Reset form
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1000);
  };

  return (
    <section id="contact" className="py-24 px-6 lg:px-8 bg-[#0a192f]">
      <div className="max-w-2xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-[#64ffda] font-mono text-base block mb-4">04. What&apos;s Next?</span>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#ccd6f6] mb-6">Get In Touch</h2>
          <p className="text-[#8892b0] text-lg leading-relaxed max-w-lg mx-auto">
            I&apos;m always open to discussing new opportunities, collaborations, or just having a chat about technology. Drop me a message!
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          {/* Name and Email Row */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <label htmlFor="name" className="block text-[#ccd6f6] font-mono text-sm mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#112240] border border-[#233554] rounded text-[#ccd6f6] placeholder-[#8892b0] focus:border-[#64ffda] focus:outline-none transition-colors duration-300"
                placeholder="Your Name"
              />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <label htmlFor="email" className="block text-[#ccd6f6] font-mono text-sm mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-[#112240] border border-[#233554] rounded text-[#ccd6f6] placeholder-[#8892b0] focus:border-[#64ffda] focus:outline-none transition-colors duration-300"
                placeholder="your.email@example.com"
              />
            </motion.div>
          </div>

          {/* Subject */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
          >
            <label htmlFor="subject" className="block text-[#ccd6f6] font-mono text-sm mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-[#112240] border border-[#233554] rounded text-[#ccd6f6] placeholder-[#8892b0] focus:border-[#64ffda] focus:outline-none transition-colors duration-300"
              placeholder="What's this about?"
            />
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <label htmlFor="message" className="block text-[#ccd6f6] font-mono text-sm mb-2">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              rows={6}
              className="w-full px-4 py-3 bg-[#112240] border border-[#233554] rounded text-[#ccd6f6] placeholder-[#8892b0] focus:border-[#64ffda] focus:outline-none transition-colors duration-300 resize-vertical"
              placeholder="Tell me about your project, idea, or just say hello!"
            />
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            viewport={{ once: true }}
            className="text-center pt-4"
          >
            <motion.button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#64ffda] text-[#0a192f] font-mono text-sm rounded hover:bg-[#64ffda]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              whileHover={{ scale: isSubmitting ? 1 : 1.05, y: isSubmitting ? 0 : -2 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#0a192f] border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
};

export default Contact;
