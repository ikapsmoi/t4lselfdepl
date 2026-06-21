import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Users, CreditCard, Shield, Home } from 'lucide-react';

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
        question: 'How does TravelTag work?',
        answer: 'TravelTag connects travelers with verified hosts who create unique group travel experiences. Browse trips, join a group, and embark on adventures with like-minded people from around the world.',
      },
      {
        question: 'What makes TravelTag different?',
        answer: 'We focus on small group experiences (6-16 people), verified hosts, and authentic local connections. Plus, we offer unique features like NFT souvenirs, creator trips, and a comprehensive safety system.',
      },
      {
        question: 'How do I join a trip?',
        answer: 'Simply browse our trips, select one that interests you, and click "Book Now". You can pay a deposit to secure your spot or pay in full. You\'ll then be added to the trip group chat to meet your fellow travelers.',
      }
    ],
    booking: [
      {
        question: 'How do payments work?',
        answer: 'You can pay a deposit to secure your spot and pay the balance later, or pay in full upfront. We accept credit cards and PayPal, and all payments are securely processed.',
      },
      {
        question: 'What if I need to cancel my trip?',
        answer: 'Cancellation policies vary by trip, but most offer free cancellation up to 14-30 days before departure. You can see the specific policy on each trip page before booking.',
      },
      {
        question: 'Can I get a refund?',
        answer: 'Refunds depend on the trip\'s cancellation policy and timing. We also offer trip insurance for additional protection against unforeseen circumstances.',
      }
    ],
    safety: [
      {
        question: 'Are the hosts verified and trustworthy?',
        answer: 'Yes! All hosts undergo a thorough verification process including background checks, identity verification, and reference checks. We also have a comprehensive review system and 24/7 support.',
      },
      {
        question: 'What safety measures are in place?',
        answer: 'We provide 24/7 emergency support, GPS tracking, buddy matching, and all trips include emergency communication devices. Our hosts are trained in first aid and emergency procedures.',
      },
      {
        question: 'Is travel insurance included?',
        answer: 'Basic coverage is included with every booking, but we recommend purchasing comprehensive travel insurance for additional protection. We can help you find the right coverage.',
      }
    ],
    hosting: [
      {
        question: 'Can I become a host?',
        answer: 'Absolutely! If you\'re passionate about travel and want to share unique experiences, apply to become a host. We provide training, support, and all the tools you need to succeed.',
      },
      {
        question: 'How much can I earn as a host?',
        answer: 'Host earnings vary based on trip price, frequency, and group size. Our top hosts earn $50,000+ annually. We take a 15% commission, which is among the lowest in the industry.',
      },
      {
        question: 'What support do hosts receive?',
        answer: 'Hosts get comprehensive training, 24/7 support, marketing assistance, payment processing, insurance coverage, and access to our host community for tips and advice.',
      }
    ]
  };

  const currentFAQs = faqsByCategory[activeCategory as keyof typeof faqsByCategory];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 md:py-28 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-sky-600 mb-3">FAQ</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-gray-900 mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-gray-500 font-body">
            Everything you need to know about traveling with TravelTag
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveCategory(category.id);
                setOpenIndex(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
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
        <div className="space-y-3">
          {currentFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-base font-display font-semibold text-gray-900 leading-snug">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5">
                  <div className="h-px bg-gray-100 mb-4" />
                  <p className="text-gray-600 font-body leading-relaxed text-sm">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm mb-4">Still have questions?</p>
          <button
            onClick={() => window.open('https://wa.link/ghfcus', '_blank')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-sm"
          >
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};
