import { Review } from '../types';

const defaultReviewContent = [
  ['Aarav Mehta', 'Booking se lekar trip ke end tak sab kuch smooth raha. Team ne bahut achha support diya.'],
  ['Ananya Sharma', 'Planning simple thi, pricing clear thi aur on-location support ne experience ko bahut comfortable bana diya.'],
  ['Rohan Iyer', 'Great value for money. Queries ka response quick tha aur arrangements bilkul organised the.'],
  ['Priya Nair', 'Mujhe transparent communication aur thoughtful planning bahut pasand aayi. Overall ek stress-free experience.'],
  ['Vikram Singh', 'The team handled every detail well and helped us get a very fair package.'],
  ['Kavya Patel', 'Bahut achhi service. Support team friendly thi aur last-minute questions bhi patiently solve kiye.'],
  ['Aditya Rao', 'From enquiry to return, coordination was excellent. The inclusions and pricing were explained clearly.'],
  ['Neha Kapoor', 'Trip plan practical tha, stay comfortable tha aur local support milna reassuring laga.'],
  ['Manish Verma', 'Paise ki achhi value mili. Team ne options compare karke best arrangement suggest kiya.'],
  ['Ishita Das', 'Everything felt well managed. Updates time par milte rahe aur help ek message par available thi.'],
  ['Siddharth Joshi', 'A reliable travel team with honest guidance, good coordination and sensible pricing.'],
  ['Meera Menon', 'Mera pehla group trip tha aur team ne har step par confidence diya. Bahut smooth experience.'],
  ['Karan Malhotra', 'Itinerary well planned thi aur support genuinely useful tha. We got exactly the clarity we needed.'],
  ['Simran Kaur', 'Service warm aur professional dono thi. Budget ke hisaab se inclusions kaafi strong the.'],
  ['Nikhil Bhatia', 'Quick replies, clear costs and helpful people. Booking process bilkul straightforward raha.'],
  ['Riya Choudhary', 'On-ground team ne bahut care li. Mujhe laga ki koi genuinely trip ko manage kar raha hai.'],
  ['Arjun Sethi', 'The package was thoughtfully put together and the support team stayed responsive throughout.'],
  ['Pooja Kulkarni', 'No unnecessary confusion, no hidden surprises. Communication aur service dono dependable rahe.'],
  ['Rahul Desai', 'Excellent coordination and a good price. The team made the whole process feel easy.'],
  ['Tanvi Shah', 'Mujhe personal attention aur quick assistance bahut achhi lagi. Definitely a comfortable way to travel.'],
  ['Harsh Agarwal', 'Good planning, practical suggestions and helpful support during the trip. Would book again.'],
  ['Divya Reddy', 'Team ne patiently sab samjhaya aur arrangements expected se better rahe. Very happy overall.'],
  ['Saurabh Gupta', 'A well-coordinated experience with fair pricing and dependable assistance whenever required.'],
  ['Nandini Krishnan', 'Booking easy thi, updates clear the aur support team ne experience ko comfortable bana diya.'],
] as const;

export const DEFAULT_TRIP_REVIEWS: Review[] = defaultReviewContent.map(([name, comment], index) => ({
  id: `default-review-${index + 1}`,
  trip_id: '',
  reviewer_id: `default-reviewer-${index + 1}`,
  rating: index % 7 === 0 ? 4 : 5,
  comment,
  created_at: new Date(Date.UTC(2025, 10, index + 1)).toISOString(),
  helpful_votes: 3 + ((index * 7) % 29),
  reviewer: {
    id: `default-reviewer-${index + 1}`,
    name,
    email: '',
    role: 'traveler',
    verified: true,
    points: 0,
    tier: 'silver',
    created_at: '',
    badges: [],
  },
}));

export const getDefaultTripReviews = (tripId: string): Review[] => {
  const offset = Array.from(tripId).reduce((total, character) => total + character.charCodeAt(0), 0) % DEFAULT_TRIP_REVIEWS.length;
  return DEFAULT_TRIP_REVIEWS.map((review, index) => ({
    ...review,
    reviewer: review.reviewer ? {
      ...review.reviewer,
      avatar_url: `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(`${tripId}-${index}-${review.reviewer.name}`)}&backgroundColor=fef3c7`,
    } : undefined,
    id: `${review.id}-${tripId}`,
    trip_id: tripId,
    created_at: new Date(Date.UTC(2025, 10, ((index + offset) % 28) + 1)).toISOString(),
  }));
};