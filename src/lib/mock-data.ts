// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA — Phase 1 placeholder
// Replace each function body with real API calls when integrating:
//   ForeUP:     GET https://app.foreup.com/api/tee-times
//   Lightspeed: GET https://api.chronogolf.com/v1/tee_times
// ─────────────────────────────────────────────────────────────────────────────

export interface TeeTime {
  id: string;
  courseId: string;
  courseName: string;
  city: string;
  state: string;
  platform: "foreup" | "lightspeed" | "mock";
  teeTime: string;       // ISO string
  price: number;
  availableSpots: number;
  holes: 9 | 18;
  cartIncluded: boolean;
}

export interface SearchParams {
  location: string;
  date: string;          // YYYY-MM-DD
  timeFrom: string;      // HH:MM
  timeTo: string;        // HH:MM
  players: number;
  holes: "9" | "18" | "any";
  maxPrice: number;
}

const MOCK_COURSES = [
  { id: "course-001", name: "Pebble Beach Golf Links",   city: "Pebble Beach", state: "CA", platform: "foreup"     as const },
  { id: "course-002", name: "Torrey Pines Golf Course",  city: "San Diego",    state: "CA", platform: "foreup"     as const },
  { id: "course-003", name: "Rancho Park Golf Course",   city: "Los Angeles",  state: "CA", platform: "lightspeed" as const },
  { id: "course-004", name: "Adobe Creek Golf Course",   city: "Petaluma",     state: "CA", platform: "lightspeed" as const },
  { id: "course-005", name: "Harding Park Golf Course",  city: "San Francisco",state: "CA", platform: "mock"       as const },
  { id: "course-006", name: "Los Verdes Golf Course",    city: "Rancho Palos Verdes", state: "CA", platform: "mock" as const },
];

function generateTeeTimes(course: typeof MOCK_COURSES[0], date: string): TeeTime[] {
  const times = ["06:00","06:10","06:20","07:00","07:10","08:00","08:10","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"];
  return times.map((t, i) => ({
    id: `${course.id}-${date}-${t}`,
    courseId: course.id,
    courseName: course.name,
    city: course.city,
    state: course.state,
    platform: course.platform,
    teeTime: `${date}T${t}:00`,
    price: 45 + Math.floor(Math.random() * 120),
    availableSpots: [1, 2, 3, 4][Math.floor(Math.random() * 4)],
    holes: i % 3 === 0 ? 9 : 18,
    cartIncluded: Math.random() > 0.5,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// TODO Phase 1: Replace this function with real API aggregation
//
// async function fetchForeUpTeeTimes(params: SearchParams): Promise<TeeTime[]> {
//   const res = await fetch(`${process.env.FOREUP_BASE_URL}/tee-times?...`, {
//     headers: { Authorization: `Bearer ${process.env.FOREUP_API_KEY}` }
//   });
//   return res.json();
// }
//
// async function fetchLightspeedTeeTimes(params: SearchParams): Promise<TeeTime[]> {
//   const res = await fetch(`${process.env.LIGHTSPEED_BASE_URL}/v1/tee_times?...`, {
//     headers: { Authorization: `Bearer ${process.env.LIGHTSPEED_CLIENT_ID}` }
//   });
//   return res.json();
// }
// ─────────────────────────────────────────────────────────────────────────────
export async function searchTeeTimes(params: SearchParams): Promise<TeeTime[]> {
  // Simulate network delay
  await new Promise(r => setTimeout(r, 400));

  const allTimes = MOCK_COURSES.flatMap(c => generateTeeTimes(c, params.date));

  const filtered = allTimes.filter(t => {
    const time = t.teeTime.split("T")[1].slice(0,5);
    const matchesLocation =
      t.city.toLowerCase().includes(params.location.toLowerCase()) ||
      t.state.toLowerCase().includes(params.location.toLowerCase()) ||
      t.courseName.toLowerCase().includes(params.location.toLowerCase());
    const matchesTimeFrom = !params.timeFrom || time >= params.timeFrom;
    const matchesTimeTo   = !params.timeTo   || time <= params.timeTo;
    const matchesPlayers  = t.availableSpots >= params.players;
    const matchesHoles    = params.holes === "any" || String(t.holes) === params.holes;
    const matchesPrice    = t.price <= params.maxPrice;
    return matchesLocation && matchesTimeFrom && matchesTimeTo && matchesPlayers && matchesHoles && matchesPrice;
  });

  // In mock mode, fall back to all results if location doesn't match any mock courses
  if (params.location && filtered.length === 0) {
    return allTimes.filter(t => {
      const time = t.teeTime.split("T")[1].slice(0,5);
      const matchesTimeFrom = !params.timeFrom || time >= params.timeFrom;
      const matchesTimeTo   = !params.timeTo   || time <= params.timeTo;
      const matchesPlayers  = t.availableSpots >= params.players;
      const matchesHoles    = params.holes === "any" || String(t.holes) === params.holes;
      const matchesPrice    = t.price <= params.maxPrice;
      return matchesTimeFrom && matchesTimeTo && matchesPlayers && matchesHoles && matchesPrice;
    });
  }

  return filtered;
}

export async function getTeeTimeById(id: string): Promise<TeeTime | null> {
  const date = id.split("-").slice(2, 5).join("-");
  const all = MOCK_COURSES.flatMap(c => generateTeeTimes(c, date));
  return all.find(t => t.id === id) ?? null;
}
