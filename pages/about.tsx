import { useState, FormEvent } from 'react';
import type { NextPage } from 'next';
import { Turnstile } from '@marsidev/react-turnstile';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const About: NextPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const set = (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, _trap: '', turnstileToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setErrorMsg(data.error ?? 'Something went wrong. Please try again.');
      } else {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setTurnstileToken(null);
      }
    } catch {
      setStatus('error');
      setErrorMsg('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">About DECUR</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-blue-900 to-indigo-900" />

          <div className="px-6 py-8 -mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4">
                DECUR (Data Exceeding Current Understanding of Reality) is dedicated to cataloging, analyzing, and
                making accessible insider testimony that extends beyond conventional scientific and governmental acknowledgment.
                We focus on Unidentified Aerial Phenomena (UAP), Non-Human Intelligence (NHI), and advanced technologies
                as reported by credible witnesses from military, intelligence, scientific, and government backgrounds.
              </p>
              <p className="text-gray-700">
                We believe that scientific and public understanding benefits from the organized preservation of this testimony.
                By providing a structured repository of information that challenges conventional paradigms, we aim to
                facilitate research, cross-referencing, and pattern recognition across multiple witness accounts.
              </p>
            </div>

            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-bold mb-3">Platform Purpose</h2>
                <p className="text-gray-700">
                  DECUR serves as a comprehensive knowledge base cataloging testimony from credible insiders
                  across military, intelligence, scientific, and government backgrounds. We present this information
                  with analytical rigor while maintaining neutrality, allowing researchers to examine the data and
                  draw their own conclusions about the nature of UAP/NHI phenomena.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">What We Cover</h2>
                <p className="text-gray-700">
                  Our database spans testimony from insiders including military personnel, intelligence officers,
                  government contractors, and scientific researchers who have come forward with accounts of UAP
                  encounters, recovered materials, non-human intelligence, and special access programs.
                </p>
                <p className="text-gray-700 mt-2">
                  Topics include extraterrestrial biological entities, timeline mechanics, advanced propulsion and
                  energy technologies, cellular and genetic research, and classified program activity. DECUR is
                  continuously expanding as new testimony and corroborating evidence emerges.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3">Contact</h2>

                {status === 'success' ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                    <h3 className="text-sm font-semibold text-green-800 mb-1">Message sent</h3>
                    <p className="text-sm text-green-700">
                      Thank you for reaching out. We will follow up at the email you provided.
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="mt-3 text-xs text-green-700 underline hover:no-underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                    {/* Honeypot - hidden from real users */}
                    <input
                      type="text"
                      name="_trap"
                      tabIndex={-1}
                      aria-hidden="true"
                      className="absolute opacity-0 pointer-events-none h-0 w-0"
                      autoComplete="off"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          value={formData.name}
                          onChange={set('name')}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          id="email"
                          value={formData.email}
                          onChange={set('email')}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="Your email"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        value={formData.subject}
                        onChange={set('subject')}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Message subject"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        value={formData.message}
                        onChange={set('message')}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Your message"
                      />
                    </div>

                    {status === 'error' && (
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-700">{errorMsg}</p>
                      </div>
                    )}

                    <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '1x00000000000000000000AA'}
                      onSuccess={(token) => setTurnstileToken(token)}
                      onExpire={() => setTurnstileToken(null)}
                      onError={() => setTurnstileToken(null)}
                    />

                    <div>
                      <button
                        type="submit"
                        disabled={status === 'submitting' || !turnstileToken}
                        className="btn btn-primary px-6 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {status === 'submitting' ? 'Sending...' : 'Send Message'}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Disclaimer</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        DECUR presents information for educational and research purposes only. We neither endorse nor dismiss
                        the claims contained within the insider testimony we archive, but rather provide a platform for organized
                        access to this material. The accounts documented here may challenge conventional understanding and official narratives.
                        Readers are encouraged to apply critical thinking and draw their own conclusions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
