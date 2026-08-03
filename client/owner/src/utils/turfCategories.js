import {
  Activity,
  CircleDot,
  Dribbble,
  Dumbbell,
  Goal,
  Move3D,
  Pickaxe,
  Shield,
  Swords,
} from "lucide-react";

export const TURF_CATEGORY_OPTIONS = [
  {
    value: "football",
    label: "Football",
    description: "Full-field or standard football play.",
    icon: Goal,
    badgeClass: "badge-success badge-outline",
  },
  {
    value: "cricket",
    label: "Cricket",
    description: "Open cricket ground or net-focused play.",
    icon: Shield,
    badgeClass: "badge-info badge-outline",
  },
  {
    value: "box-cricket",
    label: "Box Cricket",
    description: "Compact fast-match cricket format.",
    icon: CircleDot,
    badgeClass: "badge-primary badge-outline",
  },
  {
    value: "badminton",
    label: "Badminton",
    description: "Indoor or court-led shuttle play.",
    icon: Activity,
    badgeClass: "badge-warning badge-outline",
  },
  {
    value: "tennis",
    label: "Tennis",
    description: "Singles or doubles racket court setup.",
    icon: Dribbble,
    badgeClass: "badge-secondary badge-outline",
  },
  {
    value: "pickleball",
    label: "Pickleball",
    description: "Dedicated pickleball court format.",
    icon: Pickaxe,
    badgeClass: "badge-accent badge-outline",
  },
  {
    value: "futsal",
    label: "Futsal",
    description: "Small-sided indoor football variant.",
    icon: Swords,
    badgeClass: "badge-success",
  },
  {
    value: "multi-sport",
    label: "Multi-Sport",
    description: "Flexible venue supporting multiple play types.",
    icon: Move3D,
    badgeClass: "badge-neutral badge-outline",
  },
  {
    value: "training-arena",
    label: "Training Arena",
    description: "Drills, coaching, or practice-first setup.",
    icon: Dumbbell,
    badgeClass: "badge-warning",
  },
];

const categoryMap = new Map(TURF_CATEGORY_OPTIONS.map((category) => [category.value, category]));

const SPORT_TO_CATEGORY = {
  football: "football",
  cricket: "cricket",
  "box cricket": "box-cricket",
  badminton: "badminton",
  tennis: "tennis",
  pickleball: "pickleball",
  futsal: "futsal",
  training: "training-arena",
  "training arena": "training-arena",
};

const normalize = (value) => String(value || "").trim().toLowerCase();

export const inferPrimaryCategory = (sportTypes = [], explicitCategory = "") => {
  const normalizedCategory = normalize(explicitCategory);
  if (categoryMap.has(normalizedCategory)) {
    return normalizedCategory;
  }

  const normalizedSports = [...new Set((Array.isArray(sportTypes) ? sportTypes : [])
    .map(normalize)
    .filter(Boolean))];

  if (normalizedSports.length === 0) {
    return "multi-sport";
  }

  if (normalizedSports.length > 1) {
    return "multi-sport";
  }

  return SPORT_TO_CATEGORY[normalizedSports[0]] || "multi-sport";
};

export const getPrimaryCategoryConfig = (category, sportTypes = []) =>
  categoryMap.get(inferPrimaryCategory(sportTypes, category)) || categoryMap.get("multi-sport");
