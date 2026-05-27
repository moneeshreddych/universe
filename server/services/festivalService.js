import { getPanchangamData } from './panchangamService.js';
import { getSunLongitude, getSiderealLongitude } from './astronomyService.js';

const TITHI_MAP = {
  "Padyami": 1,
  "Vidiya": 2,
  "Tadiya": 3,
  "Chavithi": 4,
  "Panchami": 5,
  "Shashti": 6,
  "Saptami": 7,
  "Ashtami": 8,
  "Navami": 9,
  "Dasami": 10,
  "Ekadasi": 11,
  "Dwadasi": 12,
  "Trayodasi": 13,
  "Chaturdasi": 14,
  "Pournami": 15,
  "Amavasya": 30
};

// Helper: Convert Paksham + Tithi Name to absolute Tithi Number (1 to 30)
function getTithiNum(paksham, tithiName) {
  const base = TITHI_MAP[tithiName] || 1;
  if (base === 30) return 30;
  if (paksham === 'Krishna Paksham') {
    return base + 15;
  }
  return base;
}

// Helper: Get Tithi Name from absolute Tithi Number (1 to 30)
function getTithiNameFromNum(num) {
  if (num === 30) return "Amavasya";
  const index = (num - 1) % 15;
  const names = Object.keys(TITHI_MAP);
  return names[index];
}

