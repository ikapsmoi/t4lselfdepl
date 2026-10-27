export interface TripCityImageCredit {
  city: string;
  asset: string;
  source: string;
  articleUrl?: string;
  artist: string;
  license: string;
  licenseUrl: string;
  description: string;
}

export const TRIP_CITY_IMAGE_CREDITS: Record<string, TripCityImageCredit> = {
  "corbett": {
    "city": "Corbett Tiger Reserve",
    "asset": "/trip-city-images/corbett.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Morning_Mist_Dhikala_Corbett_Reserve_Dec2019_R16_02285.jpg",
    "artist": "Timothy Gonsalves",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Morning mist burning off with the rising sun, grasslands near Dhikala, Corbett Tiger Reserve, Uttarakhand, India."
  },
  "spain": {
    "city": "Barcelona",
    "asset": "/trip-city-images/spain.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Barcelona_Cityscape_Panorama_-_Jan_2007.jpg",
    "artist": "Diliff",
    "license": "CC BY 2.5",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.5",
    "description": "Panorama of the city of Barcelona from Montjuïc."
  },
  "greece": {
    "city": "Santorini",
    "asset": "/trip-city-images/greece.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Panoramic_view_of_Fira_coast_line,_Santorini_island_(Thira),_Greece.jpg",
    "artist": "Mstyslav Chernov",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Panoramic view of Fira coast line, Santorini island (Thira), Greece."
  },
  "united-kingdom": {
    "city": "London",
    "asset": "/trip-city-images/united-kingdom.webp",
    "source": "https://commons.wikimedia.org/wiki/File:London_Thames_Sunset_panorama_-_Feb_2008.jpg",
    "artist": "Diliff",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0",
    "description": "Panoramic image of the London skyline from the Bermondsey banks of the Thames."
  },
  "norway": {
    "city": "Lyngen Fjord",
    "asset": "/trip-city-images/norway.webp",
    "source": "https://commons.wikimedia.org/wiki/File:At_Lyngen_fjord,_Sp%C3%A5kenes_in_2012_June.jpg",
    "artist": "Ximonic (Simo Räsänen)",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Landscape at Lyngen fjord towards north, Spåkenes, Nordreisa, Troms."
  },
  "italy": {
    "city": "Rome",
    "asset": "/trip-city-images/italy.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Colosseum_in_Rome,_Italy_-_April_2007.jpg",
    "artist": "Diliff",
    "license": "CC BY-SA 2.5",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.5",
    "description": "Panorama of the Colosseum in Rome at dusk."
  },
  "switzerland": {
    "city": "Matterhorn",
    "asset": "/trip-city-images/switzerland.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Matterhorn_Riffelsee_2005-06-11.jpg",
    "artist": "Dirk Beyer",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Matterhorn mirrored in Riffelsee, photograph taken from the shore."
  },
  "iceland": {
    "city": "Gullfoss",
    "asset": "/trip-city-images/iceland.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Gullfoss,_Su%C3%B0urland,_Islandia,_2014-08-16,_DD_119.JPG",
    "artist": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Rainbow over Gullfoss, a waterfall in the canyon of the Hvítá river in Iceland."
  },
  "finland": {
    "city": "Lapland",
    "asset": "/trip-city-images/finland.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Aurora_borealis_over_Lapland_(Unsplash).jpg",
    "artist": "Vincent Guth",
    "license": "CC0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "description": "Aurora borealis over Lapland, Finland."
  },
  "portugal": {
    "city": "Lisbon",
    "asset": "/trip-city-images/portugal.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Lisbon_city_(1439238681).jpg",
    "artist": "Feliciano Guimarães",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "description": "Lisbon city."
  },
  "sweden": {
    "city": "Stockholm",
    "asset": "/trip-city-images/sweden.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Gamla_stan,_Stockholm.jpg",
    "artist": "Andy Eick",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "description": "Gamla stan in Stockholm."
  },
  "denmark": {
    "city": "Copenhagen",
    "asset": "/trip-city-images/denmark.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Nyhavn_55_Copenhagen.jpg",
    "artist": "Jebulon",
    "license": "CC0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "description": "55 Nyhavn, Copenhagen, Denmark."
  },
  "germany": {
    "city": "Berlin",
    "asset": "/trip-city-images/germany.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Berlin_Skyline.jpg",
    "artist": "Tobi85",
    "license": "Public domain",
    "licenseUrl": "",
    "description": "View of Berlin from the direction of the Siegessäule."
  },
  "budapest": {
    "city": "Budapest",
    "asset": "/trip-city-images/budapest.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Full_panorama_skyline_of_Budapest.jpg",
    "artist": "Bopennings",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Panorama skyline of Budapest."
  },
  "prague": {
    "city": "Prague",
    "asset": "/trip-city-images/prague.webp",
    "source": "https://commons.wikimedia.org/wiki/File:Prague-Skyline.jpg",
    "artist": "acediscovery",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "description": "Skyline and panorama of Prague, Czech Republic."
  },
  "kochi": {
    "city": "Kochi",
    "asset": "/trip-city-images/kochi.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Kochi_Skyline.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Kochi",
    "artist": "Fsquares (The Ibrahims)",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Kochi Skyline at Night"
  },
  "srinagar": {
    "city": "Srinagar",
    "asset": "/trip-city-images/srinagar.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Red_and_Yellow_Tulips.JPG",
    "articleUrl": "https://en.wikipedia.org/wiki/Srinagar",
    "artist": "Abdars",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Shots taken of tulips in full bloom at the Tulip Garden in Srinagar, Jammu and Kashmir"
  },
  "shimla": {
    "city": "Shimla",
    "asset": "/trip-city-images/shimla.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Landscape_of_Shimla_%2C_Himachal_Pradesh.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Shimla",
    "artist": "Navneet Sharma",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "The image contains A view of Shimla City as well as the empty natural scenery(hills) adjoining it  on a cloudy day."
  },
  "mount-abu": {
    "city": "Mount Abu",
    "asset": "/trip-city-images/mount-abu.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Mount_Abu.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Mount_Abu",
    "artist": "Andreas Kleemann",
    "license": "CC BY-SA 3.0 de",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/de/deed.en",
    "description": "Nakki-See in Mount Abu"
  },
  "jaipur": {
    "city": "Jaipur",
    "asset": "/trip-city-images/jaipur.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:East_facade_Hawa_Mahal_Jaipur_from_ground_level_(July_2022)_-_img_01.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Jaipur",
    "artist": "Chainwit.",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "East facade of Hawa Mahal, Jaipur, Rajasthan"
  },
  "madurai": {
    "city": "Madurai",
    "asset": "/trip-city-images/madurai.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Madurai%2C_India.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Madurai",
    "artist": "Bernard Gagnon",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Madurai and view of the gopurams of Meenakshi temple, State of Tamil Nadu, India"
  },
  "chennai": {
    "city": "Chennai",
    "asset": "/trip-city-images/chennai.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Chennai_Central.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Chennai",
    "artist": "jamal haider from india",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "description": "Chennai Central in Chennai, India."
  },
  "kaza": {
    "city": "Kaza",
    "asset": "/trip-city-images/kaza.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Kaaza_districts_late_Ottoman_empire.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Kaza",
    "artist": "Unknown authorUnknown author",
    "license": "Public domain",
    "licenseUrl": "",
    "description": "Kaaza districts late Ottoman empire"
  },
  "manali": {
    "city": "Manali",
    "asset": "/trip-city-images/manali.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Mall_Road_-_Manali_01.jpg",
    "articleUrl": "",
    "artist": "Jagseer S Sidhu",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Mall Road - Manali"
  },
  "macau": {
    "city": "Macau",
    "asset": "/trip-city-images/macau.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Panorama_of_Macau_Peninsula2021.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Macau",
    "artist": "Charlie fong",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "The panorama of west Macau Peninsula."
  },
  "la-paz": {
    "city": "La Paz",
    "asset": "/trip-city-images/la-paz.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Entrance_to_La_Paz_Market_Iloilo_City.JPG",
    "articleUrl": "https://en.wikipedia.org/wiki/La_Paz",
    "artist": "Iloilo Wanderer",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Entrance to La Paz Market Iloilo City, the Philippines"
  },
  "seoul": {
    "city": "Seoul",
    "asset": "/trip-city-images/seoul.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Seoul_City_Wall_and_Downtown_Seoul.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Seoul",
    "artist": "서울연구원",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "description": "The Seoul City Wall is lying at the center of the photo, between Cheongunhyoja-dong on the left, and Muak-dong on the right."
  },
  "taipei": {
    "city": "Taipei",
    "asset": "/trip-city-images/taipei.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:1_taipei_sunrise_panorama_dxr_edit_pangen_141215_1.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Taipei",
    "artist": "Chensiyuan, edit by DXR",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Taipei sunrise panorama. This image was stiched in Hugin using panini general projection."
  },
  "tokyo": {
    "city": "Tokyo",
    "asset": "/trip-city-images/tokyo.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Skyscrapers_of_Shinjuku_2009_January.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Tokyo",
    "artist": "Morio",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "description": "View of Shinjuku skyscrapers and Mount Fuji as seen from the Bunkyo Civic Center in Tokyo"
  },
  "kigali": {
    "city": "Kigali",
    "asset": "/trip-city-images/kigali.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:High_Angle_View_Of_Kigali_City_Street_on_November_29%2C_2018._Emmanuel_Kwizera.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Kigali",
    "artist": "Emmanuelkwizera",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "High Angle View Of Kigali City Street on November 29, 2018. Most of the people in Rwanda's capital use this kind of transport.Emmanuel Kwizera"
  },
  "beijing": {
    "city": "Beijing",
    "asset": "/trip-city-images/beijing.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Beijing_city_subway_passage.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Beijing",
    "artist": "Nacaru",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "A photo showing an unusually dark passage within the Beijing Subway during the Chinese new year celebrations"
  },
  "muscat": {
    "city": "Muscat",
    "asset": "/trip-city-images/muscat.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Old_Muscat_City_View%2C_Muscat%2C_Oman3.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Muscat",
    "artist": "Domenico Convertini",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "description": "Old Muscat City View, Muscat, Oman"
  },
  "gaborone": {
    "city": "Gaborone",
    "asset": "/trip-city-images/gaborone.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:View_from_I-Tower_SE_20200712.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Gaborone",
    "artist": "CNJerem",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "description": "View from the top of the I-Tower (restaurant) southeast, with the centre of Gaborone and the Gaborone Dam in the background"
  },
  "antananarivo": {
    "city": "Antananarivo",
    "asset": "/trip-city-images/antananarivo.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Lake_Anosy%2C_Central_Antananarivo%2C_Capital_of_Madagascar%2C_Photo_by_Sascha_Grabow.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Antananarivo",
    "artist": "Sascha Grabow www.saschagrabow.com",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Lake Anosy in Central Antananarivo, Capital of Madagascar."
  },
  "windhoek": {
    "city": "Windhoek",
    "asset": "/trip-city-images/windhoek.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Iglesia_de_Cristo%2C_Windhoek%2C_Namibia%2C_2018-08-04%2C_DD_02.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Windhoek",
    "artist": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Christ church or Christuskirche, Windhoek, Namibia. The church, built beween 1907-1910 and designed by architect Gottlieb Redecker, was originally known as the Church of Peace as it was built following the wars between the Germans and the Khoikhoi, Herero, and Owambo. It was constructed from quartz sandstone mined from the vicinity and has a mixture of neo-Romanesque, Art Nouveau and Gothic revival influences."
  },
  "kampala": {
    "city": "Kampala",
    "asset": "/trip-city-images/kampala.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:View_of_Kampala_city_2.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Kampala",
    "artist": "Dr. S-mon",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0",
    "description": "View of Kampala city"
  },
  "thimphu": {
    "city": "Thimphu",
    "asset": "/trip-city-images/thimphu.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Tashich%C3%B6dzong_Thimphu-2008-01-23.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Thimphu",
    "artist": "©Christopher J. Fynn / Wikimedia Commons",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Tashichödzong, Thimphu, Bhutan. Tashichodzong in winter."
  },
  "kathmandu": {
    "city": "Kathmandu",
    "asset": "/trip-city-images/kathmandu.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Kathmandu-Durbar_Square-06-Mahavishnu-Kuh-Vishnu-Pratapamalla-Jagannath-2007-gje.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Kathmandu",
    "artist": "Gerd Eichmann",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Durbar Square, Kathmandu‎"
  },
  "colombo": {
    "city": "Colombo",
    "asset": "/trip-city-images/colombo.png",
    "source": "https://commons.wikimedia.org/wiki/File:Colombo_city_skyline_at_night.png",
    "articleUrl": "https://en.wikipedia.org/wiki/Colombo",
    "artist": "Gihanud2001",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "description": "Colombo city"
  },
  "hanoi": {
    "city": "Hanoi",
    "asset": "/trip-city-images/hanoi.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Hanoi_skyline_with_Ba_Vi_Mountain.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Hanoi",
    "artist": "Quangnlnhe182394",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "description": "Hanoi skyline with Ba Vi Mountain"
  },
  "phnom-penh": {
    "city": "Phnom Penh",
    "asset": "/trip-city-images/phnom-penh.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Phnom_Penh_skyline_from_TK_district_Dec_2024.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Phnom_Penh",
    "artist": "Looppty",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Phnom Penh Skyline from Toul Kork"
  },
  "kuala-lumpur": {
    "city": "Kuala Lumpur",
    "asset": "/trip-city-images/kuala-lumpur.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:The_Twins_SE_Asia_2019_(49171985716).jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Kuala_Lumpur",
    "artist": "James Kerwin from Tbilisi",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "description": "Petronas Towers in December 2019"
  },
  "denpasar": {
    "city": "Denpasar",
    "asset": "/trip-city-images/denpasar.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Aerial_view_of_Bajra_Sandhi_Monument_Denpasar_Bali_Indonesia.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Denpasar",
    "artist": "trezy humanoiz from Denpasar, indonesia",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "description": "From wikipedia:\n\nBajra Sandhi Monument is a monument to Balinese people struggle from time to time. The monument is located in front of the Bali Governor's Office in Renon, Denpasar, Bali."
  },
  "dhaka": {
    "city": "Dhaka",
    "asset": "/trip-city-images/dhaka.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Tejgaon_Commercial_Area.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Dhaka",
    "artist": "AshiqJB007",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "description": "Tejgaon Commercial Area"
  },
  "baku": {
    "city": "Baku",
    "asset": "/trip-city-images/baku.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Baku_Montage.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Baku",
    "artist": "See above. Compilation by Interfase",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Montage of pictures of Baku used for the specific article. Composition of these pictures:"
  },
  "vientiane": {
    "city": "Vientiane",
    "asset": "/trip-city-images/vientiane.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Illuminated_Ferris_wheel%2C_bouncing_castle_and_carousel_at_night_in_a_funfair_in_Vientiane%2C_Laos.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Vientiane",
    "artist": "Basile Morin",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Illuminated Ferris wheel, Inflatable bouncing castle and carousel, at night in a funfair in front of the Mekong, Sithane Road, Quai Fa Ngum, near Vientiane Night Market, Vientiane, Laos."
  },
  "almaty": {
    "city": "Almaty",
    "asset": "/trip-city-images/almaty.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Almaty_City_hall_(14933845349).jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Almaty",
    "artist": "Tore Khan",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "description": "Almaty City hall in 2001"
  },
  "manila": {
    "city": "Manila",
    "asset": "/trip-city-images/manila.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Iglesia_de_San_Miguel%2C_Manila%2C_Filipinas%2C_2023-08-27%2C_DD_29-31_HDR.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Manila",
    "artist": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "San Miguel Church‎, formally The Royal Parish and National Shrine of Saint Michael and the Archangels, Manila, Philippines. The shrine is located within the Malacañang Palace complex, the official residence of the President of the Republic of the Philippines. Presidents that have heard Mass at the shrine include Carlos P. García, Gloria Macapagal Arroyo, and Fidel V. Ramos (who was Protestant). The Church was first built in stone in 1603 by the Jesuits in Paco. In 1611, the Jesuits and Filipino Catholics accommodated the Japanese Christians who were persecuted by the Tokugawa Shogunate. It was Blessed Dom Justo Takayama (高山右近), a daimyō or feudal lord, who led a group of approximately 300 Japanese Christians to the Philippines in 1614. The church was damaged in the 1645 Luzon earthquake, and during the British occupation of Manila that was part of the Seven Years' War. The church was rebuilt in 1913. The church served as the pro-cathedral of the Archdiocese of Manila while Manila Cathedral was being rebuilt from 1946 to 1958 following the city's destruction in World War II. It was elevated to the rank of a national shrine in 1986."
  },
  "tirana": {
    "city": "Tirana",
    "asset": "/trip-city-images/tirana.png",
    "source": "https://commons.wikimedia.org/wiki/File:KS_Dinamo_Tiran%C3%AB_(logo).svg",
    "articleUrl": "https://en.wikipedia.org/wiki/Tirana",
    "artist": "KS Dinamo Tiranë",
    "license": "Public domain",
    "licenseUrl": "",
    "description": "Logo du club de football albanais du KS Dinamo Tiranë."
  },
  "yerevan": {
    "city": "Yerevan",
    "asset": "/trip-city-images/yerevan.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Mount_Ararat_and_the_Yerevan_skyline.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Yerevan",
    "artist": "Սէրուժ Ուրիշեան (Serouj Ourishian)",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Ağrı Dağı and the Yerevan skyline. The Opera house is visible in the center."
  },
  "samarkand": {
    "city": "Samarkand",
    "asset": "/trip-city-images/samarkand.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:RegistanSquare_Samarkand.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Samarkand",
    "artist": "Registan_-_Gusjer.jpg: Gustavo Jeronimo from Aranjuez, Spain\nderivative work: MrPanyGoff",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "description": "The Registan Square in Samarkand, Uzbekistan."
  },
  "bishkek": {
    "city": "Bishkek",
    "asset": "/trip-city-images/bishkek.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Bishkek_City's_business_center.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Bishkek",
    "artist": "Aitenir",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "description": "Bishkek's City business center"
  },
  "tbilisi": {
    "city": "Tbilisi",
    "asset": "/trip-city-images/tbilisi.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Tbilisi_City_Council%2C_Tbilisi%2C_Georgia.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Tbilisi",
    "artist": "LeontinaVarlamonva",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "description": "City Council of Tbilisi, Georgia"
  },
  "bandar-seri-begawan": {
    "city": "Bandar Seri Begawan",
    "asset": "/trip-city-images/bandar-seri-begawan.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Sultan_Omar_Ali_Saifuddin_Mosque_02.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Bandar_Seri_Begawan",
    "artist": "sam garza from Los Angeles, USA",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "description": "Dusk at the Sultan Omar Ali Saifuddin Mosque in Brunei on the eve of Ramadan."
  },
  "dushanbe": {
    "city": "Dushanbe",
    "asset": "/trip-city-images/dushanbe.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Dushanbe_Fountain.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Dushanbe",
    "artist": "Prince Roy",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "description": "Fountain in Dushanbe, Tajikistan"
  },
  "ulaanbaatar": {
    "city": "Ulaanbaatar",
    "asset": "/trip-city-images/ulaanbaatar.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:UB_downtown.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Ulaanbaatar",
    "artist": "Zazaa Mongolia",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "View of Ulaanbaatar in Mongolia, with the Blue Sky Tower."
  },
  "bangkok": {
    "city": "Bangkok",
    "asset": "/trip-city-images/bangkok.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:4Y1A1150_Bangkok_(33536339665).jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Bangkok",
    "artist": "Ninara from Helsinki, Finland",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "description": "Bangkok, Thailand\n\nView from the State Tower"
  },
  "male": {
    "city": "Mal?",
    "asset": "/trip-city-images/male.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:%E0%A6%AE%E0%A6%BE%E0%A6%B2%E0%A6%AC%E0%A6%BE%E0%A6%9C%E0%A6%BE%E0%A6%B0_%E0%A6%B8%E0%A7%81%E0%A6%AD%E0%A6%BE%E0%A6%B7_%E0%A6%AE%E0%A7%8B%E0%A6%A1%E0%A6%BC_%E0%A7%A8.jpg",
    "articleUrl": "",
    "artist": "শরদিন্দু ভট্টাচার্য্য",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Subhas more, Malbazar"
  },
  "hong-kong": {
    "city": "Hong Kong",
    "asset": "/trip-city-images/hong-kong.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Vista_del_Puerto_de_Victoria_desde_Sky100%2C_Hong_Kong%2C_2013-08-09%2C_DD_10.JPG",
    "articleUrl": "https://en.wikipedia.org/wiki/Hong_Kong",
    "artist": "Diego Delso",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "View of the Victoria Harbour from the Sky100, the 100th floor of the International Commerce Centre skyscraper in Kowloon, Hong Kong, China."
  },
  "singapore": {
    "city": "Singapore",
    "asset": "/trip-city-images/singapore.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Singapore_(SG)%2C_Old_City_Hall_--_2019_--_4716.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Singapore",
    "artist": "Dietmar Rabich",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Old City Hall and former Supreme Court respectively National Gallery, SingaporeNote: The photo was taken from the observation deck „Marina Bay Sands SkyPark“ of the Marina Bay Sands Hotel."
  },
  "sarajevo": {
    "city": "Sarajevo",
    "asset": "/trip-city-images/sarajevo.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Sarajevo_City_Panorama.JPG",
    "articleUrl": "https://en.wikipedia.org/wiki/Sarajevo",
    "artist": "Julian Nyča",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Blick von Osten über die bosnische Hauptstadt Sarajevo."
  },
  "kotor": {
    "city": "Kotor",
    "asset": "/trip-city-images/kotor.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Kotor_and_Boka_kotorska_-_view_from_city_wall.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Kotor",
    "artist": "Pudelek (Marcin Szala)",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Kotor and Boka kotorska - panorama from city wall"
  },
  "bucharest": {
    "city": "Bucharest",
    "asset": "/trip-city-images/bucharest.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Bucharest_University_Square_(cropped).jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Bucharest",
    "artist": "Madalin Pentelie",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "description": "Iconic University Square, symbolizing Bucharest's historic and cultural center."
  },
  "amman": {
    "city": "Amman",
    "asset": "/trip-city-images/amman.png",
    "source": "https://commons.wikimedia.org/wiki/File:New_Abdali_2024.png",
    "articleUrl": "https://en.wikipedia.org/wiki/Amman",
    "artist": "Ramzik1999",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "New Abdali 2024"
  },
  "skopje": {
    "city": "Skopje",
    "asset": "/trip-city-images/skopje.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Hooded_Crow_(Corvus_cornix)_City_Park%2C_Skopje%2C_North_Macedonia.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Skopje",
    "artist": "Chuck Homler d/b/a Focus On Wildlife",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "A Hooded Crow in \"City Park,\"  Skopje, North Macedonia"
  },
  "marrakesh": {
    "city": "Marrakesh",
    "asset": "/trip-city-images/marrakesh.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Pavillon_Menarag%C3%A4rten.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Marrakesh",
    "artist": "Acp",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "description": "Pavillion in den Menaragärten, dahinter das Atlasgebirge"
  },
  "nairobi": {
    "city": "Nairobi",
    "asset": "/trip-city-images/nairobi.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Nairobi_city_hall.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Nairobi",
    "artist": "Jorge Láscar",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "description": "The old Nairobi Town hall was a wood and iron one-storey building. The Second Home of the Municipal Authority which it occupied from 1913 to 1923 was a wood and Iron building. A new town hall was built and completed in 1934. The new Town hall was opened in the same week as the Law Courts, opposite it, during the Silver Jubilee Celebrations in May 1935. Construction of a new complex commenced in 1950 and was completed in 1957 when it was officially opened. Until the opening of the Kenyatta International Conference Center (KICC), City Hall provided all the necessary facilities for confrences in Nairobi. The 165ft high clock tower, was the tallest building in Nairobi in 1957. In 1981, the Nairobi City Council completed a further 13 storey City hall Annexe"
  },
  "arusha": {
    "city": "Arusha",
    "asset": "/trip-city-images/arusha.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Arusha_City_view.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Arusha",
    "artist": "Halidtz",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "View of Arusha City in 2021, Arusha Region, Tanzania."
  },
  "accra": {
    "city": "Accra",
    "asset": "/trip-city-images/accra.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Acca.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Accra",
    "artist": "Amoat7",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Accra"
  },
  "dakar": {
    "city": "Dakar",
    "asset": "/trip-city-images/dakar.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Dakar-Ind%C3%A9pendance.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Dakar",
    "artist": "mostroneddo",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "description": "La place de l'Indépendance à Dakar (Sénégal). En arrière-plan le port et Gorée."
  },
  "chisinau": {
    "city": "Chi?in?u",
    "asset": "/trip-city-images/chisinau.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Pit%C3%B3n_de_la_India_(Python_molurus)%2C_Zoo_de_Ciudad_Ho_Chi_Minh%2C_Vietnam%2C_2013-08-14%2C_DD_08.JPG",
    "articleUrl": "",
    "artist": "Diego Delso",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Indian python albino (Python molurus), Ho Chi Minh City Zoo, Vietnam"
  },
  "port-vila": {
    "city": "Port Vila",
    "asset": "/trip-city-images/port-vila.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Port_Vila_aerial.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Port_Vila",
    "artist": "Phillip Capper from Wellington, New Zealand",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "description": "En route Port Vila to Auckland"
  },
  "georgetown": {
    "city": "Georgetown, Guyana",
    "asset": "/trip-city-images/georgetown.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Guyana_Parliament_Building.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Georgetown%2C_Guyana",
    "artist": "David Stanley",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0",
    "description": "The neo-Classical Parliament Building in Georgetown, Guyana, is a monumental brick building completed in 1834. Two Russian cannon captured during the Crimean War grace the front lawn."
  },
  "livingstone": {
    "city": "Livingstone",
    "asset": "/trip-city-images/livingstone.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Livingstone_City_Centre_Dual_Carriageway_(southwards).jpg",
    "articleUrl": "",
    "artist": "GeographicAccountant",
    "license": "CC0",
    "licenseUrl": "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
    "description": "The Dual Carriageway section of the T1 in Livingstone."
  },
  "apia": {
    "city": "Apia",
    "asset": "/trip-city-images/apia.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Samoa_-_Apia_Govt_buildings.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Apia",
    "artist": "Wikimedia Commons contributor",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "http://creativecommons.org/licenses/by-sa/3.0/",
    "description": ""
  },
  "paramaribo": {
    "city": "Paramaribo",
    "asset": "/trip-city-images/paramaribo.png",
    "source": "https://commons.wikimedia.org/wiki/File:Paramaribo_city_collage.png",
    "articleUrl": "https://en.wikipedia.org/wiki/Paramaribo",
    "artist": "LLs",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "Paramaribo city, capital of Suriname."
  },
  "quito": {
    "city": "Quito",
    "asset": "/trip-city-images/quito.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Quito_calle_Garc%C3%ADa_Moreno.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Quito",
    "artist": "Cayambe",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Quito, capital of Ecuador, García Moreno street in the historic centre of the city. The Virgin of Quito is seen in the background."
  },
  "antigua-guatemala": {
    "city": "Antigua Guatemala",
    "asset": "/trip-city-images/antigua-guatemala.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Santa_Catalina_Arch_-_Antigua_Guatemala_Feb_2020.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Antigua_Guatemala",
    "artist": "Chad Davis",
    "license": "CC BY-SA 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/2.0",
    "description": "The Santa Catalina Arch is one of the distinguishable landmarks in Antigua Guatemala, Guatemala, located on 5th Avenue North. Built in the 17th century, it originally connected the Santa Catalina convent to a school, allowing the cloistered nuns to pass from one building to the other without going out on the street. A clock on top was added in the era of the Central American Federation, in the 1830s. Source: en.wikipedia.org/wiki/Arco_de_Santa_Catalina\nIn the background is Volcán de Agua (also known as Hunahpú by Maya) is a stratovolcano located in the departments of Sacatepéquez and Escuintla in Guatemala. At 3,760 m (12,340 ft), Agua Volcano towers more than 3,500 m (11,500 ft) above the Pacific coastal plain to the south and 2,000 m (6,600 ft) above the Guatemalan Highlands to the north. It dominates the local landscape except when hidden by cloud cover. The volcano is within 5 to 10 km (3.1 to 6.2 mi) of the city of Antigua Guatemala and several other large towns situated on its northern apron. These towns have a combined population of nearly 100,000. It is within about 20 km of Escuintla (population, ca. 150,000) to the south.\n\nSource: en.wikipedia.org/wiki/Volc%C3%A1n_de_Agua"
  },
  "pattaya": {
    "city": "Pattaya",
    "asset": "/trip-city-images/pattaya.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Pattaya_beach_from_view_point.jpg",
    "articleUrl": "https://en.wikipedia.org/wiki/Pattaya",
    "artist": "Sergey S. Dukachev",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0",
    "description": "Pattaya beach from view point"
  },
  "asuncion": {
    "city": "Paraguay - Saltos del Monday",
    "asset": "/trip-city-images/asuncion.jpg",
    "source": "https://commons.wikimedia.org/wiki/File:Saltos_del_Monday,_Presidente_Franco,_Alto_Paran%C3%A1,_Paraguay_(1).jpg",
    "articleUrl": "",
    "artist": "FFE.Franco",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
    "description": "The Monday Falls in Presidente Franco, Alto Paraná, Paraguay"
  }
};
