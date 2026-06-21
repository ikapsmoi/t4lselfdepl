export interface Story {
  id: string;
  title: string;
  subtitle: string;
  category: 'festivals' | 'culture' | 'adventure' | 'destinations';
  heroImage: string;
  content: string[];
  highlights: string[];
  location: string;
  bestTime: string;
}

export const STORIES: Story[] = [
  // ===== MUSIC FESTIVALS (10) =====
  {
    id: 'tomorrowland',
    title: 'Tomorrowland: Where Fantasy Meets Music',
    subtitle: 'The world\'s greatest electronic dance music festival in Boom, Belgium',
    category: 'festivals',
    heroImage: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Tomorrowland is not just a music festival -- it is a pilgrimage for electronic music lovers worldwide. Every July, the small town of Boom, Belgium transforms into a mythical kingdom where 400,000+ attendees unite across two weekends of pure euphoria.',
      'The festival is legendary for its elaborate mainstage designs, each year built around a unique theme. From enchanted forests to towering libraries, the production quality is unlike anything else on Earth. Over 1,000 artists perform across 16+ stages.',
      'Beyond the music, Tomorrowland offers DreamVille -- an immersive camping experience with themed areas, gourmet food courts, and even a supermarket. The Global Journey packages include flights and shuttle transfers, making it accessible from anywhere.',
      'What makes Tomorrowland truly special is the People of Tomorrow -- a community that transcends borders, languages, and backgrounds. The energy of 70,000 people singing together under fireworks is something that changes you forever.'
    ],
    highlights: ['400,000+ attendees across two weekends', '1,000+ artists on 16 stages', 'DreamVille camping with themed neighborhoods', 'Global Journey packages from 200+ countries', 'Iconic mainstage redesigned every year'],
    location: 'Boom, Belgium',
    bestTime: 'July (two weekends)'
  },
  {
    id: 'coachella',
    title: 'Coachella: The Cultural Epicenter of Music',
    subtitle: 'Art, fashion, and groundbreaking performances in the California desert',
    category: 'festivals',
    heroImage: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Coachella Valley Music and Arts Festival has evolved from an indie-rock gathering into the most culturally significant music event in the world. Held in Indio, California, it sets the tone for fashion, music, and pop culture each April.',
      'The festival lineup spans every genre imaginable -- from headlining pop superstars and legacy rock acts to underground hip-hop and experimental electronic artists. Beyonce\'s legendary 2018 performance (Beychella) redefined what a festival headliner could be.',
      'Art installations dot the desert landscape, from towering sculptures to immersive light experiences. The iconic Ferris wheel, neon palm trees, and the Spectra rainbow tower are landmarks of the festival grounds.',
      'Coachella is also a social phenomenon. Celebrity sightings, brand activations, and Instagram-worthy moments make it as much about the scene as the sound. But at its core, discovering a life-changing set in a small tent remains the festival\'s magic.'
    ],
    highlights: ['Two weekends in April', '150+ artists across 7 stages', 'World-class art installations', 'Celebrity culture meets underground music', 'Desert setting with mountain backdrop'],
    location: 'Indio, California, USA',
    bestTime: 'April (two weekends)'
  },
  {
    id: 'burning-man',
    title: 'Burning Man: Beyond a Festival',
    subtitle: 'A temporary city of radical self-expression in the Nevada desert',
    category: 'festivals',
    heroImage: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Burning Man defies categorization. It is not a festival you attend -- it is a city you help build. Every year, 70,000 people create Black Rock City in the Nevada desert, a temporary metropolis based on principles of radical inclusion, gifting, and self-reliance.',
      'There are no vendors at Burning Man. Everything operates on a gift economy. Participants (called Burners) bring everything they need and share freely with others. Art cars cruise the playa, mutant vehicles shaped like dragons and pirate ships.',
      'The art is staggering in scale -- 40-foot tall sculptures, temples you can walk through, interactive installations that respond to sound and touch. On Saturday night, the Man burns. On Sunday, the Temple burns in an emotional ceremony of release.',
      'Surviving the harsh desert conditions (extreme heat, dust storms, freezing nights) is part of the experience. It strips away pretense and connects you to something primal. Many Burners say it permanently altered their perspective on life.'
    ],
    highlights: ['70,000 participants build a temporary city', 'Gift economy (no buying or selling)', 'Massive art installations and mutant vehicles', '10 principles including radical self-expression', 'The Man and Temple burns'],
    location: 'Black Rock Desert, Nevada, USA',
    bestTime: 'Late August to early September'
  },
  {
    id: 'glastonbury',
    title: 'Glastonbury: The Mother of All Festivals',
    subtitle: 'Five decades of legendary music on Worthy Farm, England',
    category: 'festivals',
    heroImage: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Glastonbury Festival is the grand dame of music festivals. Since 1970, Worthy Farm in Somerset, England has hosted the world\'s most iconic musicians across a sprawling 900-acre site that feels like its own country.',
      'The Pyramid Stage is where legends are made -- from David Bowie to Beyonce, Radiohead to Stormzy. But Glastonbury is so much more than its headliners. Over 3,000 performances happen across countless stages, fields, and hidden areas.',
      'The festival embraces mud. It rains almost every year, and the resulting sea of mud has become part of its identity. Wellington boots are essential kit. But this shared hardship creates a unique camaraderie among the 200,000+ attendees.',
      'Beyond music, you will find theatre, circus, healing fields, stone circles at dawn, and the legendary Shangri-La area that only opens at night. Glastonbury is not a weekend -- it is a world you disappear into.'
    ],
    highlights: ['200,000+ capacity (largest greenfield festival)', 'The legendary Pyramid Stage', '3,000+ performances across 100+ stages', 'Iconic mud culture and Wellington boots', 'Shangri-La late-night area'],
    location: 'Worthy Farm, Somerset, England',
    bestTime: 'Late June (every year, fallow year every 5th)'
  },
  {
    id: 'ultra-miami',
    title: 'Ultra Music Festival: EDM\'s Grand Stage',
    subtitle: 'The birthplace of electronic dance music culture in downtown Miami',
    category: 'festivals',
    heroImage: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Ultra Music Festival transforms Bayfront Park in downtown Miami into the world\'s premier electronic music destination every March. With the Miami skyline as its backdrop, the production is cinematic in scale.',
      'The festival launched in 1999 and was instrumental in bringing EDM to the mainstream. It remains the place where DJs premiere their biggest tracks, where surprise B2B sets happen, and where the next wave of electronic music is revealed.',
      'The Ultra Mainstage is an engineering marvel -- its LED screens and pyrotechnics create a visual spectacle that rivals any concert production in the world. The RESISTANCE island, an underground techno paradise, offers a darker counterpoint.',
      'Miami Music Week surrounds the festival, with hundreds of pool parties, club nights, and industry events turning the entire city into a week-long celebration. Ultra is both the centerpiece and the catalyst for this annual migration.'
    ],
    highlights: ['Downtown Miami bayfront location', '170,000+ attendees over 3 days', 'Part of Miami Music Week', 'RESISTANCE underground techno stage', 'World premiere DJ sets and tracks'],
    location: 'Miami, Florida, USA',
    bestTime: 'March (3 days)'
  },
  {
    id: 'lollapalooza',
    title: 'Lollapalooza: America\'s Alternative Heart',
    subtitle: 'From touring festival to Chicago institution spanning four continents',
    category: 'festivals',
    heroImage: 'https://images.pexels.com/photos/1267317/pexels-photo-1267317.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Founded by Jane\'s Addiction frontman Perry Farrell in 1991, Lollapalooza began as a farewell tour and became a cultural movement. Now permanently rooted in Chicago\'s Grant Park, it draws 400,000 fans across four days each August.',
      'The lineup is deliberately eclectic -- rock, hip-hop, electronic, pop, and indie all share equal billing. This cross-pollination is what makes Lollapalooza unique: you might catch a rapper, then a rock band, then a DJ, all in one afternoon.',
      'Grant Park offers the surreal experience of attending a massive festival in the heart of a major city. The Chicago skyline towers over the stages, and you can take the L train back to your hotel at night.',
      'The festival has expanded globally with editions in Brazil, Argentina, Chile, Germany, France, and more -- each with its own local flavor while maintaining the original spirit of musical diversity and discovery.'
    ],
    highlights: ['400,000 attendees over 4 days', 'Downtown Chicago setting (Grant Park)', 'Genre-spanning lineup philosophy', 'Global editions across 4 continents', 'Founded by Perry Farrell in 1991'],
    location: 'Chicago, Illinois, USA',
    bestTime: 'Early August (4 days)'
  },
  {
    id: 'sonar-barcelona',
    title: 'Sonar: Where Music Meets Technology',
    subtitle: 'Barcelona\'s cutting-edge festival of advanced music and new media art',
    category: 'festivals',
    heroImage: 'https://images.pexels.com/photos/1047442/pexels-photo-1047442.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Sonar Barcelona is not your typical festival. Since 1994, it has positioned itself at the intersection of music, creativity, and technology. Split into Sonar by Day and Sonar by Night, it offers two distinct experiences.',
      'Sonar by Day happens in the Fira Montjuic conference center, combining DJ sets with technology showcases, AI art demonstrations, VR experiences, and industry talks. It feels like stepping into the future.',
      'Sonar by Night is pure hedonism -- massive outdoor stages where the world\'s best electronic artists perform until sunrise. The venue, Fira Gran Via, offers colossal indoor halls and open-air spaces perfect for warm Barcelona nights.',
      'The city itself is part of the draw. Beach days, tapas crawls, Gothic Quarter explorations, and rooftop parties fill the hours between official programming. Barcelona and electronic music were made for each other.'
    ],
    highlights: ['Split format: Day (tech/art) + Night (music)', 'Cutting-edge technology showcases', '130,000+ attendees from 100+ countries', 'Barcelona summer location', 'Focus on experimental and forward-thinking music'],
    location: 'Barcelona, Spain',
    bestTime: 'Mid-June (3 days + off-venues)'
  },
  {
    id: 'fuji-rock',
    title: 'Fuji Rock: Music in the Mountains',
    subtitle: 'Japan\'s legendary forest festival combining world-class music with nature',
    category: 'festivals',
    heroImage: 'https://images.pexels.com/photos/2422588/pexels-photo-2422588.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Fuji Rock Festival is nestled in the Naeba Ski Resort in Japan\'s Niigata Prefecture, surrounded by lush forested mountains. It is widely considered Asia\'s best music festival and Japan\'s cleanest large-scale event.',
      'Despite its name, the festival moved from the base of Mt. Fuji after its inaugural year in 1997. The current mountain setting provides a stunning natural backdrop with boardwalks winding through forests between stages.',
      'The lineup blends international headliners with Japanese artists, creating a truly cross-cultural experience. Past headliners include The Cure, Radiohead, Kendrick Lamar, and Bjork. The intimate Orange Court stage in the forest is particularly magical.',
      'Japanese festival etiquette makes Fuji Rock unique: attendees carry their own trash, noise levels drop respectfully at night, and the grounds are impeccably maintained. Food stalls serve incredible Japanese cuisine alongside international options.'
    ],
    highlights: ['Mountain forest setting with boardwalks', 'Legendary Japanese hospitality and cleanliness', 'International + Japanese artist lineup', '40,000 daily capacity', 'Stunning natural scenery between stages'],
    location: 'Naeba, Niigata, Japan',
    bestTime: 'Late July (3 days)'
  },
  {
    id: 'exit-serbia',
    title: 'EXIT: The Festival Born from Revolution',
    subtitle: 'A fortress transformed into Europe\'s most dramatic festival setting',
    category: 'festivals',
    heroImage: 'https://images.pexels.com/photos/1587927/pexels-photo-1587927.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'EXIT Festival was born in 2000 as a student protest for political freedom in Serbia. That revolutionary spirit still pulses through the Petrovaradin Fortress in Novi Sad, where 200,000 people gather each July.',
      'The 18th-century fortress provides an unmatched setting -- ancient stone walls, underground tunnels, and ramparts overlooking the Danube River. The Dance Arena, built into the fortress moat, is one of Europe\'s most iconic dance floors.',
      'Despite hosting world-class headliners (The Killers, David Guetta, The Prodigy, Iggy Pop), EXIT remains remarkably affordable. Serbia\'s low cost of living means you can attend a top-tier festival for a fraction of Western European prices.',
      'The festival\'s social consciousness continues with its State of EXIT movement, addressing youth issues and social causes. It won Best European Festival at the EU Festival Awards, cementing its status as a cultural landmark.'
    ],
    highlights: ['Historic 18th-century fortress venue', 'Dance Arena in the fortress moat', '200,000+ attendees over 4 days', 'Born from student freedom movement', 'Award-winning and incredibly affordable'],
    location: 'Novi Sad, Serbia',
    bestTime: 'July (4 days)'
  },
  {
    id: 'primavera-sound',
    title: 'Primavera Sound: The Curator\'s Festival',
    subtitle: 'Barcelona\'s tastemaker event where indie, pop, and electronic collide',
    category: 'festivals',
    heroImage: 'https://images.pexels.com/photos/1540338/pexels-photo-1540338.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Primavera Sound is the festival for people who love music. Its lineup reads like a dream Spotify playlist curated by someone with impeccable taste -- crossing indie, experimental, pop, rock, electronic, and hip-hop with fearless precision.',
      'Held at Parc del Forum on Barcelona\'s waterfront, the setting combines industrial architecture with Mediterranean Sea views. Stages sit between concrete plazas and ocean breezes, with sunrises over the water a daily occurrence.',
      'The festival pioneered gender-balanced lineups and consistently books both legendary acts and breakthrough artists. You might see Radiohead one night, a Nigerian Afrobeats artist the next, and a noise-rock band at 4am.',
      'Barcelona\'s nightlife extends the experience -- after-parties, beach hangs, and city exploration fill the daytime hours. The festival runs from afternoon to sunrise, perfectly suited to Spanish culture and summer heat.'
    ],
    highlights: ['Waterfront Barcelona location', 'Pioneered gender-balanced lineups', 'Impeccable curation across all genres', 'Runs from afternoon to sunrise', 'Expanded to Madrid, Porto, LA, and more'],
    location: 'Barcelona, Spain',
    bestTime: 'Late May / Early June'
  },

  // ===== DESTINATIONS & CULTURE (6) =====
  {
    id: 'salzburg-christmas',
    title: 'Salzburg Christmas Markets: A Winter Fairy Tale',
    subtitle: 'Mozart\'s city transforms into a magical wonderland during Advent',
    category: 'culture',
    heroImage: 'https://images.pexels.com/photos/716658/pexels-photo-716658.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Salzburg at Christmas is pure magic. The baroque old town, already a UNESCO World Heritage site, transforms into a glowing wonderland with traditional Christkindlmarkt stalls, mulled wine, and the distant sound of church bells over snow-dusted rooftops.',
      'The main market in front of the Cathedral and Residenz dates back to the 15th century. Wooden huts sell handcrafted ornaments, candles, gingerbread, and regional specialties while the fortress above illuminates the night sky.',
      'The Hellbrunn Advent Magic is particularly enchanting -- nestled in the palace gardens with over 700 trees draped in lights. Krampus runs through the streets in early December, offering a thrilling contrast to the gentle Christmas spirit.',
      'A day trip to the Salzkammergut lake district reveals even smaller, more intimate markets where locals outnumber tourists and traditions feel untouched by time. This is Christmas as it was meant to be experienced.'
    ],
    highlights: ['UNESCO old town transformed by Christmas lights', '15th-century market tradition', 'Hellbrunn Advent Magic in palace gardens', 'Krampus runs in early December', 'Day trips to lake district markets'],
    location: 'Salzburg, Austria',
    bestTime: 'Late November to December 26'
  },
  {
    id: 'bali-spiritual-retreat',
    title: 'Bali: The Island of the Gods',
    subtitle: 'Where ancient temples, rice terraces, and surf culture create paradise',
    category: 'destinations',
    heroImage: 'https://images.pexels.com/photos/2166559/pexels-photo-2166559.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Bali is that rare destination where spiritual depth and natural beauty coexist in perfect harmony. From the terraced rice paddies of Ubud to the surf breaks of Uluwatu, every corner offers a different kind of magic.',
      'The temple culture is mesmerizing. Tanah Lot perched on the ocean, Uluwatu on clifftops with Kecak fire dance at sunset, and the thousand-year-old water temples of Tirta Empul where you can join Balinese in ritual purification.',
      'Modern Bali offers world-class wellness -- yoga retreats, sound healing ceremonies, plant-based cuisine, and spa treatments using ancient Jamu recipes. Canggu and Seminyak provide the social scene with rooftop bars and beach clubs.',
      'The Balinese people make everything special. Their philosophy of Tri Hita Karana (harmony with God, others, and nature) permeates daily life. You see it in the offerings placed on every doorstep each morning, in the genuine warmth of every interaction.'
    ],
    highlights: ['Ancient Hindu temples on cliffs and water', 'World-class yoga and wellness retreats', 'Tegallalang rice terrace walks', 'Vibrant surf and cafe culture', 'Affordable luxury accommodations'],
    location: 'Bali, Indonesia',
    bestTime: 'April to October (dry season)'
  },
  {
    id: 'iceland-northern-lights',
    title: 'Iceland: Chasing the Aurora',
    subtitle: 'Fire and ice collide in Earth\'s most otherworldly landscape',
    category: 'adventure',
    heroImage: 'https://images.pexels.com/photos/1933239/pexels-photo-1933239.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Iceland feels like visiting another planet. Active volcanoes, glacial lagoons, black sand beaches, and erupting geysers create a landscape so dramatic it rewrites your sense of what Earth can be.',
      'The Northern Lights (Aurora Borealis) are the headline act from September to March. Watching green, purple, and pink curtains dance across the Arctic sky while soaking in a natural hot spring is a peak human experience.',
      'The Golden Circle route hits three iconic sites in one day: Thingvellir (where tectonic plates meet), Geysir (the original geyser), and Gullfoss (a thundering waterfall). But venture further for ice caves, glacier hikes, and remote highland trails.',
      'Iceland also offers midnight sun in summer -- endless golden light that lets you hike, explore, and photograph 24 hours a day. The country is small but endlessly surprising, with a creative capital in Reykjavik that punches above its weight.'
    ],
    highlights: ['Northern Lights from September to March', 'Glacier hiking and ice cave exploration', 'Natural hot springs and geothermal pools', 'Golden Circle route (Thingvellir, Geysir, Gullfoss)', 'Midnight sun in summer months'],
    location: 'Iceland',
    bestTime: 'September-March (Northern Lights) or June-August (Midnight Sun)'
  },
  {
    id: 'morocco-medinas',
    title: 'Morocco: A Feast for the Senses',
    subtitle: 'From Sahara dunes to labyrinthine medinas, Africa\'s gateway mesmerizes',
    category: 'culture',
    heroImage: 'https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Morocco overwhelms your senses in the best possible way. The medina of Marrakech alone offers a lifetime of discovery -- spice-scented souks, hidden riads with mosaic courtyards, rooftop terraces overlooking the Atlas Mountains.',
      'Jemaa el-Fnaa square at night is pure theater: snake charmers, storytellers, acrobats, and dozens of food stalls serving tagine, msemen, and fresh orange juice. The energy is intoxicating and unlike anywhere else on Earth.',
      'The Sahara Desert experience -- riding camels to a desert camp, sleeping under stars so bright they feel close enough to touch, waking to sunrise over endless dunes -- is the trip\'s emotional peak for most travelers.',
      'Beyond Marrakech, the blue city of Chefchaouen, the Roman ruins of Volubilis, the coastal charm of Essaouira, and the imperial cities of Fez and Meknes each offer distinct flavors of this endlessly diverse country.'
    ],
    highlights: ['Marrakech medina and Jemaa el-Fnaa square', 'Sahara Desert camel trek and camp', 'Blue city of Chefchaouen', 'Traditional riad accommodation', 'Atlas Mountains day trips'],
    location: 'Morocco',
    bestTime: 'March to May or September to November'
  },
  {
    id: 'japan-cherry-blossoms',
    title: 'Japan: Cherry Blossom Season',
    subtitle: 'Hanami season transforms Japan into a pink-and-white dreamscape',
    category: 'culture',
    heroImage: 'https://images.pexels.com/photos/1440476/pexels-photo-1440476.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Cherry blossom season (sakura) in Japan is not just about flowers -- it is a cultural phenomenon that unites the entire nation. From late March through April, millions gather under blooming trees for hanami (flower viewing) picnics.',
      'The blooming front (sakura zensen) moves from south to north over weeks, meaning you can chase the blossoms from Kyoto to Tokyo to Hokkaido. Timing your trip to catch peak bloom requires planning, but the reward is extraordinary.',
      'Kyoto during sakura season is ethereal -- the Philosopher\'s Path lined with arching cherry trees, Maruyama Park illuminated at night, Kiyomizu-dera temple framed by pink clouds. Every turn reveals a perfect scene.',
      'Beyond the blossoms, spring is ideal for experiencing Japan\'s depth: Zen gardens, bullet trains, izakaya culture, ancient shrines, robot restaurants, and a food scene that earned more Michelin stars than Paris.'
    ],
    highlights: ['Sakura bloom from late March to mid-April', 'Hanami picnic culture under the trees', 'Kyoto temples framed by cherry blossoms', 'Night illuminations (yozakura)', 'Combine with Japanese food and culture'],
    location: 'Japan (Kyoto, Tokyo, Osaka)',
    bestTime: 'Late March to mid-April'
  },
  {
    id: 'patagonia-trek',
    title: 'Patagonia: The End of the World',
    subtitle: 'Glaciers, granite towers, and endless wilderness at Earth\'s southern tip',
    category: 'adventure',
    heroImage: 'https://images.pexels.com/photos/2325446/pexels-photo-2325446.jpeg?auto=compress&cs=tinysrgb&w=1920',
    content: [
      'Patagonia is where the world runs out. Shared between Argentina and Chile, this vast wilderness of glaciers, granite spires, turquoise lakes, and howling winds represents nature at its most awe-inspiring and humbling.',
      'The W Trek in Torres del Paine National Park is a bucket-list hike: 5 days through mountain passes with views of the iconic granite towers, the Grey Glacier, and the French Valley. Every turn reveals a landscape worthy of a desktop wallpaper.',
      'On the Argentine side, Perito Moreno Glacier is one of the few advancing glaciers on Earth. Watching house-sized chunks of ice calve into Lago Argentino with a thunderous crack is nature at its most dramatic.',
      'El Chalten, the trekking capital, offers day hikes to Laguna de los Tres (at the base of Mt. Fitz Roy) and Laguna Torre. The town itself is cozy and full of craft breweries and steak restaurants for post-hike recovery.'
    ],
    highlights: ['W Trek in Torres del Paine (5 days)', 'Perito Moreno Glacier ice trekking', 'Mt. Fitz Roy and Laguna de los Tres', 'Wildlife: condors, guanacos, pumas', 'El Chalten hiking base town'],
    location: 'Argentina & Chile',
    bestTime: 'November to March (Southern Hemisphere summer)'
  }
];
