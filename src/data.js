// =====================================================
//  EcoForce website content: THIS IS THE FILE TO EDIT.
//  Everything below is SAMPLE DATA. Replace it with the real information.
//  Dates must be written as "YYYY-MM-DD", for example "2026-11-02".
// =====================================================

export const CONTACT = {
  name: "Ojas Phatak",
  role: "Head of EcoForce",
  email: "ecoforce.e@gmail.com",
  phone: "7219052782",
};

// Upcoming drives. A drive disappears automatically once its date has passed.
export const UPCOMING_DRIVES = [
  {
    title: "SAMPLE upcoming drive 1",
    date: "2026-11-08",
    time: "8:00 AM",
    location: "Location, Pune",
    notes: "Bring gloves and a water bottle.",
  },
  {
    title: "SAMPLE upcoming drive 2",
    date: "2026-11-22",
    time: "7:30 AM",
    location: "Another location, Pune",
    notes: "Meet at the main gate.",
  },
];

// Past drives. "kg" is the plastic collected in that drive.
// The Plastic Collected page and the total are worked out from these numbers.
export const PAST_DRIVES = [
  {
    title: "Drive: 100",
    date: "2023-06-25",
    location: "Vetal Tekdi, Pune",
    description: "100th drive conducted by EcoForce",
    kg: 50,
    participants: 45,
    photos: ["100thdrive.jpeg"],
  },
  {
    title: "Riverside Drive with UNICEF",
    date: "2025-03-23",
    location: "Riverside",
    description: "A drive with UNICEF",
    kg: 119,
    participants: 73,
    photos: ["unicef.jpeg", "unicef1.jpeg", "unicef2.jpeg", "unicef3.jpeg"],
  },
  {
    title: "5 year anniversary drive",
    date: "2026-03-15",
    location: "Mahatma Tekdi, Pune",
    description: "description: Five years after EcoForce began in October 2020, we celebrated with a big drive. Volunteers joined us to give Pune a cleaner start to our next chapter.",
    kg: 50,
    participants: 88,
    photos: ["anniversary.jpeg", "anniversary2.jpeg", "anniversary3.jpeg", "anniversary4.jpeg", "anniversary5.jpeg"],
  },
];

export const ABOUT = {
  // the two short lines shown on the About Us panel on the home screen
  panelLines: ["A student-led, non-profit group", "cleaning Pune's hills and rivers"],

  mission:
    "EcoForce is a student-led, non-profit group that cleans up Pune's hills and rivers, and wants to grow into awareness, recycling and policy work.",

  // each item is one paragraph
  story: [
    "Since October 2020, EcoForce has been run entirely by students. In that time we have collected approximately 3,000 kilograms of trash from Pune's hills and rivers.",
    "Besides clean-ups, we also organise bird watching trails, tree plantations, and seed collection and sowing events.",
    "Our work has been recognised by Pune radio stations including Akashvani, Infinity Radio and Vidyavani, as well as R.J. Sangram, and our members have been interviewed on BBC Marathi.",
  ],

  // the three cards under "What we do"
  points: [
    {
      title: "Clean-up drives",
      text: "We collect trash from Pune's hills and rivers, and have gathered approximately 3,000 kg so far.",
    },
    {
      title: "Nature events",
      text: "Bird watching trails, tree plantations, and seed collection and sowing events.",
    },
    {
      title: "Awareness and policy",
      text: "We are growing into awareness, recycling, legalities and policies, and we invite you to join in.",
    },
  ],
};

// ---------- helpers: no need to edit anything below ----------
const pad = (n) => String(n).padStart(2, "0");

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const toDate = (iso) => new Date(iso + "T00:00:00");

export const formatDate = (iso) =>
  toDate(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
export const dayOf = (iso) => toDate(iso).getDate();
export const monthOf = (iso) => toDate(iso).toLocaleDateString("en-IN", { month: "short" });

export const upcomingDrives = () =>
  UPCOMING_DRIVES.filter((d) => d.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date));

export const pastDrives = () => [...PAST_DRIVES].sort((a, b) => b.date.localeCompare(a.date));

export const totalKg = () => PAST_DRIVES.reduce((sum, d) => sum + (Number(d.kg) || 0), 0);

export const formatKg = (n) => Number(n || 0).toLocaleString("en-IN");