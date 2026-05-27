# Telugu Calendar API Guide

This website now hosts a static JSON API for the Telugu Calendar (Parabhava Samvatsaram 2026). You can use these endpoints directly in your mobile or web applications.

## API Endpoints

### 1. Full Year 2026 Calendar Endpoint
Retrieve the complete calendar dataset for all 365 days of 2026.
* **Local Link:** `http://localhost:5173/public/api/calendar_2026.json`
* **Production Link:** `https://moneeshreddych.github.io/universe/public/api/calendar_2026.json`

### 2. Day-by-Day Endpoint
Retrieve the Panchangam, Rasi, Nakshatram, and festival details for a specific date (formatted as `YYYY-MM-DD`).
* **Local Link:** `http://localhost:5173/public/api/dates/2026-03-19.json` (example for Ugadi)
* **Production Link:** `https://moneeshreddych.github.io/universe/public/api/dates/2026-03-19.json`

---

## Response Structure Example (`2026-03-19.json`)
```json
{
  "teluguYear": "పరాభవ (Parabhava)",
  "teluguMonth": "చైత్రము",
  "teluguMonthEn": "Chaitra",
  "pakshamTe": "శుక్ల పక్షము",
  "pakshamEn": "Shukla Paksham",
  "tithiNameTe": "పాడ్యమి",
  "tithiNameEn": "Padyami",
  "tithiShortTe": "శు. పాడ్యమి",
  "tithiEndTime": "04:12 PM",
  "nakshatraNameTe": "ఉత్తరాభాద్ర",
  "nakshatraNameEn": "Uttara Bhadrapada",
  "nakshatraEndTime": "02:30 PM",
  "rashiTe": "మీనం (Pisces)",
  "rashiEn": "Meena",
  "festival": {
    "nameTe": "ఉగాది (పరాభవ ఉగాది)",
    "nameEn": "Ugadi (Telugu New Year)",
    "color": "bg-green-600/20 text-green-300 border-green-500/50"
  },
  "rahuKalam": "01:30 PM - 03:00 PM",
  "durmuhurtham": "10:06 AM - 10:54 AM & 02:54 PM - 03:42 PM",
  "yamagandam": "06:00 AM - 07:30 AM",
  "abhijit": "11:50 AM - 12:40 PM"
}
```

---

## Code Examples

### JavaScript / React
```javascript
async function fetchPanchangam(dateString) {
  // dateString format: "2026-03-19"
  try {
    const response = await fetch(`http://localhost:5173/public/api/dates/${dateString}.json`);
    const data = await response.json();
    console.log("Panchangam details:", data);
    return data;
  } catch (error) {
    console.error("Error fetching Telugu calendar data:", error);
  }
}
```

### Flutter (Dart)
```dart
import 'dart:convert';
import 'http/http.dart' as http;

Future<Map<String, dynamic>?> fetchPanchangam(String dateString) async {
  final url = Uri.parse('http://localhost:5173/public/api/dates/$dateString.json');
  try {
    final response = await http.get(url);
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
  } catch (e) {
    print("Error: $e");
  }
  return null;
}
```

---

## Re-generating API Data
If you modify the calendar algorithms or add new festival listings in `calendar.js`, you can rebuild the API files by running:
```bash
node generate_api_data.js
```
This script will parse your datasets and regenerate all `.json` files inside the `public/api` directory.
