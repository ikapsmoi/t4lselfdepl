import React, { useState } from 'react';
import { MapPin, Calendar, ArrowLeft, ArrowRight, Clock, Star } from 'lucide-react';
import { STORIES, Story } from '../utils/storiesData';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Festivals', value: 'festivals' },
  { label: 'Culture', value: 'culture' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Destinations', value: 'destinations' },
];

export function StoriesPage() {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [activeCategory, setActiveCategory] = useState('');

  const filteredStories = activeCategory
    ? STORIES.filter(s => s.category === activeCategory)
    : STORIES;

  if (selectedStory) {
    return <StoryDetail story={selectedStory} onBack={() => setSelectedStory(null)} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/2356045/pexels-photo-2356045.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Stories from the Road"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-4">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Stories from the Road</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3">
              Travel Tales & Festival Guides
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              From the electric nights of Tomorrowland to the ancient streets of Kyoto -- stories that inspire your next adventure.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                activeCategory === cat.value
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map(story => (
            <article
              key={story.id}
              onClick={() => setSelectedStory(story)}
              className="group cursor-pointer rounded-[20px] overflow-hidden bg-white border border-gray-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] transition-all duration-300"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={story.heroImage}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700 capitalize">
                    {story.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg mb-1.5 group-hover:text-sky-600 transition-colors line-clamp-2">
                  {story.title}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{story.subtitle}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {story.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {story.bestTime}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function StoryDetail({ story, onBack }: { story: Story; onBack: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={story.heroImage}
          alt={story.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
        <div className="absolute top-6 left-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm font-medium hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Stories
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-4xl">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-xs font-semibold rounded-full text-white capitalize mb-3">
              {story.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2">
              {story.title}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl">{story.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 mb-10 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-sky-500" />
            {story.location}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Calendar className="w-4 h-4 text-sky-500" />
            {story.bestTime}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock className="w-4 h-4 text-sky-500" />
            {Math.ceil(story.content.join(' ').split(' ').length / 200)} min read
          </div>
        </div>

        {/* Article body */}
        <div className="prose-lg space-y-5">
          {story.content.map((paragraph, i) => (
            <p key={i} className="text-gray-700 leading-relaxed text-base md:text-lg">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Highlights box */}
        <div className="mt-10 p-6 bg-gray-50 rounded-[20px] border border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            Key Highlights
          </h3>
          <ul className="space-y-2.5">
            {story.highlights.map((highlight, i) => (
              <li key={i} className="flex items-start gap-2.5 text-gray-600 text-sm">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-2 flex-shrink-0"></span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-12 p-8 bg-gray-900 rounded-[20px] text-center">
          <h3 className="text-xl font-bold text-white mb-2">Ready to experience this?</h3>
          <p className="text-gray-400 text-sm mb-5">Join a Travel4life group trip and make it happen.</p>
          <button
            onClick={() => { window.location.hash = 'home'; window.scrollTo(0, 0); }}
            className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-2xl font-semibold text-sm hover:bg-gray-100 transition-colors"
          >
            Explore Trips
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Back button */}
        <div className="mt-8 text-center">
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            Back to all stories
          </button>
        </div>
      </div>
    </div>
  );
}
