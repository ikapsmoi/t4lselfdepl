import React, { useState } from 'react';
import { Instagram, Facebook, Mail, Phone, MapPin, Send, Star, Shield, MessageCircle } from 'lucide-react';
import { getTravel4LifeContactContext, getTravel4LifeWhatsAppUrl, TRAVEL4LIFE_CONTACT, type Travel4LifeContactContext } from '../../utils/travel4lifeContact.js';
import { trackContactEvent } from '../../utils/analytics';

interface FooterProps {
  setIsMenuOpen?: (isOpen: boolean) => void;
  contactContext?: Travel4LifeContactContext;
}

type FooterLink = {
  name: string;
  href?: string;
  onClick?: () => void;
};

export const Footer: React.FC<FooterProps> = ({ setIsMenuOpen, contactContext }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const contact = contactContext || getTravel4LifeContactContext();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      const subject = 'Newsletter Signup';
      const body = `Email: ${email}\nDate: ${new Date().toLocaleString()}`;
      window.open(`mailto:${TRAVEL4LIFE_CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const footerLinks: Record<string, FooterLink[]> = {
    company: [
      { name: 'About Us', onClick: () => { window.location.hash = 'about'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
      { name: 'How it Works', onClick: () => { window.location.hash = 'how-it-works'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
      { name: 'Blog', onClick: () => { window.location.hash = 'blog'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
      { name: 'Safety & Trust', onClick: () => { window.location.hash = 'safety'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
      { name: 'Careers', onClick: () => { window.location.hash = 'careers'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
    ],
    travelers: [
      { name: 'Jim Corbett Guide', href: '/jim-corbett/' },
      { name: 'Corbett Resorts', href: '/jim-corbett/resorts/' },
      { name: 'Europe Travel', href: '/europe/' },
      { name: 'Browse Trips', onClick: () => { window.location.hash = 'trips'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
      { name: 'India Specials', onClick: () => { window.location.hash = 'home'; setTimeout(() => { document.getElementById('india-specials')?.scrollIntoView({ behavior: 'smooth' }); }, 300); setIsMenuOpen?.(false); } },
      { name: 'Reviews', onClick: () => { window.location.hash = 'reviews'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
    ],
    hosts: [
      { name: 'Become a Host', onClick: () => { window.location.hash = 'how-it-works'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
      { name: 'Top Hosts', onClick: () => { window.location.hash = 'creator-trips'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
    ],
    support: [
      { name: 'Help Center', onClick: () => { window.location.hash = 'help'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
      { name: 'Terms of Service', onClick: () => { window.location.hash = 'terms'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
      { name: 'Privacy Policy', onClick: () => { window.location.hash = 'privacy'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
      { name: 'Live', onClick: () => { window.location.hash = 'package-creator'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
      { name: 'Admin', onClick: () => { window.location.hash = 'admin-dashboard'; window.scrollTo(0, 0); setIsMenuOpen?.(false); } },
    ],
  };

  return (
    <footer className="bg-gray-950 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-tight">Get travel inspiration</h3>
              <p className="text-gray-400 text-sm">Exclusive deals, new trips, and community stories. No spam.</p>
            </div>
            {subscribed ? (
              <div className="text-teal-400 font-semibold text-sm">Welcome to the Travel4life community!</div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex w-full min-w-0 max-w-md flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required
                  className="min-h-12 w-full min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 transition-colors focus:border-white/30 focus:outline-none sm:rounded-l-2xl sm:rounded-r-none sm:px-5 sm:py-3.5"
                />
                <button
                  type="submit"
                  className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100 sm:w-auto sm:rounded-l-none sm:rounded-r-2xl sm:px-6 sm:py-3.5"
                >
                  <Send className="w-4 h-4" />
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-5">
              <img src="/optimized/logo.webp" alt="Travel4life" width={32} height={32} loading="lazy" decoding="async" className="w-8 h-8 object-contain" />
              <span className="ml-2 text-xl font-bold text-white">Travel4life</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-sm">
              Founded in 2014, India's most trusted gateway to international music festivals and curated group travel experiences.
            </p>

            {/* Contact */}
            <div className="space-y-2.5 mb-6">
              <a href={`mailto:${TRAVEL4LIFE_CONTACT.email}`} onClick={() => void trackContactEvent('contact_email_click', contact)} className="flex items-start gap-2.5 text-gray-400 hover:text-white">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                <span className="text-sm">{TRAVEL4LIFE_CONTACT.email}</span>
              </a>
              <a href={`tel:${TRAVEL4LIFE_CONTACT.phoneHref}`} onClick={() => void trackContactEvent('contact_phone_click', contact)} className="flex items-start gap-2.5 text-gray-400 hover:text-white">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                <span className="text-sm">{TRAVEL4LIFE_CONTACT.phone}</span>
              </a>
              <a href={getTravel4LifeWhatsAppUrl(contact)} target="_blank" rel="noopener noreferrer" onClick={() => void trackContactEvent('contact_whatsapp_click', contact)} className="flex items-start gap-2.5 text-gray-400 hover:text-white">
                <MessageCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                <span className="text-sm">WhatsApp Us</span>
              </a>
              <div className="flex items-start gap-2.5 text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                <span className="text-sm">New Delhi, India</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 mb-6">
              {[
                { icon: Instagram, href: 'https://www.instagram.com/travel4life_net/', label: 'Instagram' },
                { icon: Facebook, href: 'https://www.facebook.com/thetravellersstore/', label: 'Facebook' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: 'Company', links: footerLinks.company },
            { title: 'Travelers', links: footerLinks.travelers },
            { title: 'Support', links: footerLinks.support },
          ].map(({ title, links }) => (
            <div key={title}>
              <h3 className="font-semibold text-white text-sm mb-4 tracking-wide">{title}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.href ? (
                      <a
                        href={link.href}
                        onClick={() => setIsMenuOpen?.(false)}
                        className="text-gray-400 hover:text-white transition-colors duration-200 text-sm text-left"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <button
                        onClick={link.onClick}
                        className="text-gray-400 hover:text-white transition-colors duration-200 text-sm text-left"
                      >
                        {link.name}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Partners */}
        <div className="border-t border-white/5 pt-8 mb-8">
          <p className="text-center text-xs text-gray-500 uppercase tracking-wider font-medium mb-4">Our Partners</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-gray-500 text-xs">
            <span className="font-medium text-gray-400">Accor Hotels</span>
            <span className="font-medium text-gray-400">IATA</span>
            <span className="font-medium text-gray-400">Marriott</span>
            <span className="font-medium text-gray-400">Taj Hotels</span>
            <span className="font-medium text-gray-400">Emirates</span>
            <span className="font-medium text-gray-400">IndiGo</span>
            <span className="font-medium text-gray-400">Air India</span>
            <span className="font-medium text-gray-400">Ultra</span>
            <span className="font-medium text-gray-400">EDC</span>
            <span className="font-medium text-gray-400">Booking.com</span>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="border-t border-white/5 pt-8 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 text-xs">
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> SSL Secured</span>
            <span>GST 07AIGPK7468L1ZN</span>
            <span>MSME UDYAM-DL010106969</span>
            <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Since 2014</span>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            © 2026 Travel4life. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <button
              onClick={() => { window.location.hash = 'privacy'; window.scrollTo(0, 0); setIsMenuOpen?.(false); }}
              className="text-gray-500 hover:text-gray-300 transition-colors text-xs"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => { window.location.hash = 'terms'; window.scrollTo(0, 0); setIsMenuOpen?.(false); }}
              className="text-gray-500 hover:text-gray-300 transition-colors text-xs"
            >
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
