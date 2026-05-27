const PLANETS_DATA = [
  {
    id: "sun",
    nameEn: "Sun",
    nameTe: "సూర్యుడు (Surya)",
    symbol: "☀️",
    color: "from-orange-500 to-yellow-600",
    scientific: {
      type: "Yellow Dwarf Star",
      distance: "149.6 Million km (from Earth)",
      period: "N/A (Galactic Orbit ~230 Million years)",
      moons: "0",
      diameter: "1,392,700 km",
      fact: "The Sun accounts for 99.86% of the total mass of the entire Solar System."
    },
    astrological: {
      significance: "Soul, Father, Power, Authority, Health",
      rulingDay: "Sunday (ఆదివారం)",
      gemstone: "Ruby (కెంపు - Kempu)",
      metal: "Copper / Gold (రాగి / బంగారం)",
      rulingRasis: "Simha (Leo)",
      element: "Fire (అగ్ని)"
    }
  },
  {
    id: "moon",
    nameEn: "Moon",
    nameTe: "చంద్రుడు (Chandra)",
    symbol: "🌙",
    color: "from-slate-300 to-indigo-400",
    scientific: {
      type: "Natural Satellite of Earth",
      distance: "384,400 km (from Earth)",
      period: "27.3 Days (Orbital Period)",
      moons: "0 (N/A)",
      diameter: "3,474 km",
      fact: "The Moon is drifting away from Earth at a rate of approximately 3.8 cm per year."
    },
    astrological: {
      significance: "Mind, Mother, Emotions, Subconscious, Peace",
      rulingDay: "Monday (సోమవారం)",
      gemstone: "Pearl (ముత్యం - Mutyam)",
      metal: "Silver (వెండి)",
      rulingRasis: "Karka (Cancer)",
      element: "Water (జలం)"
    }
  },
  {
    id: "mercury",
    nameEn: "Mercury",
    nameTe: "బుధుడు (Budha)",
    symbol: "☿",
    color: "from-teal-400 to-emerald-600",
    scientific: {
      type: "Terrestrial Planet",
      distance: "57.9 Million km",
      period: "88 Days",
      moons: "0",
      diameter: "4,879 km",
      fact: "Despite being closest to the Sun, Mercury is not the hottest planet (Venus is)."
    },
    astrological: {
      significance: "Intellect, Communication, Speech, Education, Trade",
      rulingDay: "Wednesday (బుధవారం)",
      gemstone: "Emerald (పచ్చ - Paccha)",
      metal: "Brass / Zinc (ఇత్తడి / సత్తు)",
      rulingRasis: "Mithuna (Gemini), Kanya (Virgo)",
      element: "Earth (భూమి)"
    }
  },
  {
    id: "venus",
    nameEn: "Venus",
    nameTe: "శుక్రుడు (Shukra)",
    symbol: "♀",
    color: "from-amber-200 to-yellow-500",
    scientific: {
      type: "Terrestrial Planet",
      distance: "108.2 Million km",
      period: "224.7 Days",
      moons: "0",
      diameter: "12,104 km",
      fact: "Venus spins backwards on its axis compared to most other planets (retrograde rotation)."
    },
    astrological: {
      significance: "Art, Beauty, Love, Luxury, Vehicles, Marriage",
      rulingDay: "Friday (శుక్రవారం)",
      gemstone: "Diamond (వజ్రం - Vajram)",
      metal: "Silver / Platinum (వెండి / ప్లాటినం)",
      rulingRasis: "Vrishabha (Taurus), Tula (Libra)",
      element: "Water (జలం)"
    }
  },
  {
    id: "earth",
    nameEn: "Earth",
    nameTe: "భూమి (Bhoomi)",
    symbol: "🌍",
    color: "from-blue-500 to-green-500",
    scientific: {
      type: "Terrestrial Planet",
      distance: "149.6 Million km",
      period: "365.25 Days",
      moons: "1",
      diameter: "12,742 km",
      fact: "Earth is the only planet in the universe known to harbor life and surface liquid water."
    },
    astrological: {
      significance: "Stability, Mother Earth, Abundance, Patience",
      rulingDay: "N/A",
      gemstone: "Clay / Soil (astrological grounding)",
      metal: "Iron / Copper (ఇనుము / రాగి)",
      rulingRasis: "N/A (Base of all transit observers)",
      element: "Earth (భూమి)"
    }
  },
  {
    id: "mars",
    nameEn: "Mars",
    nameTe: "కుజుడు / అంగారకుడు (Kuja / Mangala)",
    symbol: "♂",
    color: "from-red-600 to-orange-700",
    scientific: {
      type: "Terrestrial Planet",
      distance: "227.9 Million km",
      period: "687 Days",
      moons: "2 (Phobos, Deimos)",
      diameter: "6,779 km",
      fact: "Mars is home to Olympus Mons, the largest volcano in the solar system, three times taller than Mount Everest."
    },
    astrological: {
      significance: "Courage, Energy, Action, Siblings, Fire, Physical Strength",
      rulingDay: "Tuesday (మంగళవారం)",
      gemstone: "Red Coral (పగడం - Pagadam)",
      metal: "Copper (రాగి)",
      rulingRasis: "Mesha (Aries), Vrishchika (Scorpio)",
      element: "Fire (అగ్ని)"
    }
  },
  {
    id: "jupiter",
    nameEn: "Jupiter",
    nameTe: "గురుడు / బృహస్పతి (Guru / Brihaspati)",
    symbol: "♃",
    color: "from-yellow-500 to-amber-600",
    scientific: {
      type: "Gas Giant",
      distance: "778.5 Million km",
      period: "12 Years",
      moons: "95 (Io, Europa, Ganymede, Callisto, etc.)",
      diameter: "139,820 km",
      fact: "Jupiter's Great Red Spot is a giant storm wider than Earth that has raged for hundreds of years."
    },
    astrological: {
      significance: "Wisdom, Knowledge, Wealth, Children, Expansion, Spirituality",
      rulingDay: "Thursday (గురువారం)",
      gemstone: "Yellow Sapphire (పుష్యరాగం - Pushyaragam)",
      metal: "Gold (బంగారం)",
      rulingRasis: "Dhanu (Sagittarius), Meena (Pisces)",
      element: "Space / Ether (ఆకాశం)"
    }
  },
  {
    id: "saturn",
    nameEn: "Saturn",
    nameTe: "శని (Shani)",
    symbol: "♄",
    color: "from-purple-800 to-indigo-950",
    scientific: {
      type: "Gas Giant",
      distance: "1.4 Billion km",
      period: "29.5 Years",
      moons: "146 (Titan, Enceladus, Mimas, etc.)",
      diameter: "116,460 km",
      fact: "Saturn has the most extensive ring system, made of billions of ice particles, rocky debris, and dust."
    },
    astrological: {
      significance: "Discipline, Karma, Longevity, Hard Work, Patience, Delays",
      rulingDay: "Saturday (శనివారం)",
      gemstone: "Blue Sapphire (నీలం - Neelam)",
      metal: "Iron (ఇనుము)",
      rulingRasis: "Makara (Capricorn), Kumbha (Aquarius)",
      element: "Air (వాయువు)"
    }
  },
  {
    id: "uranus",
    nameEn: "Uranus",
    nameTe: "వరుణుడు (Varunudu)",
    symbol: "♅",
    color: "from-cyan-400 to-teal-500",
    scientific: {
      type: "Ice Giant",
      distance: "2.9 Billion km",
      period: "84 Years",
      moons: "28 (Titania, Oberon, Ariel, etc.)",
      diameter: "50,724 km",
      fact: "Uranus rotates on its side, virtually 98 degrees off its orbital axis."
    },
    astrological: {
      significance: "Innovation, Sudden Change, Rebellion, Intuition",
      rulingDay: "N/A (Outer Planet)",
      gemstone: "Hessonite (గోమేధికం - Gomedhikam, associated via Rahu affinity)",
      metal: "Uranium / Zinc (సత్తు)",
      rulingRasis: "Co-ruler of Kumbha (in modern astrology)",
      element: "Air / Ether (వాయువు / ఆకాశం)"
    }
  },
  {
    id: "neptune",
    nameEn: "Neptune",
    nameTe: "ఇంద్రుడు (Indrudu)",
    symbol: "♆",
    color: "from-blue-600 to-sky-800",
    scientific: {
      type: "Ice Giant",
      distance: "4.5 Billion km",
      period: "164.8 Years",
      moons: "16 (Triton, Nereid, etc.)",
      diameter: "49,244 km",
      fact: "Neptune has the strongest winds in the solar system, reaching speeds up to 2,100 km/h."
    },
    astrological: {
      significance: "Mysticism, Dreams, Illusion, Oceans, Spiritual Awakening",
      rulingDay: "N/A (Outer Planet)",
      gemstone: "Cat's Eye (వైఢూర్యం - Vaidhuryam, associated via Ketu affinity)",
      metal: "Platinum / Tin (తగరం)",
      rulingRasis: "Co-ruler of Meena (in modern astrology)",
      element: "Water (జలం)"
    }
  },
  {
    id: "pluto",
    nameEn: "Pluto",
    nameTe: "యముడు (Yamudu)",
    symbol: "♇",
    color: "from-gray-600 to-slate-800",
    scientific: {
      type: "Dwarf Planet",
      distance: "5.9 Billion km",
      period: "248 Years",
      moons: "5 (Charon, Nix, Hydra, Kerberos, Styx)",
      diameter: "2,376 km",
      fact: "Pluto was reclassified as a dwarf planet in 2006, and its heart-shaped glacier, Tombaugh Regio, is made of nitrogen ice."
    },
    astrological: {
      significance: "Transformation, Death and Rebirth, Secrets, Power struggles",
      rulingDay: "N/A (Outer Planet)",
      gemstone: "Obsidian / Onyx",
      metal: "Lead (సీసం)",
      rulingRasis: "Co-ruler of Vrishchika (in modern astrology)",
      element: "Fire / Earth (అగ్ని / భూమి)"
    }
  }
];
