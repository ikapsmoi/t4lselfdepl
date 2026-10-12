import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAnalytics } from '../../utils/analytics';

export const Newsletter: React.FC = () => {
  const { newsletterEnquiryStarted } = useAnalytics();
  const [email, setEmail] = useState('');
  const [emailDraftUrl, setEmailDraftUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      newsletterEnquiryStarted();
      const subject = 'Travel4Life email updates';
      const body = `Hello,\n\nI would like to receive occasional Travel4Life email updates.\nMy email address is: ${email.trim()}\n\nPlease let me know how to proceed.`;
      const mailtoLink = `mailto:info@travel4life.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setEmailDraftUrl(mailtoLink);
      setEmail('');
    }
  };

  return (
    <section className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 py-16 md:py-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-2xl border border-gray-100/80 bg-white p-6 shadow-lg sm:p-8 md:p-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">
            <Mail className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Travel Updates by Email
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Request occasional Travel4Life updates by email. This form prepares a message
            for you to send; it does not automatically add your address to a mailing list.
          </p>

          {emailDraftUrl ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 text-blue-900" role="status" aria-live="polite">
              <div className="flex items-center justify-center mb-2">
                <Mail className="w-6 h-6 mr-2" />
                <span className="font-semibold">Your email request is ready</span>
              </div>
              <p className="mb-4">It has not been sent yet. Open your email app and send the prepared message to complete your request.</p>
              <a
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
                href={emailDraftUrl}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                Open email app
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 flex-1 rounded-xl"
                required
              />
              <Button 
                type="submit" 
                icon={Send}
                className="sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                Prepare email request
              </Button>
            </form>
          )}

          <p className="text-xs text-gray-500 mt-4">
            Your address is included only in the message you choose to send. This form does not
            automatically subscribe you. See our <a className="underline" href="/#privacy">privacy notice</a>.
          </p>
        </div>
      </div>
    </section>
  );
};
