import React, { useState } from 'react';
import { Mail, Send, Gift, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAnalytics } from '../../utils/analytics';

export const Newsletter: React.FC = () => {
  const { newsletterSignup } = useAnalytics();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Track newsletter signup
      newsletterSignup(email);
      
      // Send email to support@traveltag.net
      const subject = 'New Newsletter Subscription - TravelTag';
      const body = `New newsletter subscription request:
      
Email: ${email}
Date: ${new Date().toLocaleString()}
Source: TravelTag Newsletter Signup

Please add this email to the newsletter list.`;
      
      const mailtoLink = `mailto:support@traveltag.net?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, '_blank');
      
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const benefits = [
    { icon: Zap, text: 'Early access to new trips' },
    { icon: Gift, text: 'Exclusive member discounts' },
    { icon: Mail, text: 'Weekly travel inspiration' },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mb-6">
            <Mail className="w-10 h-10 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get Travel Inspiration
          </h2>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Subscribe to our newsletter and be the first to know about new adventures, 
            exclusive deals, and travel tips from our global community of explorers.
          </p>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center justify-center space-x-2 text-gray-600">
                <benefit.icon className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {subscribed ? (
            <div className="bg-green-100 border border-green-200 text-green-800 p-6 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Gift className="w-6 h-6 mr-2" />
                <span className="font-semibold">Welcome to the TravelTag family!</span>
              </div>
              <p>Check your email for a special welcome offer and travel inspiration.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
                required
              />
              <Button 
                type="submit" 
                icon={Send}
                className="sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                Subscribe
              </Button>
            </form>
          )}

          <p className="text-xs text-gray-500 mt-4">
            No spam, ever. Unsubscribe anytime. By subscribing, you agree to our privacy policy.
          </p>
        </div>
      </div>
    </section>
  );
};