// Helper: Determine if a day contains a target Tithi (handles Kshaya/skipped Tithis)
function dayHasTithi(curr, next, targetMasam, targetPaksham, targetTithiName) {
  // 1. Direct check at sunrise
  if (curr.masam === targetMasam && curr.paksham === targetPaksham && curr.tithi === targetTithiName) {
    return true;
  }

  if (!next) return false;

  // 2. Check for skipped Tithis between current and next sunrise
  const currNum = getTithiNum(curr.paksham, curr.tithi);
  const nextNum = getTithiNum(next.paksham, next.tithi);

  const diff = (nextNum - currNum + 30) % 30;
  if (diff > 1) {
    // Loop through skipped Tithis
    for (let s = 1; s < diff; s++) {
      const skippedNum = (currNum + s) % 30 || 30;
      const skippedPaksham = skippedNum <= 15 ? 'Shukla Paksham' : 'Krishna Paksham';
      const skippedTithiName = getTithiNameFromNum(skippedNum);
      
      // Determine the month of the skipped Tithi (Shukla Pratipada starts the new month)
      const skippedMasam = skippedNum === 1 ? next.masam : curr.masam;

      if (skippedMasam === targetMasam && skippedPaksham === targetPaksham && skippedTithiName === targetTithiName) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Programmatically scans all calendar days of a specific year to detect major Hindu festivals.
 * Evaluates conditions at local sunrise for each day.
 */
export function getFestivalsForYear(year, timezone, lat, lon, alt = 0) {
  const festivals = [];

  const startDate = new Date(Date.UTC(year, 0, 1, 6, 0, 0));
  const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

  const dates = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const panchangamList = [];

  for (const date of dates) {
    const data = getPanchangamData(date, timezone, lat, lon, alt);
    
    // We also need the Sun's longitude for Makara Sankranti (Sankranti transit)
    const sunLong = getSunLongitude(data.evalTime);
    const sunSidereal = getSiderealLongitude(sunLong, data.evalTime);
    
    panchangamList.push({
      dateStr: data.date,
      masam: data.masam,
      paksham: data.paksham,
      tithi: data.tithi,
      vaaram: data.vaaram,
      sunSidereal,
      weekday: date.getUTCDay()
    });
  }

  // Find Makara Sankranti (when Sun transits into Makara Rasi at 270 degrees sidereal)
  for (let i = 1; i < panchangamList.length; i++) {
    const prev = panchangamList[i - 1];
    const curr = panchangamList[i];
    
    if (prev.sunSidereal < 270 && curr.sunSidereal >= 270 && curr.sunSidereal < 300) {
      festivals.push({
        date: curr.dateStr,
        name: "Bhogi / Makara Sankranti",
        description: "Sun transits into Makara Rasi (Capricorn)"
      });
    }
  }

  // Scan for tithi-based and nakshatra-based festivals
  for (let i = 0; i < panchangamList.length; i++) {
    const curr = panchangamList[i];
    const next = panchangamList[i + 1];

    // Ugadi: Chaitra Shukla Padyami
    if (dayHasTithi(curr, next, 'Chaitram', 'Shukla Paksham', 'Padyami')) {
      festivals.push({
        date: curr.dateStr,
        name: "Ugadi",
        description: "Telugu New Year"
      });
    }

    // Sri Rama Navami: Chaitra Shukla Navami
    if (dayHasTithi(curr, next, 'Chaitram', 'Shukla Paksham', 'Navami')) {
      festivals.push({
        date: curr.dateStr,
        name: "Sri Rama Navami",
        description: "Birth anniversary of Lord Sri Rama"
      });
    }

    // Hanuman Jayanti: Chaitra Pournami
    if (dayHasTithi(curr, next, 'Chaitram', 'Shukla Paksham', 'Pournami')) {
      festivals.push({
        date: curr.dateStr,
        name: "Hanuman Jayanti",
        description: "Birth anniversary of Lord Hanuman"
      });
    }

    // Narasimha Jayanti: Vaishakha Shukla Chaturdashi
    if (dayHasTithi(curr, next, 'Vaishakham', 'Shukla Paksham', 'Chaturdasi')) {
      festivals.push({
        date: curr.dateStr,
        name: "Narasimha Jayanti",
        description: "Appearance day of Lord Narasimha"
      });
    }

    // Guru Pournami: Ashadha Pournami
    if (dayHasTithi(curr, next, 'Ashadham', 'Shukla Paksham', 'Pournami')) {
      festivals.push({
        date: curr.dateStr,
        name: "Guru Pournami",
        description: "Vyas Pooja, honoring spiritual gurus"
      });
    }

    // Raksha Bandhan: Shravana Pournami
    if (dayHasTithi(curr, next, 'Shravanam', 'Shukla Paksham', 'Pournami')) {
      festivals.push({
        date: curr.dateStr,
        name: "Raksha Bandhan / Jandhyala Pournami",
        description: "Festival celebrating sibling protection"
      });
    }

    // Sri Krishna Janmashtami: Shravana Krishna Ashtami
    if (dayHasTithi(curr, next, 'Shravanam', 'Krishna Paksham', 'Ashtami')) {
      festivals.push({
        date: curr.dateStr,
        name: "Sri Krishna Janmashtami",
        description: "Birth anniversary of Lord Sri Krishna"
      });
    }

    // Vinayaka Chavithi: Bhadrapada Shukla Chavithi
    if (dayHasTithi(curr, next, 'Bhadrapadam', 'Shukla Paksham', 'Chavithi')) {
      festivals.push({
        date: curr.dateStr,
        name: "Vinayaka Chavithi",
        description: "Ganesh Chaturthi festival"
      });
    }

    // Dasara (Vijayadashami): Ashwayuja Shukla Dashami
    if (dayHasTithi(curr, next, 'Ashwayujam', 'Shukla Paksham', 'Dasami')) {
      festivals.push({
        date: curr.dateStr,
        name: "Dasara / Vijayadashami",
        description: "Victory of good over evil"
      });
    }

    // Deepavali: Ashwayuja Krishna Amavasya
    if (dayHasTithi(curr, next, 'Ashwayujam', 'Krishna Paksham', 'Amavasya')) {
      festivals.push({
        date: curr.dateStr,
        name: "Deepavali",
        description: "Festival of Lights"
      });
    }

    // Karthika Pournami: Kartika Shukla Pournami
    if (dayHasTithi(curr, next, 'Karthikam', 'Shukla Paksham', 'Pournami')) {
      festivals.push({
        date: curr.dateStr,
        name: "Karthika Pournami",
        description: "Auspicious full moon of Karthika month"
      });
    }

    // Maha Shivaratri: Magha Krishna Chaturdashi
    if (dayHasTithi(curr, next, 'Magham', 'Krishna Paksham', 'Chaturdasi')) {
      festivals.push({
        date: curr.dateStr,
        name: "Maha Shivaratri",
        description: "The Great Night of Lord Shiva"
      });
    }

    // Varalakshmi Vratam: Friday preceding Shravana Pournami
    if (curr.masam === 'Shravanam' && curr.paksham === 'Shukla Paksham' && curr.tithi === 'Pournami') {
      let j = i;
      while (j >= 0) {
        if (panchangamList[j].weekday === 5) { // Friday
          festivals.push({
            date: panchangamList[j].dateStr,
            name: "Varalakshmi Vratam",
            description: "Auspicious Friday worship of Goddess Lakshmi preceding Shravana Pournami"
          });
          break;
        }
        j--;
      }
    }
  }

  // Sort festivals chronologically
  festivals.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Deduplicate
  const uniqueFestivals = [];
  const seen = new Set();
  for (const f of festivals) {
    const key = `${f.date}-${f.name}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueFestivals.push(f);
    }
  }

  return uniqueFestivals;
}
