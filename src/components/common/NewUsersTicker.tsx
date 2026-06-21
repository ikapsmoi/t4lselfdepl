import React, { useState, useEffect } from 'react';
import { User, Star } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  avatar: string;
  location: string;
  joinedRecently: boolean;
}

export const NewUsersTicker: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [currentDisplayUserIndex, setCurrentDisplayUserIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Generate users data
  useEffect(() => {
    const generateUsers = () => {
      const names = [
        'Sarah Chen', 'Marcus Rodriguez', 'Priya Sharma', 'David Kim', 'Emma Watson',
        'Ahmed Hassan', 'Lisa Thompson', 'Raj Patel', 'Maria Garcia', 'James Wilson',
        'Aisha Okafor', 'Lucas Silva', 'Fatima Al-Zahra', 'Ryan O\'Connor', 'Zara Khan',
        'Miguel Santos', 'Yuki Tanaka', 'Amara Johnson', 'Kai Zhang', 'Sofia Rossi',
        'Omar Benali', 'Nina Petrov', 'Arjun Mehta', 'Chloe Martin', 'Hassan Ali',
        'Isabella Cruz', 'Dmitri Volkov', 'Ananya Gupta', 'Felix Mueller', 'Layla Nasser',
        'Carlos Mendoza', 'Ava Thompson', 'Ravi Kumar', 'Zoe Williams', 'Ali Rahman',
        'Gabriela Lopez', 'Hiroshi Sato', 'Noor Malik', 'Ethan Brown', 'Yasmin Ahmed',
        'Diego Fernandez', 'Mia Anderson', 'Vikram Singh', 'Elena Popov', 'Omar Farouk',
        'Camila Torres', 'Kenji Nakamura', 'Aaliyah Jackson', 'Leo Dubois', 'Rina Patel',
        'Antonio Rossi', 'Grace Lee', 'Aryan Sharma', 'Sophia Taylor', 'Youssef Mansour',
        'Valentina Moretti', 'Takeshi Yamamoto', 'Zara Ali', 'Noah Garcia', 'Amina Hassan',
        'Sebastian Muller', 'Aria Patel', 'Kenzo Tanaka', 'Luna Rodriguez', 'Amir Khan',
        'Bianca Santos', 'Haruto Suzuki', 'Leila Osman', 'Gabriel Costa', 'Maya Singh',
        'Francesco Romano', 'Cora Johnson', 'Ryo Watanabe', 'Nadia Petrov', 'Mateo Lopez',
        'Stella Kim', 'Akira Sato', 'Zahra Malik', 'Oliver Chen', 'Ines Garcia',
        'Kaito Nakamura', 'Vera Popov', 'Aarav Gupta', 'Elara Wilson', 'Tariq Ahmed',
        'Lucia Fernandez', 'Ren Yamada', 'Kira Volkov', 'Dante Silva', 'Nyla Hassan',
        'Marco Rossi', 'Zuri Johnson', 'Hiro Tanaka', 'Lara Petrov', 'Idris Ali',
        'Celeste Martinez', 'Akio Sato', 'Anya Volkov', 'Rafael Santos', 'Kaia Lee'
      ];

      const locations = [
        'New York, USA', 'London, UK', 'Tokyo, Japan', 'Mumbai, India', 'São Paulo, Brazil',
        'Berlin, Germany', 'Sydney, Australia', 'Toronto, Canada', 'Dubai, UAE', 'Singapore',
        'Paris, France', 'Seoul, South Korea', 'Mexico City, Mexico', 'Cairo, Egypt', 'Bangkok, Thailand',
        'Amsterdam, Netherlands', 'Stockholm, Sweden', 'Barcelona, Spain', 'Istanbul, Turkey', 'Lagos, Nigeria',
        'Buenos Aires, Argentina', 'Zurich, Switzerland', 'Hong Kong', 'Tel Aviv, Israel', 'Cape Town, South Africa',
        'Vancouver, Canada', 'Oslo, Norway', 'Vienna, Austria', 'Lisbon, Portugal', 'Helsinki, Finland',
        'Copenhagen, Denmark', 'Brussels, Belgium', 'Prague, Czech Republic', 'Warsaw, Poland', 'Budapest, Hungary',
        'Athens, Greece', 'Rome, Italy', 'Madrid, Spain', 'Dublin, Ireland', 'Edinburgh, Scotland',
        'Reykjavik, Iceland', 'Tallinn, Estonia', 'Riga, Latvia', 'Vilnius, Lithuania', 'Ljubljana, Slovenia',
        'Zagreb, Croatia', 'Belgrade, Serbia', 'Bucharest, Romania', 'Sofia, Bulgaria', 'Skopje, North Macedonia'
      ];

      const generatedUsers: UserProfile[] = [];
      
      for (let i = 0; i < 100; i++) {
        const randomSeed = `user-${i}-${Math.random().toString(36).substr(2, 9)}`;
        generatedUsers.push({
          id: `user-${i}`,
          name: names[i % names.length],
          avatar: `logo no background.png`,
          location: locations[i % locations.length],
          joinedRecently: Math.random() > 0.7 // 30% chance of being "recently joined"
        });
      }

      return generatedUsers;
    };

    setUsers(generateUsers());
  }, []);

  // Handle mobile cycling animation
  useEffect(() => {
    if (isMobile && users.length > 0) {
      const cycleInterval = setInterval(() => {
        setIsFading(true); // Start fade out
        setTimeout(() => {
          setCurrentDisplayUserIndex((prevIndex) => (prevIndex + 1) % users.length);
          setIsFading(false); // Start fade in
        }, 500); // Half a second for fade out
      }, 3000); // Show each user for 3 seconds (including fade)
      return () => clearInterval(cycleInterval);
    }
  }, [users, isMobile]);

  if (users.length === 0) return null;

  const currentUser = users[currentDisplayUserIndex];

  return (
    <div className="w-72 h-80 overflow-hidden">
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden h-full">
      {/* Instagram-style gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-2xl opacity-20"></div>
      <div className="absolute inset-1 bg-white rounded-2xl"></div>
      
      <div className="relative z-10">
        <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">New Travelers</h3>
        <div className="relative h-full overflow-hidden">
        {/* Scrolling container */}
        <div className="animate-scroll-users-vertical space-y-3">
          {/* Duplicate users for seamless loop */}
          {[...users, ...users].map((user, index) => (
            <div
              key={`${user.id}-${index}`}
              className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 min-w-[200px] hover:bg-gray-100 transition-all duration-300"
            >
              <div className="flex-1 min-w-0">
                <div className="text-gray-800 text-sm font-medium truncate">{user.name}</div>
                <div className="text-gray-600 text-xs truncate">{user.location}</div>
                {user.joinedRecently && (
                  <div className="text-green-600 text-xs font-medium">Just joined!</div>
                )}
              </div>
              <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />
            </div>
          ))}
        </div>
        
        {/* Gradient overlays for smooth fade */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/20 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
    </div>
  );
};