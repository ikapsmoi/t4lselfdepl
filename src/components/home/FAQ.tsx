import React, { useState } from 'react';
import { getTravel4LifeContactContext, getTravel4LifeWhatsAppUrl } from '../../utils/travel4lifeContact.js';
import { trackContactEvent } from '../../utils/analytics';
import { ChevronDown, HelpCircle, CreditCard, Shield, Home } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const categories = [
    { id: 'general', label: 'General', icon: HelpCircle },
    { id: 'booking', label: 'Booking', icon: CreditCard },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'hosting', label: 'Hosting', icon: Home }
  ];

  const faqsByCategory = {
    general: [
      {
        question: 'How does Travel4life work?',
        answer: 'Browse the trips currently listed and contact Travel4life to confirm availability, inclusions, price, payment schedule and terms before booking.',
      },
      {
        question: 'What makes Travel4life different?',
        answer: 'Trip formats and services vary. Check the details on the trip page and ask us to confirm anything that is not stated for your specific trip.',
      },
      {
        question: 'How do I join a trip?',
        answer: 'Choose a trip and use its enquiry or booking option. Confirm current availability, the applicable payment terms and cancellation policy before paying.',
      }
    ],
    booking: [
      {
        question: 'How do payments work?',
        answer: 'Payment methods, deposit amounts and schedules depend on the specific trip. Ask for the current written terms before making a payment.',
      },
      {
        question: 'What if I need to cancel my trip?',
        answer: 'Cancellation terms are trip-specific. Review the terms supplied for your trip and request them in writing if they are not shown before booking.',
      },
      {
        question: 'Can I get a refund?',
        answer: 'Any refund depends on the applicable written booking and cancellation terms. Travel4life does not make a general insurance or refund promise here.',
      }
    ],
    safety: [
      {
        question: 'Are the hosts verified and trustworthy?',
        answer: 'Ask us what checks and support apply to the specific trip and host. Do not assume a particular screening process or round-the-clock support unless it is confirmed for your booking.',
      },
      {
        question: 'What safety measures are in place?',
        answer: 'Safety arrangements differ by trip. Confirm the available emergency contact, local support and any included safety equipment with us before booking.',
      },
      {
        question: 'Is travel insurance included?',
        answer: 'Do not assume travel insurance is included. Check your trip terms and arrange suitable cover directly with an insurer.',
      }
    ],
    hosting: [
      {
        question: 'Can I become a host?',
        answer: 'Contact Travel4life to ask whether host applications are currently open and to request the applicable onboarding details.',
      },
      {
        question: 'How much can I earn as a host?',
        answer: 'Earnings and fees depend on the applicable written host agreement. Request the current commercial terms; no typical earnings or commission rate is promised here.',
      },
      {
        question: 'What support do hosts receive?',
        answer: 'Host support, training, insurance and payment arrangements depend on the current program and written agreement. Confirm what is included before joining.',
      }
    ]
  };

  const currentFAQs = faqsByCategory[activeCategory as keyof typeof faqsByCategory];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-gray-50 py-10 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-sky-600 mb-3">FAQ</span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-[15px] leading-relaxed text-gray-500 font-body sm:text-lg">
            Everything you need to know about traveling with Travel4life
          </p>
        </div>

        {/* Category Tabs */}
        <div className="scrollbar-hide mb-6 flex flex-nowrap justify-start gap-2 overflow-x-auto pb-2 sm:mb-8 sm:flex-wrap sm:justify-center sm:gap-4 sm:overflow-visible sm:pb-0">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setOpenIndex(null);
              }}
              className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-500 ${
                activeCategory === category.id
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <category.icon className="w-3.5 h-3.5" />
              {category.label}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
          {currentFAQs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden transition-colors duration-200 hover:bg-gray-50/50"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="flex w-full items-center gap-4 px-4 py-5 text-left transition-colors duration-200 hover:bg-gray-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-500"
              >
                <h3 className="text-base font-display font-semibold text-gray-900 leading-snug">{faq.question}</h3>
                <ChevronDown
                  className={`ml-auto h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-4 pb-5">
                  <div className="h-px bg-gray-100 mb-4" />
                  <p className="text-gray-600 font-body leading-relaxed text-sm">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm mb-4">Still have questions?</p>
          <a
            href={getTravel4LifeWhatsAppUrl(getTravel4LifeContactContext())}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void trackContactEvent('contact_whatsapp_click')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-sm"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
};
