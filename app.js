const STORAGE_KEY = "athlete-assistant-profile";
const FEEDBACK_KEY = "athlete-assistant-feedback";
const EATEN_KEY = "athlete-assistant-eaten";
const WORKOUT_LOG_KEY = "athlete-assistant-workout-log";
const PROGRESS_KEY = "athlete-assistant-progress";
const CALENDAR_KEY = "athlete-assistant-calendar-notes";

const DEFAULT_PROFILE = {
  name: "Спортсмен",
  age: "28",
  sex: "male",
  city: "",
  height: "180",
  weight: "78",
  targetWeight: "",
  targetDate: "",
  goal: "Поддержание формы",
  priority: "Баланс формы и здоровья",
  sessions: "4",
  sessionMinutes: "60",
  trainingDays: "Пн, Ср, Пт, Сб",
  sport: "Тренажерный зал",
  level: "Средний",
  experience: "6-12 месяцев",
  equipment: "Тренажерный зал",
  injuries: "",
  sleepGoal: "8",
  stressLevel: "Средний",
  mealCount: "4",
  budget: "Средний",
  dietType: "Без ограничений",
  favoriteFoods: "",
  avoidFoods: "",
  availableProducts: "",
  foodNotes: "",
  trainingNotes: "",
};

const state = {
  profile: readStorage(STORAGE_KEY),
  feedback: readStorage(FEEDBACK_KEY) || [],
  eaten: readStorage(EATEN_KEY) || [],
  workoutLog: readStorage(WORKOUT_LOG_KEY) || [],
  progress: readStorage(PROGRESS_KEY) || [],
  calendarNotes: readStorage(CALENDAR_KEY) || [],
  view: "dashboard",
  effort: "normal",
};

const app = document.querySelector("#app");

const icons = {
  dashboard: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 13h6V4H4v9Zm0 7h6v-4H4v4Zm10 0h6v-9h-6v9Zm0-16v4h6V4h-6Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>`,
  meals: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M6 3v18M10 3v8a4 4 0 0 1-8 0V3M17 3v18M17 3c3 2 4.5 5 4.5 9H17" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  training: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M3 9v6M21 9v6M7 7v10M17 7v10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
  calendar: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M7 3v4M17 3v4M4 9h16M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  progress: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 19V5M4 19h16M7 15l3-4 3 2 5-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  advice: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 3a7 7 0 0 0-4 12.75V19h8v-3.25A7 7 0 0 0 12 3Zm-3 18h6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  profile: `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`,
};

const mealTemplates = {
  breakfast: [
    ["Овсянка", "70 г"],
    ["Греческий йогурт", "180 г"],
    ["Банан", "120 г"],
    ["Орехи", "15 г"],
  ],
  lunch: [
    ["Куриная грудка", "170 г"],
    ["Рис или гречка", "90 г сухого продукта"],
    ["Овощи", "250 г"],
    ["Оливковое масло", "10 г"],
  ],
  snack: [
    ["Творог", "200 г"],
    ["Ягоды", "120 г"],
    ["Мед", "10 г"],
    ["Хлебцы", "2 шт"],
  ],
  dinner: [
    ["Лосось или индейка", "160 г"],
    ["Картофель", "230 г"],
    ["Салат", "250 г"],
    ["Авокадо", "60 г"],
  ],
};

function readStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function currentProfile() {
  return { ...DEFAULT_PROFILE, ...(state.profile || {}) };
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}

function optionList(options, selectedValue) {
  return options
    .map((option) => {
      const value = Array.isArray(option) ? option[0] : option;
      const label = Array.isArray(option) ? option[1] : option;
      return `<option value="${escapeHtml(value)}" ${selectedValue === value ? "selected" : ""}>${escapeHtml(label)}</option>`;
    })
    .join("");
}

function compactNumber(value, digits = 1) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "0";
  return parsed % 1 === 0 ? String(parsed) : parsed.toFixed(digits);
}

function numberValue(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function macroValue(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed * 10) / 10 : 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getInitials(name = "A") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function estimatePlan(profile) {
  const weight = numberValue(profile.weight, 75);
  const height = numberValue(profile.height, 178);
  const age = numberValue(profile.age, 28);
  const sessions = numberValue(profile.sessions, 4);
  const sessionMinutes = numberValue(profile.sessionMinutes, 60);
  const sleepGoal = numberValue(profile.sleepGoal, 8);
  const sexFactor = profile.sex === "female" ? -161 : 5;
  const base = 10 * weight + 6.25 * height - 5 * age + sexFactor;
  const activity =
    sessions >= 5 || sessionMinutes >= 85 ? 1.62 : sessions >= 3 ? 1.48 : 1.34;
  const goalShift =
    profile.goal === "Похудение"
      ? -330
      : profile.goal === "Набор массы"
        ? 280
        : profile.goal === "Выносливость"
          ? 120
          : profile.goal === "Сила"
            ? 160
          : 0;
  const calories = Math.max(1700, Math.round((base * activity + goalShift) / 10) * 10);
  const proteinFactor =
    profile.goal === "Набор массы" || profile.goal === "Сила"
      ? 2
      : profile.goal === "Похудение"
        ? 1.9
        : 1.75;
  const protein = Math.round(weight * proteinFactor);
  const fat = Math.round(weight * 0.85);
  const carbs = Math.max(130, Math.round((calories - protein * 4 - fat * 9) / 4));
  const trainingWater = sessionMinutes >= 75 ? 0.5 : 0.35;

  return {
    calories,
    protein,
    fat,
    carbs,
    water: Math.max(2.1, Math.round((weight * 0.035 + trainingWater) * 10) / 10),
    sessions,
    sessionMinutes,
    sleepGoal,
  };
}

function getTargetPlan(profile) {
  const weight = numberValue(profile.weight, 78);
  const target = Number(profile.targetWeight);
  const dateValue = profile.targetDate ? new Date(`${profile.targetDate}T12:00:00`) : null;
  const today = new Date();
  const hasTarget = Number.isFinite(target) && target > 0;
  const daysLeft =
    dateValue && dateValue > today
      ? Math.max(1, Math.ceil((dateValue - today) / 86400000))
      : null;
  const delta = hasTarget ? Math.round((target - weight) * 10) / 10 : 0;
  const weeklyPace = hasTarget && daysLeft ? Math.abs(delta) / (daysLeft / 7) : null;

  return {
    hasTarget,
    target,
    delta,
    daysLeft,
    weeklyPace,
    direction: delta < 0 ? "снизить" : delta > 0 ? "набрать" : "удержать",
  };
}

function getReadiness(profile) {
  const last = state.feedback.at(-1);
  const sleepGoal = numberValue(profile.sleepGoal, 8);
  const stressPenalty = profile.stressLevel === "Высокий" ? 12 : profile.stressLevel === "Низкий" ? -4 : 4;
  const effortPenalty = last?.effort === "hard" ? 14 : last?.effort === "easy" ? -6 : 3;
  const energy = numberValue(last?.energy, 7);
  const score = Math.max(42, Math.min(96, Math.round(68 + energy * 3 - stressPenalty - effortPenalty + (sleepGoal >= 8 ? 4 : 0))));
  const label = score >= 82 ? "можно прогрессировать" : score >= 64 ? "держим план" : "лучше снизить объем";

  return { score, label, last };
}

function getMealTiming(profile) {
  const count = numberValue(profile.mealCount, 4);
  const fourMeals = [
    ["Завтрак", "08:00"],
    ["Обед", "13:00"],
    ["Перекус", "16:30"],
    ["Ужин", "20:00"],
  ];
  if (count <= 3) return fourMeals.filter((meal) => meal[0] !== "Перекус");
  if (count >= 5) return [...fourMeals, ["Поздний белок", "21:30"]];
  return fourMeals;
}

function getDailyFocus(profile, plan, readiness) {
  if (profile.injuries.trim()) return "Техника и контроль боли";
  if (readiness.score < 64) return "Восстановление и легкий объем";
  if (profile.goal === "Похудение") return `Держать ${plan.protein} г белка и шаги`;
  if (profile.goal === "Набор массы") return `Добрать ${plan.calories} ккал без пропусков`;
  if (profile.goal === "Выносливость") return "Пульс, дыхание и ровный темп";
  if (profile.goal === "Сила") return "Качество рабочих подходов";
  return "Ровный день без провалов";
}

function getTodayEaten() {
  const key = todayKey();
  return state.eaten.filter((entry) => entry.date === key);
}

function nutritionTotals(entries = getTodayEaten()) {
  return entries.reduce(
    (totals, entry) => ({
      calories: totals.calories + macroValue(entry.calories),
      protein: totals.protein + macroValue(entry.protein),
      fat: totals.fat + macroValue(entry.fat),
      carbs: totals.carbs + macroValue(entry.carbs),
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0 },
  );
}

function nutritionRemaining(plan, totals = nutritionTotals()) {
  return {
    calories: Math.max(0, Math.round(plan.calories - totals.calories)),
    protein: Math.max(0, Math.round(plan.protein - totals.protein)),
    fat: Math.max(0, Math.round(plan.fat - totals.fat)),
    carbs: Math.max(0, Math.round(plan.carbs - totals.carbs)),
  };
}

function mealData(key, title, share, plan) {
  return {
    mealKey: key,
    mealTitle: title,
    name: `${title}: вариант приложения`,
    calories: Math.round((plan.calories * share) / 10) * 10,
    protein: Math.round(plan.protein * share),
    fat: Math.round(plan.fat * share),
    carbs: Math.round(plan.carbs * share),
    ingredients: mealTemplates[key],
  };
}

function isSuggestedMealLogged(key) {
  return getTodayEaten().some((entry) => entry.source === "suggested" && entry.mealKey === key);
}

function saveEatenEntry(entry) {
  state.eaten = [
    ...state.eaten,
    {
      id: createId(),
      date: todayKey(),
      createdAt: new Date().toISOString(),
      ...entry,
    },
  ].slice(-120);
  writeStorage(EATEN_KEY, state.eaten);
}

function getTodayWorkoutLog() {
  const key = todayKey();
  return state.workoutLog.filter((entry) => entry.date === key);
}

function workoutTotals(entries = getTodayWorkoutLog()) {
  return entries.reduce(
    (totals, entry) => {
      const sets = macroValue(entry.sets);
      const reps = macroValue(entry.reps);
      const weight = macroValue(entry.weight);
      const minutes = macroValue(entry.minutes);
      return {
        exercises: totals.exercises + 1,
        sets: totals.sets + sets,
        reps: totals.reps + sets * reps,
        volume: totals.volume + sets * reps * weight,
        minutes: totals.minutes + minutes,
      };
    },
    { exercises: 0, sets: 0, reps: 0, volume: 0, minutes: 0 },
  );
}

function saveWorkoutEntry(entry) {
  state.workoutLog = [
    ...state.workoutLog,
    {
      id: createId(),
      date: todayKey(),
      createdAt: new Date().toISOString(),
      ...entry,
    },
  ].slice(-160);
  writeStorage(WORKOUT_LOG_KEY, state.workoutLog);
}

function parseWorkoutTarget(target = "") {
  const text = String(target);
  const setsMatch = text.match(/(\d+)\s*x\s*(\d+)/i);
  const minutesMatch = text.match(/(\d+)\s*мин/i);
  const secondsMatch = text.match(/(\d+)\s*сек/i);
  return {
    sets: setsMatch ? setsMatch[1] : "",
    reps: setsMatch ? setsMatch[2] : "",
    minutes: minutesMatch ? minutesMatch[1] : secondsMatch ? Math.ceil(Number(secondsMatch[1]) / 60) : "",
  };
}

function isWorkoutItemLogged(name) {
  return getTodayWorkoutLog().some((entry) => entry.source === "planned" && entry.name === name);
}

function sortedProgressEntries() {
  return [...state.progress].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function getTodayProgress() {
  return state.progress.find((entry) => entry.date === todayKey()) || null;
}

function saveProgressEntry(entry) {
  const cleanEntry = {
    date: entry.date || todayKey(),
    weight: macroValue(entry.weight),
    waist: macroValue(entry.waist),
    sleep: macroValue(entry.sleep),
    water: macroValue(entry.water),
    steps: Math.round(macroValue(entry.steps)),
    energy: macroValue(entry.energy),
    mood: entry.mood || "Нормально",
    note: entry.note || "",
    updatedAt: new Date().toISOString(),
  };

  state.progress = [
    cleanEntry,
    ...state.progress.filter((item) => item.date !== cleanEntry.date),
  ]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 180);
  writeStorage(PROGRESS_KEY, state.progress);
}

function progressStats(profile = currentProfile()) {
  const entries = sortedProgressEntries();
  const latest = entries[0] || null;
  const previousWeight = entries.find((entry) => entry.weight && latest?.weight && entry.date !== latest.date);
  const weightNow = latest?.weight || numberValue(profile.weight, 0);
  const weightDelta =
    latest?.weight && previousWeight?.weight
      ? Math.round((latest.weight - previousWeight.weight) * 10) / 10
      : 0;
  const week = entries.slice(0, 7);
  const avgSleep = averageOf(week, "sleep");
  const avgSteps = averageOf(week, "steps");
  const avgEnergy = averageOf(week, "energy");

  return {
    entries,
    latest,
    week,
    weightNow,
    weightDelta,
    avgSleep,
    avgSteps,
    avgEnergy,
    streak: currentProgressStreak(entries),
  };
}

function averageOf(entries, key) {
  const values = entries.map((entry) => Number(entry[key])).filter((value) => Number.isFinite(value) && value > 0);
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function currentProgressStreak(entries) {
  const dates = new Set(entries.map((entry) => entry.date));
  let streak = 0;
  const cursor = new Date(`${todayKey()}T12:00:00`);
  while (dates.has(todayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function recentDateKeys(count = 7) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(`${todayKey()}T12:00:00`);
    date.setDate(date.getDate() - (count - index - 1));
    return todayKey(date);
  });
}

function nutritionTotalsForDate(date) {
  return nutritionTotals(state.eaten.filter((entry) => entry.date === date));
}

function workoutTotalsForDate(date) {
  return workoutTotals(state.workoutLog.filter((entry) => entry.date === date));
}

function weeklyReport(profile = currentProfile()) {
  const plan = estimatePlan(profile);
  const dates = recentDateKeys(7);
  const days = dates.map((date) => {
    const eaten = state.eaten.filter((entry) => entry.date === date);
    const workouts = state.workoutLog.filter((entry) => entry.date === date);
    const progress = state.progress.find((entry) => entry.date === date) || null;
    return {
      date,
      eaten,
      workouts,
      progress,
      nutrition: nutritionTotals(eaten),
      workout: workoutTotals(workouts),
    };
  });

  const nutritionDays = days.filter((day) => day.eaten.length).length;
  const trainingDays = days.filter((day) => day.workouts.length).length;
  const progressDays = days.filter((day) => day.progress).length;
  const avgCalories = averageRaw(days.filter((day) => day.eaten.length).map((day) => day.nutrition.calories));
  const avgProtein = averageRaw(days.filter((day) => day.eaten.length).map((day) => day.nutrition.protein));
  const avgSleep = averageRaw(days.filter((day) => day.progress?.sleep).map((day) => day.progress.sleep));
  const avgEnergy = averageRaw(days.filter((day) => day.progress?.energy).map((day) => day.progress.energy));
  const totalSets = days.reduce((sum, day) => sum + day.workout.sets, 0);
  const totalVolume = days.reduce((sum, day) => sum + day.workout.volume, 0);
  const targetTrainingDays = Math.min(7, numberValue(profile.sessions, 4));
  const scoreParts = [
    nutritionDays ? clamp((avgProtein / plan.protein) * 100, 0, 110) : 0,
    clamp((trainingDays / targetTrainingDays) * 100, 0, 100),
    progressDays ? clamp((progressDays / 7) * 100, 0, 100) : 0,
    avgSleep ? clamp((avgSleep / plan.sleepGoal) * 100, 0, 105) : 0,
  ];
  const score = Math.round(averageRaw(scoreParts));

  return {
    plan,
    days,
    nutritionDays,
    trainingDays,
    progressDays,
    avgCalories,
    avgProtein,
    avgSleep,
    avgEnergy,
    totalSets,
    totalVolume,
    targetTrainingDays,
    score,
  };
}

function averageRaw(values) {
  const clean = values.filter((value) => Number.isFinite(Number(value)));
  if (!clean.length) return 0;
  return clean.reduce((sum, value) => sum + Number(value), 0) / clean.length;
}

function weeklyActions(report, profile = currentProfile()) {
  const actions = [];
  if (report.nutritionDays < 3) {
    actions.push(["Питание", "Отмечай еду хотя бы 3 дня подряд, иначе приложение видит слишком мало данных."]);
  } else if (report.avgProtein < report.plan.protein * 0.85) {
    actions.push(["Питание", `Белка маловато: среднее ${Math.round(report.avgProtein)} г при цели ${report.plan.protein} г. Добавь белок в завтрак или перекус.`]);
  } else if (report.avgCalories > report.plan.calories * 1.15 && profile.goal === "Похудение") {
    actions.push(["Питание", "Калории выше цели для похудения. Начни с контроля перекусов и напитков."]);
  } else {
    actions.push(["Питание", "Питание выглядит ровно. Следующий шаг — чаще отмечать продукты дома и свои блюда."]);
  }

  if (report.trainingDays < report.targetTrainingDays) {
    actions.push(["Тренировки", `За 7 дней закрыто ${report.trainingDays}/${report.targetTrainingDays} тренировочных дней. Лучше добрать частоту, чем резко повышать объем.`]);
  } else if (report.totalSets > 0 && report.avgSleep && report.avgSleep < report.plan.sleepGoal - 0.75) {
    actions.push(["Тренировки", "Объем есть, но сон проседает. Не повышай нагрузку, пока сон не станет стабильнее."]);
  } else {
    actions.push(["Тренировки", "Частота выглядит хорошо. Можно аккуратно прогрессировать по весу или повторам."]);
  }

  if (!report.avgSleep) {
    actions.push(["Восстановление", "Добавь чек-ины сна: без них трудно понять, когда увеличивать объем."]);
  } else if (report.avgSleep < report.plan.sleepGoal - 0.5) {
    actions.push(["Восстановление", `Средний сон ${compactNumber(report.avgSleep)} ч. Цель — приблизиться к ${compactNumber(report.plan.sleepGoal)} ч.`]);
  } else if (report.avgEnergy && report.avgEnergy < 6) {
    actions.push(["Восстановление", "Энергия низкая. Проверь сон, воду и слишком тяжелые тренировки подряд."]);
  } else {
    actions.push(["Восстановление", "Восстановление выглядит рабочим. Держи чек-ин ежедневно, чтобы не пропустить спад."]);
  }

  if (report.progressDays < 3) {
    actions.push(["Прогресс", "Добавь больше чек-инов веса и талии, чтобы видеть тренд, а не случайные колебания."]);
  } else {
    actions.push(["Прогресс", "Данных уже достаточно для первых выводов. Сравнивай 7-дневную картину, а не один день."]);
  }

  return actions;
}

function dateFromKey(key) {
  return new Date(`${key}T12:00:00`);
}

function dayNameFromDate(date) {
  return ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"][date.getDay()];
}

function parseTrainingWeekdays(text = "") {
  const normalized = String(text).toLowerCase();
  const map = [
    ["пн", 1],
    ["вт", 2],
    ["ср", 3],
    ["чт", 4],
    ["пт", 5],
    ["сб", 6],
    ["вс", 0],
  ];
  const found = map.filter(([label]) => normalized.includes(label)).map(([, index]) => index);
  return found.length ? found : [1, 3, 5];
}

function calendarNoteFor(date) {
  return state.calendarNotes.find((note) => note.date === date) || null;
}

function saveCalendarNote(entry) {
  const date = entry.date || todayKey();
  const note = {
    date,
    title: entry.title || "",
    note: entry.note || "",
    updatedAt: new Date().toISOString(),
  };
  state.calendarNotes = [
    note,
    ...state.calendarNotes.filter((item) => item.date !== date),
  ].slice(0, 120);
  writeStorage(CALENDAR_KEY, state.calendarNotes);
}

function buildCalendarDays(profile = currentProfile()) {
  const trainingWeekdays = parseTrainingWeekdays(profile.trainingDays);
  const workout = getTodayWorkout(profile);
  return Array.from({ length: 28 }, (_, index) => {
    const date = new Date(`${todayKey()}T12:00:00`);
    date.setDate(date.getDate() + index);
    const key = todayKey(date);
    const isTraining = trainingWeekdays.includes(date.getDay());
    const workoutEntries = state.workoutLog.filter((entry) => entry.date === key);
    const eatenEntries = state.eaten.filter((entry) => entry.date === key);
    const progressEntry = state.progress.find((entry) => entry.date === key);
    const note = calendarNoteFor(key);
    return {
      date: key,
      dayName: dayNameFromDate(date),
      dayNumber: date.getDate(),
      weekIndex: Math.floor(index / 7) + 1,
      isToday: key === todayKey(),
      isTraining,
      title: isTraining ? workout.type : "Восстановление",
      focus: isTraining ? calendarTrainingFocus(profile, index) : calendarRecoveryFocus(profile, index),
      workoutEntries,
      eatenEntries,
      progressEntry,
      note,
    };
  });
}

function calendarTrainingFocus(profile, index) {
  if (profile.sport === "Бег") return index % 2 === 0 ? "легкий бег" : "интервалы";
  if (profile.goal === "Выносливость") return "круговая работа";
  if (profile.goal === "Сила") return index % 2 === 0 ? "база + техника" : "верх тела";
  return index % 2 === 0 ? "основная тренировка" : "объем";
}

function calendarRecoveryFocus(profile, index) {
  if (index % 7 === 6) return "полный отдых";
  if (profile.injuries.trim()) return "мобилити и контроль боли";
  return "шаги, сон, вода";
}

function calendarStats(days) {
  return {
    training: days.filter((day) => day.isTraining).length,
    recovery: days.filter((day) => !day.isTraining).length,
    loggedWorkouts: days.filter((day) => day.workoutEntries.length).length,
    notes: days.filter((day) => day.note?.title || day.note?.note).length,
  };
}

function onboardingTemplate() {
  const profile = currentProfile();

  return `
    <main class="onboarding-layout">
      <section class="visual-panel" aria-label="Концепция Athlete Assistant">
        <div class="brand-lockup">
          <span class="brand-mark">${icons.training}</span>
          <span>Athlete Assistant</span>
        </div>

        <div class="visual-content">
          <div>
            <p class="section-kicker">Персональный старт</p>
            <h1>Личный план в одной ссылке</h1>
          </div>
          <p>Собери профиль, цель, питание и тренировочный ритм, чтобы каждый день видеть понятный план действий.</p>
          ${trackVisual()}
        </div>

        <div class="mini-metrics" aria-label="Пример показателей">
          <div class="mini-metric"><strong>цель</strong><span>вес и дата</span></div>
          <div class="mini-metric"><strong>план</strong><span>еда и тренировки</span></div>
          <div class="mini-metric"><strong>фидбек</strong><span>нагрузка и восстановление</span></div>
        </div>
      </section>

      <section class="form-panel">
        <div class="form-wrap">
          <p class="section-kicker">Стартовая анкета</p>
          <h2>Соберем профиль спортсмена</h2>
          <p>Чем точнее вводные, тем полезнее главный экран, питание и тренировочный план.</p>

          <form class="onboarding-card" id="profileForm">
            ${formSection(
              "Личные данные",
              `${field("name", "Имя", "text", profile.name, "Андрей", "required")}
              ${field("age", "Возраст", "number", profile.age, "28", "min='12' max='90'")}
              ${selectField("sex", "Пол", [["male", "Мужской"], ["female", "Женский"]], profile.sex)}
              ${field("city", "Город", "text", profile.city, "Киев")}
              ${field("height", "Рост, см", "number", profile.height, "180", "min='120' max='230'")}
              ${field("weight", "Текущий вес, кг", "number", profile.weight, "78", "min='35' max='220' step='0.1'")}`,
            )}

            ${formSection(
              "Цель",
              `${selectField("goal", "Основная цель", ["Похудение", "Набор массы", "Выносливость", "Сила", "Поддержание формы"], profile.goal)}
              ${field("targetWeight", "Желаемый вес, кг", "number", profile.targetWeight, "75", "min='35' max='220' step='0.1'")}
              ${field("targetDate", "Дата цели", "date", profile.targetDate, "", "")}
              ${selectField("priority", "Главный приоритет", ["Баланс формы и здоровья", "Быстрее увидеть результат", "Безопасное восстановление", "Спортивная форма к событию"], profile.priority)}
              ${selectField("level", "Уровень", ["Начинающий", "Средний", "Продвинутый"], profile.level)}
              ${selectField("experience", "Опыт тренировок", ["До 3 месяцев", "3-6 месяцев", "6-12 месяцев", "1-3 года", "3+ года"], profile.experience)}`,
            )}

            ${formSection(
              "Питание",
              `${selectField("mealCount", "Приемов пищи в день", ["3", "4", "5"], profile.mealCount)}
              ${selectField("budget", "Бюджет питания", ["Эконом", "Средний", "Свободный"], profile.budget)}
              ${selectField("dietType", "Тип питания", ["Без ограничений", "Без свинины", "Вегетарианское", "Без лактозы", "Низкоуглеводное"], profile.dietType)}
              ${textareaField("favoriteFoods", "Любимые продукты", profile.favoriteFoods, "яйца, рис, курица, творог")}
              ${textareaField("avoidFoods", "Не ем / аллергии", profile.avoidFoods, "арахис, молоко, морепродукты")}
              ${textareaField("availableProducts", "Что есть дома", profile.availableProducts, "овсянка, яйца, гречка, бананы")}`,
            )}

            ${formSection(
              "Тренировки",
              `${selectField("sport", "Вид спорта", ["Тренажерный зал", "Бег", "Футбол", "Бокс", "Плавание", "Кроссфит", "Другое"], profile.sport)}
              ${field("sessions", "Тренировок в неделю", "number", profile.sessions, "4", "min='1' max='10'")}
              ${field("sessionMinutes", "Длительность, мин", "number", profile.sessionMinutes, "60", "min='20' max='180'")}
              ${field("trainingDays", "Дни тренировок", "text", profile.trainingDays, "Пн, Ср, Пт, Сб")}
              ${selectField("equipment", "Инвентарь", ["Тренажерный зал", "Дом: гантели", "Дом: без инвентаря", "Улица / стадион", "Смешанный"], profile.equipment)}
              ${textareaField("injuries", "Травмы и ограничения", profile.injuries, "беречь колено, плечо не перегружать")}`,
            )}

            ${formSection(
              "Восстановление",
              `${field("sleepGoal", "Цель сна, часов", "number", profile.sleepGoal, "8", "min='5' max='12' step='0.5'")}
              ${selectField("stressLevel", "Стресс", ["Низкий", "Средний", "Высокий"], profile.stressLevel)}
              ${textareaField("foodNotes", "Комментарий по питанию", profile.foodNotes, "люблю простые блюда, хочу меньше сладкого")}
              ${textareaField("trainingNotes", "Комментарий по тренировкам", profile.trainingNotes, "хочу подтянуть технику приседа")}`,
            )}

            <div class="form-actions">
              <span class="caption">Анкету можно изменить в любой момент.</span>
              <button class="button button-primary" type="submit">Сохранить и открыть</button>
            </div>
          </form>
        </div>
      </section>
    </main>
  `;
}

function field(name, label, type, value, placeholder, attrs = "") {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <input name="${escapeHtml(name)}" type="${escapeHtml(type)}" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" ${attrs} />
    </label>
  `;
}

function selectField(name, label, options, value) {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <select name="${escapeHtml(name)}">
        ${optionList(options, value)}
      </select>
    </label>
  `;
}

function textareaField(name, label, value, placeholder) {
  return `
    <label class="field field-wide">
      <span>${escapeHtml(label)}</span>
      <textarea name="${escapeHtml(name)}" placeholder="${escapeHtml(placeholder)}">${escapeHtml(value || "")}</textarea>
    </label>
  `;
}

function formSection(title, content) {
  return `
    <section class="form-section">
      <h3>${escapeHtml(title)}</h3>
      <div class="form-grid">${content}</div>
    </section>
  `;
}

function trackVisual() {
  return `
    <svg class="track-visual" viewBox="0 0 620 376" role="img" aria-label="Схема прогресса спортсмена">
      <defs>
        <linearGradient id="trackGlow" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.24" />
          <stop offset="100%" stop-color="#20a67a" stop-opacity="0.68" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="618" height="374" rx="26" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.16)" />
      <path d="M96 264c66-100 142-146 228-138 78 7 133 57 202-16" stroke="url(#trackGlow)" stroke-width="20" fill="none" stroke-linecap="round" />
      <path d="M96 264c66-100 142-146 228-138 78 7 133 57 202-16" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7" />
      <circle cx="96" cy="264" r="16" fill="#f2b84b" />
      <circle cx="314" cy="126" r="16" fill="#20a67a" />
      <circle cx="526" cy="110" r="16" fill="#ffffff" />
      <g fill="rgba(255,255,255,.82)">
        <rect x="92" y="308" width="130" height="10" rx="5" />
        <rect x="260" y="70" width="96" height="10" rx="5" />
        <rect x="440" y="156" width="110" height="10" rx="5" />
      </g>
      <g stroke="rgba(255,255,255,.18)" stroke-width="2">
        <path d="M80 42h470" />
        <path d="M80 104h470" />
        <path d="M80 166h470" />
        <path d="M80 228h470" />
        <path d="M80 290h470" />
      </g>
    </svg>
  `;
}

function appTemplate() {
  const profile = currentProfile();
  const nav = [
    ["dashboard", "Главная", icons.dashboard],
    ["meals", "Питание", icons.meals],
    ["training", "Тренировки", icons.training],
    ["calendar", "Календарь", icons.calendar],
    ["progress", "Прогресс", icons.progress],
    ["advice", "Рекомендации", icons.advice],
    ["profile", "Анкета", icons.profile],
  ];

  return `
    <div class="workspace">
      <aside class="sidebar">
        <div class="brand-lockup" style="color: var(--ink)">
          <span class="brand-mark" style="border-color: var(--line); background: #fff">${icons.training}</span>
          <span>Athlete Assistant</span>
        </div>

        <div class="profile-chip">
          <div class="avatar">${escapeHtml(getInitials(profile.name))}</div>
          <div>
            <strong>${escapeHtml(profile.name || "Спортсмен")}</strong>
            <span>${escapeHtml(profile.goal)} · ${escapeHtml(profile.level)}</span>
          </div>
        </div>

        <nav class="nav-list" aria-label="Разделы приложения">
          ${nav
            .map(
              ([id, label, icon]) => `
                <button class="nav-button ${state.view === id ? "is-active" : ""}" data-view="${id}" type="button">
                  <span class="nav-icon">${icon}</span>
                  <span>${label}</span>
                </button>
              `,
            )
            .join("")}
        </nav>
      </aside>

      <main class="main">
        ${renderView()}
      </main>
    </div>
  `;
}

function renderView() {
  if (state.view === "meals") return mealsView();
  if (state.view === "training") return trainingView();
  if (state.view === "calendar") return calendarView();
  if (state.view === "progress") return progressView();
  if (state.view === "advice") return adviceView();
  if (state.view === "profile") return profileView();
  return dashboardView();
}

function dashboardView() {
  const profile = currentProfile();
  const plan = estimatePlan(profile);
  const target = getTargetPlan(profile);
  const readiness = getReadiness(profile);
  const progress = progressStats(profile);
  const eaten = getTodayEaten();
  const totals = nutritionTotals(eaten);
  const remaining = nutritionRemaining(plan, totals);
  const focus = getDailyFocus(profile, plan, readiness);
  const workout = getTodayWorkout(profile);
  const workoutLog = getTodayWorkoutLog();
  const workoutDone = workout.items.filter(([name]) => isWorkoutItemLogged(name)).length;
  const weatherText = profile.city
    ? `Перед выходом в ${escapeHtml(profile.city)} проверь температуру, ветер и покрытие.`
    : "Перед уличной тренировкой проверь температуру, ветер и покрытие.";

  return `
    <section class="topbar">
      <div>
        <p class="section-kicker">Сегодня</p>
        <h1>${greeting()}, ${escapeHtml(profile.name || "спортсмен")}</h1>
        <p>${escapeHtml(profile.goal)} · ${escapeHtml(profile.sport)} · ${plan.sessions} тренировки в неделю · ${plan.sessionMinutes} мин</p>
      </div>
      <div class="toolbar">
        <button class="button button-ghost" data-view-jump="calendar" type="button">Календарь</button>
        <button class="button button-ghost" data-view-jump="progress" type="button">Прогресс</button>
        <button class="button button-ghost" data-view-jump="meals" type="button">Питание</button>
        <button class="button button-primary" data-view-jump="training" type="button">Тренировка</button>
      </div>
    </section>

    <section class="daily-hero">
      <div class="panel hero-panel">
        <div>
          <span class="pill">фокус дня</span>
          <h2>${escapeHtml(focus)}</h2>
          <p>${dailyFocusText(profile, target, readiness)}</p>
        </div>
        <div class="hero-actions">
          <button class="button button-primary" data-view-jump="training" type="button">Начать план</button>
          <button class="button button-ghost" data-view-jump="profile" type="button">Изменить анкету</button>
        </div>
      </div>

      <div class="panel readiness-panel">
        <div class="readiness-ring" style="--score: ${readiness.score}">
          <strong>${readiness.score}</strong>
          <span>готовность</span>
        </div>
        <div>
          <h2>${escapeHtml(readiness.label)}</h2>
          <p>${readinessText(readiness)}</p>
        </div>
      </div>
    </section>

    <section class="metric-grid metric-grid-wide">
      ${metricBox("Калории", `${remaining.calories}`, `осталось из ${plan.calories} ккал`, clamp(Math.round((totals.calories / plan.calories) * 100), 0, 100))}
      ${metricBox("Белок", `${remaining.protein} г`, `добрать до ${plan.protein} г`, clamp(Math.round((totals.protein / plan.protein) * 100), 0, 100))}
      ${metricBox("Вода", `${compactNumber(plan.water)} л`, "цель на день", 68)}
      ${metricBox("Сон", `${compactNumber(plan.sleepGoal)} ч`, "цель восстановления", Math.min(100, Math.round((plan.sleepGoal / 9) * 100)))}
    </section>

    <section class="dashboard-grid">
      <div class="panel">
        <div class="panel-header">
          <div>
            <h2>Путь к цели</h2>
            <p class="caption">${goalCaption(target)}</p>
          </div>
          <span class="pill">${escapeHtml(target.direction)}</span>
        </div>
        <div class="goal-grid">
          <div><span>Сейчас</span><strong>${compactNumber(profile.weight)} кг</strong></div>
          <div><span>Цель</span><strong>${target.hasTarget ? `${compactNumber(target.target)} кг` : "не задано"}</strong></div>
          <div><span>Срок</span><strong>${target.daysLeft ? `${target.daysLeft} дн.` : "свободно"}</strong></div>
          <div><span>Темп</span><strong>${target.weeklyPace ? `${compactNumber(target.weeklyPace)} кг/нед` : "мягкий"}</strong></div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>Тренировка по плану</h2>
          <span class="pill">${workoutDone}/${workout.items.length}</span>
        </div>
        <ul class="today-list">
          ${workout.items
            .map((item) => {
              const done = isWorkoutItemLogged(item[0]);
              return `<li><span>${done ? "✓ " : ""}${escapeHtml(item[0])}</span><strong>${escapeHtml(item[1])}</strong></li>`;
            })
            .join("")}
        </ul>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>Питание по времени</h2>
          <span class="pill">${escapeHtml(profile.mealCount)} приема</span>
        </div>
        <ul class="clean-list">
          ${getMealTiming(profile)
            .map(([name, time]) => `<li><span>${escapeHtml(name)}</span><strong>${escapeHtml(time)}</strong></li>`)
            .join("")}
        </ul>
      </div>

      <div class="panel">
        <div class="panel-header">
          <div>
            <h2>Прогресс</h2>
            <p class="caption">${progress.latest ? `Последний чек-ин: ${progress.latest.date}` : "Добавь первый чек-ин веса и восстановления."}</p>
          </div>
          <span class="pill">${progress.streak} дн.</span>
        </div>
        <ul class="clean-list">
          <li><span>Вес сейчас</span><strong>${compactNumber(progress.weightNow)} кг</strong></li>
          <li><span>Изменение</span><strong>${weightDeltaText(progress.weightDelta)}</strong></li>
          <li><span>Средний сон</span><strong>${compactNumber(progress.avgSleep)} ч</strong></li>
        </ul>
      </div>

      <div class="panel">
        <div class="panel-header">
          <h2>Ближайшие действия</h2>
          <span class="pill">${workoutLog.length} упражн.</span>
        </div>
        <ul class="clean-list">
          ${dailyActions(profile, plan, workout, remaining, workoutDone)
            .map(([label, value]) => `<li><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></li>`)
            .join("")}
        </ul>
      </div>

      <div class="panel full-span">
        <div class="soft-band">
          <strong>Внешние условия</strong>
          <span>${weatherText} Для высокой нагрузки держи запас воды и план заминки.</span>
        </div>
      </div>
    </section>
  `;
}

function dailyFocusText(profile, target, readiness) {
  if (profile.injuries.trim()) {
    return `Ограничения: ${escapeHtml(profile.injuries)}. Сегодня важнее контроль техники, чем рекорды.`;
  }
  if (target.weeklyPace && target.weeklyPace > 0.9) {
    return "Темп цели высокий. Держи питание ровно и не повышай объем тренировки без хорошего восстановления.";
  }
  if (readiness.score < 64) {
    return "Снизь интенсивность, сделай качественную разминку и закрой тренировку без лишнего добивания.";
  }
  return `${escapeHtml(profile.priority)}. План дня собран под текущую цель и недельную нагрузку.`;
}

function readinessText(readiness) {
  if (!readiness.last) return "Первый фидбек после тренировки сделает оценку точнее.";
  if (readiness.last.effort === "hard") return "Последняя тренировка была тяжелой: сегодня держи запас по технике.";
  if (readiness.last.effort === "easy") return "Последняя тренировка прошла легко: можно аккуратно добавить объем.";
  return "Последняя тренировка прошла ровно: оставляем рабочий план.";
}

function goalCaption(target) {
  if (!target.hasTarget) return "Добавь желаемый вес и дату в анкете, чтобы видеть темп.";
  if (!target.daysLeft) return "Цель по весу задана без жесткого срока.";
  const pace = target.weeklyPace ? compactNumber(target.weeklyPace) : "0";
  return `${target.daysLeft} дней до цели, ориентир ${pace} кг в неделю.`;
}

function dailyActions(profile, plan, workout, remaining = nutritionRemaining(plan), workoutDone = 0) {
  const actions = [
    ["Добрать калории", `${remaining.calories} ккал`],
    ["Белок до конца дня", `${remaining.protein} г`],
    ["Разминка перед нагрузкой", "10 мин"],
    ["Закрыть упражнения", `${workoutDone}/${workout.items.length}`],
  ];

  if (profile.availableProducts.trim()) {
    actions[0] = ["Собрать еду из продуктов", profile.availableProducts.split(",").slice(0, 2).join(", ")];
  }

  if (workout.type === "Бег") {
    actions[2] = ["Разминка + ускорения", "12 мин"];
  }

  return actions;
}

function metricBox(label, value, hint, progress) {
  return `
    <div class="metric-box">
      <span>${label}</span>
      <strong>${value}</strong>
      <span>${hint}</span>
      <div class="progress-track"><i style="width: ${progress}%"></i></div>
    </div>
  `;
}

function mealsView() {
  const profile = currentProfile();
  const plan = estimatePlan(profile);
  const eaten = getTodayEaten();
  const totals = nutritionTotals(eaten);
  const remaining = nutritionRemaining(plan, totals);
  const meals = [
    ["breakfast", "Завтрак", 0.26],
    ["lunch", "Обед", 0.34],
    ["snack", "Перекус", 0.14],
    ["dinner", "Ужин", 0.26],
  ];

  return `
    <section class="topbar">
      <div>
        <p class="section-kicker">Генерация еды</p>
        <h1>Питание под цель</h1>
        <p>${escapeHtml(profile.dietType)} · ${escapeHtml(profile.budget)} бюджет · дневная цель ${plan.calories} ккал.</p>
      </div>
      <div class="toolbar">
        <button class="button button-ghost" id="clearEatenDay" type="button">Очистить день</button>
        <button class="button button-primary" id="shuffleMeals" type="button">Обновить варианты</button>
      </div>
    </section>

    <section class="panel nutrition-summary">
      <div class="panel-header">
        <div>
          <h2>Съедено сегодня</h2>
          <p class="caption">${todayKey()} · ${eaten.length} записей</p>
        </div>
        <span class="pill">${remaining.calories} ккал осталось</span>
      </div>
      <div class="metric-grid">
        ${metricBox("Калории", `${Math.round(totals.calories)}`, `из ${plan.calories} ккал`, clamp(Math.round((totals.calories / plan.calories) * 100), 0, 100))}
        ${metricBox("Белок", `${Math.round(totals.protein)} г`, `из ${plan.protein} г`, clamp(Math.round((totals.protein / plan.protein) * 100), 0, 100))}
        ${metricBox("Жиры", `${Math.round(totals.fat)} г`, `из ${plan.fat} г`, clamp(Math.round((totals.fat / plan.fat) * 100), 0, 100))}
        ${metricBox("Углеводы", `${Math.round(totals.carbs)} г`, `из ${plan.carbs} г`, clamp(Math.round((totals.carbs / plan.carbs) * 100), 0, 100))}
      </div>
    </section>

    <section class="meal-grid">
      ${meals.map(([key, title, share]) => mealCard(key, title, share, plan)).join("")}
    </section>

    <section class="meal-tools-grid">
      ${customMealForm()}
      ${eatenLog(eaten)}
    </section>
  `;
}

function mealCard(key, title, share, plan) {
  const profile = currentProfile();
  const meal = mealData(key, title, share, plan);
  const logged = isSuggestedMealLogged(key);

  return `
    <article class="meal-card">
      <div class="meal-head">
        <div>
          <h3>${escapeHtml(title)}</h3>
          <p>${meal.calories} ккал · вариант на сегодня</p>
        </div>
        <span class="pill">${escapeHtml(profile.budget)}</span>
      </div>
      <div class="macro-row">
        <span><b>${meal.protein} г</b> белок</span>
        <span><b>${meal.fat} г</b> жиры</span>
        <span><b>${meal.carbs} г</b> углеводы</span>
      </div>
      <ul class="ingredient-list">
        ${meal.ingredients.map(([name, amount]) => `<li><span>${escapeHtml(name)}</span><strong>${escapeHtml(amount)}</strong></li>`).join("")}
      </ul>
      <p>${mealAdvice(key)}</p>
      <button class="button ${logged ? "button-ghost" : "button-primary"} meal-log-button" data-log-suggested="${escapeHtml(key)}" type="button" ${logged ? "disabled" : ""}>
        ${logged ? "Уже отмечено" : "Съел этот вариант"}
      </button>
    </article>
  `;
}

function mealAdvice(key) {
  const profile = currentProfile();
  const notes = profile.foodNotes?.trim();
  const avoid = profile.avoidFoods?.trim();
  const available = profile.availableProducts?.trim();
  const base = {
    breakfast: "Если тренировка утром, оставь часть углеводов до занятия и часть после.",
    lunch: "Основной прием пищи держим плотным: белок, крупа и овощи.",
    snack: "Перекус нужен, чтобы не провалиться по белку и энергии.",
    dinner: "Вечером делаем упор на восстановление, белок и спокойные углеводы.",
  }[key];

  const extras = [];
  if (available) extras.push(`используй дома: ${escapeHtml(available)}`);
  if (avoid) extras.push(`исключи: ${escapeHtml(avoid)}`);
  if (notes) extras.push(`учесть: ${escapeHtml(notes)}`);

  return extras.length ? `${base} ${extras.join("; ")}.` : base;
}

function customMealForm() {
  return `
    <section class="panel custom-meal-panel">
      <div class="panel-header">
        <div>
          <h2>Свой вариант</h2>
          <p class="caption">Запиши то, что съел вне предложенных блюд.</p>
        </div>
        <span class="pill">ручной ввод</span>
      </div>
      <form id="customMealForm" class="custom-meal-form">
        <label class="field">
          <span>Прием пищи</span>
          <select name="mealTitle">
            ${optionList(["Завтрак", "Обед", "Перекус", "Ужин", "Поздний белок"], "Обед")}
          </select>
        </label>
        <label class="field">
          <span>Название</span>
          <input name="name" type="text" placeholder="например: омлет с сыром" required />
        </label>
        <label class="field">
          <span>Калории</span>
          <input name="calories" type="number" min="0" step="1" placeholder="520" required />
        </label>
        <label class="field">
          <span>Белки, г</span>
          <input name="protein" type="number" min="0" step="0.1" placeholder="35" />
        </label>
        <label class="field">
          <span>Жиры, г</span>
          <input name="fat" type="number" min="0" step="0.1" placeholder="18" />
        </label>
        <label class="field">
          <span>Углеводы, г</span>
          <input name="carbs" type="number" min="0" step="0.1" placeholder="62" />
        </label>
        <label class="field field-wide">
          <span>Комментарий</span>
          <input name="note" type="text" placeholder="порция, соус, где ел" />
        </label>
        <button class="button button-primary" type="submit">Добавить съеденное</button>
      </form>
    </section>
  `;
}

function eatenLog(entries) {
  return `
    <section class="panel eaten-log-panel">
      <div class="panel-header">
        <div>
          <h2>Журнал дня</h2>
          <p class="caption">Можно удалить ошибочную запись.</p>
        </div>
        <span class="pill">${entries.length}</span>
      </div>
      ${
        entries.length
          ? `<ul class="eaten-list">
              ${entries
                .map(
                  (entry) => `
                    <li>
                      <div>
                        <strong>${escapeHtml(entry.name)}</strong>
                        <span>${escapeHtml(entry.mealTitle)} · ${Math.round(macroValue(entry.calories))} ккал · Б ${compactNumber(entry.protein)} / Ж ${compactNumber(entry.fat)} / У ${compactNumber(entry.carbs)}</span>
                        ${entry.note ? `<small>${escapeHtml(entry.note)}</small>` : ""}
                      </div>
                      <button class="icon-button" data-delete-eaten="${escapeHtml(entry.id)}" type="button" aria-label="Удалить запись">×</button>
                    </li>
                  `,
                )
                .join("")}
            </ul>`
          : `<div class="soft-band"><strong>Пока ничего не отмечено</strong><span>Нажми “Съел этот вариант” или добавь свой прием пищи.</span></div>`
      }
    </section>
  `;
}

function trainingView() {
  const profile = currentProfile();
  const plan = estimatePlan(profile);
  const weeks = buildTrainingPlan(profile);
  const workout = getTodayWorkout(profile);
  const entries = getTodayWorkoutLog();
  const totals = workoutTotals(entries);
  const doneCount = workout.items.filter(([name]) => isWorkoutItemLogged(name)).length;

  return `
    <section class="topbar">
      <div>
        <p class="section-kicker">Период 4 недели</p>
        <h1>Тренировочный план</h1>
        <p>${escapeHtml(profile.trainingDays)} · ${escapeHtml(profile.equipment)} · ${plan.sessionMinutes} мин · цель “${escapeHtml(profile.goal.toLowerCase())}”.</p>
      </div>
      <button class="button button-ghost" id="clearWorkoutDay" type="button">Очистить день</button>
    </section>

    <section class="panel workout-summary-panel">
      <div class="panel-header">
        <div>
          <h2>Сегодня выполнено</h2>
          <p class="caption">${doneCount}/${workout.items.length} пунктов плана · ${entries.length} записей</p>
        </div>
        <span class="pill">${escapeHtml(workout.type)}</span>
      </div>
      <div class="metric-grid">
        ${metricBox("Упражнения", `${totals.exercises}`, "записей сегодня", clamp(Math.round((entries.length / Math.max(1, workout.items.length)) * 100), 0, 100))}
        ${metricBox("Подходы", `${compactNumber(totals.sets)}`, "рабочие подходы", clamp(totals.sets * 8, 0, 100))}
        ${metricBox("Повторы", `${compactNumber(totals.reps)}`, "суммарно", clamp(totals.reps, 0, 100))}
        ${metricBox("Объем", `${Math.round(totals.volume)} кг`, "вес x повторы", clamp(totals.volume / 100, 0, 100))}
      </div>
    </section>

    <section class="training-tools-grid">
      ${plannedWorkoutPanel(workout)}
      ${workoutEntryForm(workout)}
    </section>

    ${workoutLogPanel(entries)}

    <section class="weeks-grid">
      ${weeks.map((week) => workoutWeek(week)).join("")}
    </section>

    <section class="panel feedback-panel">
      <div class="panel-header">
        <div>
          <h2>Фидбек после тренировки</h2>
          <p class="caption">Запись добавится в журнал и повлияет на подсказку по следующему объему.</p>
        </div>
        <span class="pill">${state.feedback.length} записей</span>
      </div>
      <div class="segmented" role="group" aria-label="Оценка сложности">
        ${["easy", "normal", "hard"].map((id) => `<button class="segment ${state.effort === id ? "is-active" : ""}" data-effort="${id}" type="button">${effortLabel(id)}</button>`).join("")}
      </div>
      <div class="form-grid" style="margin-top: 14px">
        <label class="field">
          <span>Энергия, 1-10</span>
          <input id="energyInput" type="number" min="1" max="10" value="7" />
        </label>
        <label class="field">
          <span>Боль / ограничения</span>
          <input id="painInput" type="text" placeholder="например: тянет плечо" />
        </label>
      </div>
      <div class="feedback-actions" style="margin-top: 14px">
        <button class="button button-primary" id="saveFeedback" type="button">Закрыть тренировку</button>
        <span class="caption">${feedbackHint()}</span>
      </div>
    </section>
  `;
}

function plannedWorkoutPanel(workout) {
  return `
    <section class="panel planned-workout-panel">
      <div class="panel-header">
        <div>
          <h2>План на сегодня</h2>
          <p class="caption">Быстро отметь пункт или запиши точные подходы ниже.</p>
        </div>
        <span class="pill">${escapeHtml(workout.type)}</span>
      </div>
      <div class="planned-exercise-list">
        ${workout.items
          .map(([name, target]) => {
            const logged = isWorkoutItemLogged(name);
            return `
              <div class="planned-exercise">
                <div>
                  <strong>${escapeHtml(name)}</strong>
                  <span>${escapeHtml(target)}</span>
                </div>
                <button class="button ${logged ? "button-ghost" : "button-primary"}" data-log-planned-workout="${escapeHtml(name)}" data-workout-target="${escapeHtml(target)}" type="button" ${logged ? "disabled" : ""}>
                  ${logged ? "Готово" : "Отметить"}
                </button>
              </div>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function workoutEntryForm(workout) {
  const options = [...workout.items.map(([name]) => name), "Свое упражнение"];
  return `
    <section class="panel workout-entry-panel">
      <div class="panel-header">
        <div>
          <h2>Записать упражнение</h2>
          <p class="caption">Для силовых укажи вес, для кардио можно оставить вес пустым.</p>
        </div>
        <span class="pill">ручной ввод</span>
      </div>
      <form id="workoutEntryForm" class="workout-entry-form">
        <label class="field">
          <span>Упражнение</span>
          <select name="exercise">
            ${optionList(options, options[0])}
          </select>
        </label>
        <label class="field">
          <span>Свое название</span>
          <input name="customName" type="text" placeholder="например: жим гантелей" />
        </label>
        <label class="field">
          <span>Подходы</span>
          <input name="sets" type="number" min="0" step="1" placeholder="4" />
        </label>
        <label class="field">
          <span>Повторы</span>
          <input name="reps" type="number" min="0" step="1" placeholder="8" />
        </label>
        <label class="field">
          <span>Вес, кг</span>
          <input name="weight" type="number" min="0" step="0.5" placeholder="60" />
        </label>
        <label class="field">
          <span>Минуты</span>
          <input name="minutes" type="number" min="0" step="1" placeholder="12" />
        </label>
        <label class="field">
          <span>Сложность, 1-10</span>
          <input name="rpe" type="number" min="1" max="10" step="1" value="7" />
        </label>
        <label class="field">
          <span>Комментарий</span>
          <input name="note" type="text" placeholder="техника, боль, запас повторов" />
        </label>
        <button class="button button-primary" type="submit">Добавить упражнение</button>
      </form>
    </section>
  `;
}

function workoutLogPanel(entries) {
  return `
    <section class="panel workout-log-panel">
      <div class="panel-header">
        <div>
          <h2>Журнал тренировки</h2>
          <p class="caption">Записи сохраняются на этом устройстве.</p>
        </div>
        <span class="pill">${entries.length}</span>
      </div>
      ${
        entries.length
          ? `<ul class="workout-log-list">
              ${entries
                .map(
                  (entry) => `
                    <li>
                      <div>
                        <strong>${escapeHtml(entry.name)}</strong>
                        <span>${workoutEntryLine(entry)}</span>
                        ${entry.note ? `<small>${escapeHtml(entry.note)}</small>` : ""}
                      </div>
                      <button class="icon-button" data-delete-workout="${escapeHtml(entry.id)}" type="button" aria-label="Удалить упражнение">×</button>
                    </li>
                  `,
                )
                .join("")}
            </ul>`
          : `<div class="soft-band"><strong>Пока тренировка не начата</strong><span>Отметь пункт плана или добавь упражнение вручную.</span></div>`
      }
    </section>
  `;
}

function workoutEntryLine(entry) {
  const parts = [];
  if (macroValue(entry.sets)) parts.push(`${compactNumber(entry.sets)} подх.`);
  if (macroValue(entry.reps)) parts.push(`${compactNumber(entry.reps)} повт.`);
  if (macroValue(entry.weight)) parts.push(`${compactNumber(entry.weight)} кг`);
  if (macroValue(entry.minutes)) parts.push(`${compactNumber(entry.minutes)} мин`);
  if (macroValue(entry.rpe)) parts.push(`сложн. ${compactNumber(entry.rpe)}/10`);
  return escapeHtml(parts.join(" · ") || "отмечено");
}

function calendarView() {
  const profile = currentProfile();
  const days = buildCalendarDays(profile);
  const stats = calendarStats(days);

  return `
    <section class="topbar">
      <div>
        <p class="section-kicker">4 недели</p>
        <h1>Календарь периода</h1>
        <p>${escapeHtml(profile.trainingDays)} · ${escapeHtml(profile.sport)} · тренировки и восстановление на ближайшие 28 дней.</p>
      </div>
      <button class="button button-primary" data-view-jump="training" type="button">Открыть тренировку</button>
    </section>

    <section class="metric-grid metric-grid-wide">
      ${metricBox("Тренировки", `${stats.training}`, "по расписанию", clamp(stats.training * 8, 0, 100))}
      ${metricBox("Восстановление", `${stats.recovery}`, "дней без нагрузки", clamp(stats.recovery * 5, 0, 100))}
      ${metricBox("Закрыто", `${stats.loggedWorkouts}`, "дней с записями", clamp(Math.round((stats.loggedWorkouts / Math.max(1, stats.training)) * 100), 0, 100))}
      ${metricBox("Заметки", `${stats.notes}`, "дней с планом", clamp(stats.notes * 12, 0, 100))}
    </section>

    <section class="calendar-layout">
      <div class="panel calendar-panel">
        <div class="panel-header">
          <div>
            <h2>План периода</h2>
            <p class="caption">Календарь строится по дням тренировок из анкеты.</p>
          </div>
          <span class="pill">${todayKey()}</span>
        </div>
        <div class="calendar-grid">
          ${days.map((day) => calendarDayCard(day)).join("")}
        </div>
      </div>

      <div class="calendar-side">
        ${calendarNoteForm(days)}
        ${calendarNotesPanel()}
      </div>
    </section>
  `;
}

function calendarDayCard(day) {
  const hasData = day.workoutEntries.length || day.eatenEntries.length || day.progressEntry;
  return `
    <article class="calendar-day ${day.isToday ? "is-today" : ""} ${day.isTraining ? "is-training" : "is-recovery"}">
      <div class="calendar-day-head">
        <strong>${escapeHtml(day.dayName)} ${day.dayNumber}</strong>
        <span>${day.isTraining ? "трен." : "восст."}</span>
      </div>
      <h3>${escapeHtml(day.title)}</h3>
      <p>${escapeHtml(day.focus)}</p>
      <div class="calendar-tags">
        ${day.workoutEntries.length ? `<span>упр. ${day.workoutEntries.length}</span>` : ""}
        ${day.eatenEntries.length ? `<span>еда ${day.eatenEntries.length}</span>` : ""}
        ${day.progressEntry ? `<span>${compactNumber(day.progressEntry.weight)} кг</span>` : ""}
        ${day.note?.title ? `<span>заметка</span>` : ""}
        ${!hasData && !day.note ? `<span>план</span>` : ""}
      </div>
    </article>
  `;
}

function calendarNoteForm(days) {
  return `
    <section class="panel calendar-note-panel">
      <div class="panel-header">
        <div>
          <h2>Заметка на день</h2>
          <p class="caption">Например: соревнование, поездка, разгрузка, контроль веса.</p>
        </div>
        <span class="pill">план</span>
      </div>
      <form id="calendarNoteForm" class="calendar-note-form">
        <label class="field">
          <span>Дата</span>
          <select name="date">
            ${optionList(days.map((day) => [day.date, `${day.date} · ${day.dayName}`]), todayKey())}
          </select>
        </label>
        ${field("title", "Коротко", "text", "", "например: контрольный бег")}
        <label class="field field-wide">
          <span>Заметка</span>
          <textarea name="note" placeholder="что учесть в этот день"></textarea>
        </label>
        <button class="button button-primary" type="submit">Сохранить заметку</button>
      </form>
    </section>
  `;
}

function calendarNotesPanel() {
  const notes = [...state.calendarNotes].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  return `
    <section class="panel calendar-notes-panel">
      <div class="panel-header">
        <div>
          <h2>Заметки периода</h2>
          <p class="caption">Будущие акценты и события.</p>
        </div>
        <span class="pill">${notes.length}</span>
      </div>
      ${
        notes.length
          ? `<ul class="calendar-note-list">
              ${notes
                .slice(0, 10)
                .map(
                  (note) => `
                    <li>
                      <div>
                        <strong>${escapeHtml(note.date)} · ${escapeHtml(note.title || "Заметка")}</strong>
                        ${note.note ? `<span>${escapeHtml(note.note)}</span>` : ""}
                      </div>
                      <button class="icon-button" data-delete-calendar-note="${escapeHtml(note.date)}" type="button" aria-label="Удалить заметку">×</button>
                    </li>
                  `,
                )
                .join("")}
            </ul>`
          : `<div class="soft-band"><strong>Пока заметок нет</strong><span>Добавь событие или акцент на конкретный день.</span></div>`
      }
    </section>
  `;
}

function progressView() {
  const profile = currentProfile();
  const plan = estimatePlan(profile);
  const target = getTargetPlan(profile);
  const stats = progressStats(profile);
  const today = getTodayProgress();

  return `
    <section class="topbar">
      <div>
        <p class="section-kicker">Динамика</p>
        <h1>Прогресс</h1>
        <p>Вес, сон, вода, шаги и энергия по дням. Эти записи помогают видеть, что реально двигает форму.</p>
      </div>
    </section>

    <section class="metric-grid metric-grid-wide">
      ${metricBox("Вес", `${compactNumber(stats.weightNow)} кг`, weightDeltaText(stats.weightDelta), progressToTarget(profile, target, stats))}
      ${metricBox("Сон", `${compactNumber(stats.avgSleep)} ч`, `цель ${compactNumber(plan.sleepGoal)} ч`, clamp(Math.round((stats.avgSleep / plan.sleepGoal) * 100), 0, 100))}
      ${metricBox("Шаги", `${Math.round(stats.avgSteps)}`, "среднее за 7 записей", clamp(Math.round(stats.avgSteps / 100), 0, 100))}
      ${metricBox("Серия", `${stats.streak} дн.`, "чек-ин подряд", clamp(stats.streak * 14, 0, 100))}
    </section>

    <section class="progress-layout">
      ${progressCheckinForm(profile, plan, today)}
      ${progressChartPanel(stats, target)}
    </section>

    ${progressHistoryPanel(stats.entries)}
  `;
}

function progressCheckinForm(profile, plan, today) {
  return `
    <section class="panel progress-checkin-panel">
      <div class="panel-header">
        <div>
          <h2>Чек-ин дня</h2>
          <p class="caption">${today ? "Сегодня уже есть запись, можно обновить." : "Заполни 30 секунд после утра или перед сном."}</p>
        </div>
        <span class="pill">${todayKey()}</span>
      </div>
      <form id="progressForm" class="progress-form">
        ${field("date", "Дата", "date", today?.date || todayKey(), "", "required")}
        ${field("weight", "Вес, кг", "number", today?.weight || profile.weight, "78", "min='35' max='220' step='0.1'")}
        ${field("waist", "Талия, см", "number", today?.waist || "", "84", "min='40' max='180' step='0.1'")}
        ${field("sleep", "Сон, часов", "number", today?.sleep || plan.sleepGoal, "8", "min='0' max='14' step='0.25'")}
        ${field("water", "Вода, л", "number", today?.water || plan.water, "2.8", "min='0' max='9' step='0.1'")}
        ${field("steps", "Шаги", "number", today?.steps || "", "9000", "min='0' max='60000' step='100'")}
        ${field("energy", "Энергия, 1-10", "number", today?.energy || "7", "7", "min='1' max='10' step='1'")}
        ${selectField("mood", "Настроение", ["Отлично", "Нормально", "Устал", "Стресс", "Болит"], today?.mood || "Нормально")}
        <label class="field field-wide">
          <span>Заметка</span>
          <input name="note" type="text" value="${escapeHtml(today?.note || "")}" placeholder="что повлияло на день" />
        </label>
        <button class="button button-primary" type="submit">Сохранить чек-ин</button>
      </form>
    </section>
  `;
}

function progressChartPanel(stats, target) {
  const points = stats.entries
    .filter((entry) => macroValue(entry.weight))
    .slice(0, 10)
    .reverse();
  return `
    <section class="panel progress-chart-panel">
      <div class="panel-header">
        <div>
          <h2>Вес и восстановление</h2>
          <p class="caption">${progressSummaryText(stats, target)}</p>
        </div>
        <span class="pill">${stats.entries.length} записей</span>
      </div>
      ${
        points.length >= 2
          ? `<div class="weight-chart" aria-label="Динамика веса">
              ${points.map((entry, index) => weightBar(entry, index, points)).join("")}
            </div>`
          : `<div class="soft-band"><strong>Нужно минимум 2 записи</strong><span>После пары чек-инов здесь появится простая динамика веса.</span></div>`
      }
      <div class="progress-insights">
        <div><span>Энергия</span><strong>${stats.avgEnergy ? compactNumber(stats.avgEnergy) : "0"}/10</strong></div>
        <div><span>Сон</span><strong>${stats.avgSleep ? compactNumber(stats.avgSleep) : "0"} ч</strong></div>
        <div><span>Шаги</span><strong>${Math.round(stats.avgSteps)}</strong></div>
      </div>
    </section>
  `;
}

function weightBar(entry, index, points) {
  const weights = points.map((item) => macroValue(item.weight)).filter(Boolean);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const value = macroValue(entry.weight);
  const height = max === min ? 48 : 28 + ((value - min) / (max - min)) * 58;
  return `
    <div class="weight-bar-item">
      <span>${compactNumber(value)}</span>
      <i style="height: ${height}px"></i>
      <small>${escapeHtml(entry.date.slice(5))}</small>
    </div>
  `;
}

function progressHistoryPanel(entries) {
  return `
    <section class="panel progress-history-panel">
      <div class="panel-header">
        <div>
          <h2>История</h2>
          <p class="caption">Последние записи прогресса.</p>
        </div>
        <span class="pill">${entries.length}</span>
      </div>
      ${
        entries.length
          ? `<ul class="progress-list">
              ${entries
                .slice(0, 12)
                .map(
                  (entry) => `
                    <li>
                      <div>
                        <strong>${escapeHtml(entry.date)} · ${compactNumber(entry.weight)} кг</strong>
                        <span>сон ${compactNumber(entry.sleep)} ч · вода ${compactNumber(entry.water)} л · шаги ${Math.round(macroValue(entry.steps))} · энергия ${compactNumber(entry.energy)}/10</span>
                        ${entry.note ? `<small>${escapeHtml(entry.note)}</small>` : ""}
                      </div>
                      <button class="icon-button" data-delete-progress="${escapeHtml(entry.date)}" type="button" aria-label="Удалить запись">×</button>
                    </li>
                  `,
                )
                .join("")}
            </ul>`
          : `<div class="soft-band"><strong>Истории пока нет</strong><span>Сохрани первый чек-ин, и здесь появится дневник прогресса.</span></div>`
      }
    </section>
  `;
}

function weightDeltaText(delta) {
  if (!delta) return "последняя запись";
  return delta > 0 ? `+${compactNumber(delta)} кг к прошлой` : `${compactNumber(delta)} кг к прошлой`;
}

function progressToTarget(profile, target, stats) {
  if (!target.hasTarget) return 28;
  const start = numberValue(profile.weight, stats.weightNow);
  const total = Math.abs(target.target - start);
  const done = Math.abs(stats.weightNow - start);
  if (!total) return 100;
  return clamp(Math.round((done / total) * 100), 0, 100);
}

function progressSummaryText(stats, target) {
  if (!stats.latest) return "Добавь первую запись, чтобы приложение начало видеть динамику.";
  if (target.hasTarget) return `Текущий ориентир: ${target.direction} до ${compactNumber(target.target)} кг.`;
  return "Цель по весу можно задать в анкете.";
}

function workoutWeek(week) {
  return `
    <article class="workout-week">
      <div class="panel-header">
        <h3>${week.title}</h3>
        <span class="pill">${week.focus}</span>
      </div>
      ${week.days
        .map(
          (day) => `
            <div class="workout-day">
              <div>
                <strong>${escapeHtml(day.name)}</strong>
                <span>${escapeHtml(day.work)}</span>
              </div>
              <strong>${escapeHtml(day.volume)}</strong>
            </div>
          `,
        )
        .join("")}
    </article>
  `;
}

function adviceView() {
  const profile = currentProfile();
  const report = weeklyReport(profile);
  const actions = weeklyActions(report, profile);

  return `
    <section class="topbar">
      <div>
        <p class="section-kicker">7 дней</p>
        <h1>Отчет и рекомендации</h1>
        <p>Выводы на основе питания, тренировок и чек-инов прогресса за последнюю неделю.</p>
      </div>
    </section>

    <section class="report-hero-grid">
      <div class="panel report-score-panel">
        <div class="readiness-ring" style="--score: ${report.score}">
          <strong>${report.score}</strong>
          <span>неделя</span>
        </div>
        <div>
          <h2>${weeklyScoreTitle(report.score)}</h2>
          <p>${weeklyScoreText(report)}</p>
        </div>
      </div>

      <div class="metric-grid report-metrics">
        ${metricBox("Питание", `${report.nutritionDays}/7`, `${Math.round(report.avgCalories)} ккал ср.`, clamp(Math.round((report.nutritionDays / 7) * 100), 0, 100))}
        ${metricBox("Белок", `${Math.round(report.avgProtein)} г`, `цель ${report.plan.protein} г`, clamp(Math.round((report.avgProtein / report.plan.protein) * 100), 0, 100))}
        ${metricBox("Тренировки", `${report.trainingDays}/${report.targetTrainingDays}`, `${Math.round(report.totalVolume)} кг объем`, clamp(Math.round((report.trainingDays / report.targetTrainingDays) * 100), 0, 100))}
        ${metricBox("Сон", `${compactNumber(report.avgSleep)} ч`, `цель ${compactNumber(report.plan.sleepGoal)} ч`, clamp(Math.round((report.avgSleep / report.plan.sleepGoal) * 100), 0, 100))}
      </div>
    </section>

    <section class="panel weekly-strip-panel">
      <div class="panel-header">
        <div>
          <h2>Неделя по дням</h2>
          <p class="caption">Питание, тренировка и чек-ин в одном ряду.</p>
        </div>
        <span class="pill">${report.progressDays} чек-ин</span>
      </div>
      <div class="weekly-strip">
        ${report.days.map((day) => weeklyDayCard(day, report.plan)).join("")}
      </div>
    </section>

    <section class="recommendation-grid">
      ${actions.map(([title, body]) => recommendationCard(title, body)).join("")}
    </section>
  `;
}

function weeklyScoreTitle(score) {
  if (score >= 82) return "Неделя идет сильно";
  if (score >= 62) return "Есть хороший фундамент";
  if (score >= 38) return "Нужно больше стабильности";
  return "Сначала собираем данные";
}

function weeklyScoreText(report) {
  if (report.nutritionDays + report.trainingDays + report.progressDays < 4) {
    return "Пока мало отметок. Начни с питания, одного чек-ина и закрытия тренировки сегодня.";
  }
  return `Питание отмечено ${report.nutritionDays} дн., тренировки ${report.trainingDays} дн., чек-ины ${report.progressDays} дн.`;
}

function weeklyDayCard(day, plan) {
  const caloriesPct = plan.calories ? clamp(Math.round((day.nutrition.calories / plan.calories) * 100), 0, 140) : 0;
  const hasWorkout = day.workouts.length > 0;
  const hasProgress = Boolean(day.progress);
  return `
    <div class="weekly-day-card">
      <strong>${escapeHtml(day.date.slice(5))}</strong>
      <span>${Math.round(day.nutrition.calories)} ккал</span>
      <div class="mini-progress"><i style="width: ${Math.min(100, caloriesPct)}%"></i></div>
      <small>${hasWorkout ? `${day.workout.exercises} упр.` : "нет трен."} · ${hasProgress ? `${compactNumber(day.progress.weight)} кг` : "нет чек."}</small>
    </div>
  `;
}

function recommendationCard(title, body) {
  return `
    <article class="recommendation-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(body)}</p>
    </article>
  `;
}

function profileView() {
  return `
    <section class="topbar">
      <div>
        <p class="section-kicker">Данные профиля</p>
        <h1>Анкета</h1>
        <p>Можно изменить ответы и пересчитать питание с тренировками.</p>
      </div>
      <button class="button button-danger" id="resetProfile" type="button">Сбросить данные</button>
    </section>
    ${onboardingTemplate().match(/<form[\s\S]*<\/form>/)?.[0] || ""}
  `;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Доброе утро";
  if (hour < 18) return "Добрый день";
  return "Добрый вечер";
}

function getTodayWorkout(profile) {
  const sessionMinutes = numberValue(profile.sessionMinutes, 60);
  const hasInjuries = Boolean(profile.injuries.trim());

  if (profile.sport === "Бег") {
    return {
      type: "Бег",
      items: [
        ["Разминка", hasInjuries ? "12 мин мягко" : "10 мин"],
        ["Легкий бег", `${Math.max(25, sessionMinutes - 20)} мин`],
        ["Ускорения", hasInjuries ? "пропустить" : "4 x 20 сек"],
        ["Заминка", "8 мин"],
      ],
    };
  }

  if (profile.goal === "Выносливость") {
    return {
      type: "Смешанная",
      items: [
        ["Разминка", "10 мин"],
        ["Круговая работа", sessionMinutes >= 75 ? "6 кругов" : "4 круга"],
        ["Пульсовая зона", "умеренно"],
        ["Растяжка", "8 мин"],
      ],
    };
  }

  return {
    type: "Силовая",
    items: [
      ["Разминка", hasInjuries ? "12 мин + мобилити" : "10 мин"],
      ["Присед / жим", hasInjuries ? "3 x 8 техника" : "4 x 6-8"],
      ["Тяга / спина", sessionMinutes >= 75 ? "5 x 8-10" : "4 x 8-10"],
      ["Кор", "3 x 40 сек"],
    ],
  };
}

function buildTrainingPlan(profile) {
  const sessionMinutes = numberValue(profile.sessionMinutes, 60);
  const volume = sessionMinutes >= 75 ? "16-18 подходов" : sessionMinutes <= 45 ? "10-12 подходов" : "14-16 подходов";
  const baseDays =
    profile.sport === "Бег"
      ? [
          ["День 1", "Легкий бег + техника", "35-45 мин"],
          ["День 2", "Интервалы", "6 x 400 м"],
          ["День 3", "Длинная спокойная работа", "55-70 мин"],
        ]
      : [
          ["День 1", "Ноги + кор", volume],
          ["День 2", "Верх тела", volume],
          ["День 3", profile.equipment.includes("Дом") ? "Полное тело дома" : "Полное тело", sessionMinutes <= 45 ? "10 подходов" : "12-14 подходов"],
        ];

  const multiplier = state.feedback.at(-1)?.effort === "hard" ? "минус 10%" : state.feedback.at(-1)?.effort === "easy" ? "плюс 5%" : "база";

  return [1, 2, 3, 4].map((week) => ({
    title: `Неделя ${week}`,
    focus: week === 4 ? "разгрузка" : week === 1 ? "адаптация" : multiplier,
    days: baseDays.map(([name, work, volume]) => ({
      name,
      work,
      volume: week === 4 ? "70%" : volume,
    })),
  }));
}

function effortLabel(id) {
  return {
    easy: "Легко",
    normal: "Нормально",
    hard: "Тяжело",
  }[id];
}

function feedbackHint() {
  const last = state.feedback.at(-1);
  if (!last) return "После первой записи появится подсказка по объему.";
  if (last.effort === "hard") return "Следующий план лучше сделать легче на 5-10%.";
  if (last.effort === "easy") return "Можно аккуратно поднять объем на 5%.";
  return "Объем можно оставить без изменений.";
}

function attachEvents() {
  document.querySelector("#profileForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    state.profile = data;
    writeStorage(STORAGE_KEY, data);
    state.view = "dashboard";
    render();
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      render();
    });
  });

  document.querySelectorAll("[data-view-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.viewJump;
      render();
    });
  });

  document.querySelectorAll("[data-effort]").forEach((button) => {
    button.addEventListener("click", () => {
      state.effort = button.dataset.effort;
      render();
    });
  });

  document.querySelector("#saveFeedback")?.addEventListener("click", () => {
    const feedback = {
      date: new Date().toISOString(),
      effort: state.effort,
      energy: document.querySelector("#energyInput")?.value || "7",
      pain: document.querySelector("#painInput")?.value || "",
    };
    state.feedback = [...state.feedback, feedback].slice(-20);
    writeStorage(FEEDBACK_KEY, state.feedback);
    render();
  });

  document.querySelector("#resetProfile")?.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FEEDBACK_KEY);
    localStorage.removeItem(EATEN_KEY);
    localStorage.removeItem(WORKOUT_LOG_KEY);
    localStorage.removeItem(PROGRESS_KEY);
    localStorage.removeItem(CALENDAR_KEY);
    state.profile = null;
    state.feedback = [];
    state.eaten = [];
    state.workoutLog = [];
    state.progress = [];
    state.calendarNotes = [];
    state.view = "dashboard";
    render();
  });

  document.querySelector("#shuffleMeals")?.addEventListener("click", () => {
    rotateMeals();
    render();
  });

  document.querySelectorAll("[data-log-suggested]").forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.logSuggested;
      const plan = estimatePlan(currentProfile());
      const mealMap = {
        breakfast: ["Завтрак", 0.26],
        lunch: ["Обед", 0.34],
        snack: ["Перекус", 0.14],
        dinner: ["Ужин", 0.26],
      };
      const meal = mealMap[key];
      if (!meal || isSuggestedMealLogged(key)) return;

      const data = mealData(key, meal[0], meal[1], plan);
      saveEatenEntry({
        source: "suggested",
        mealKey: data.mealKey,
        mealTitle: data.mealTitle,
        name: data.name,
        calories: data.calories,
        protein: data.protein,
        fat: data.fat,
        carbs: data.carbs,
        note: data.ingredients.map(([name, amount]) => `${name} ${amount}`).join(", "),
      });
      render();
    });
  });

  document.querySelector("#customMealForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    saveEatenEntry({
      source: "custom",
      mealKey: "custom",
      mealTitle: data.mealTitle || "Свой прием",
      name: data.name || "Свой вариант",
      calories: macroValue(data.calories),
      protein: macroValue(data.protein),
      fat: macroValue(data.fat),
      carbs: macroValue(data.carbs),
      note: data.note || "",
    });
    render();
  });

  document.querySelectorAll("[data-delete-eaten]").forEach((button) => {
    button.addEventListener("click", () => {
      state.eaten = state.eaten.filter((entry) => entry.id !== button.dataset.deleteEaten);
      writeStorage(EATEN_KEY, state.eaten);
      render();
    });
  });

  document.querySelector("#clearEatenDay")?.addEventListener("click", () => {
    const key = todayKey();
    state.eaten = state.eaten.filter((entry) => entry.date !== key);
    writeStorage(EATEN_KEY, state.eaten);
    render();
  });

  document.querySelectorAll("[data-log-planned-workout]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.logPlannedWorkout;
      const target = button.dataset.workoutTarget || "";
      if (!name || isWorkoutItemLogged(name)) return;
      const parsed = parseWorkoutTarget(target);
      saveWorkoutEntry({
        source: "planned",
        name,
        target,
        sets: macroValue(parsed.sets),
        reps: macroValue(parsed.reps),
        weight: 0,
        minutes: macroValue(parsed.minutes),
        rpe: 7,
        note: target ? `План: ${target}` : "",
      });
      render();
    });
  });

  document.querySelector("#workoutEntryForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const name =
      data.exercise === "Свое упражнение"
        ? data.customName || "Свое упражнение"
        : data.exercise || data.customName || "Упражнение";
    saveWorkoutEntry({
      source: "manual",
      name,
      target: "",
      sets: macroValue(data.sets),
      reps: macroValue(data.reps),
      weight: macroValue(data.weight),
      minutes: macroValue(data.minutes),
      rpe: macroValue(data.rpe),
      note: data.note || "",
    });
    render();
  });

  document.querySelectorAll("[data-delete-workout]").forEach((button) => {
    button.addEventListener("click", () => {
      state.workoutLog = state.workoutLog.filter((entry) => entry.id !== button.dataset.deleteWorkout);
      writeStorage(WORKOUT_LOG_KEY, state.workoutLog);
      render();
    });
  });

  document.querySelector("#clearWorkoutDay")?.addEventListener("click", () => {
    const key = todayKey();
    state.workoutLog = state.workoutLog.filter((entry) => entry.date !== key);
    writeStorage(WORKOUT_LOG_KEY, state.workoutLog);
    render();
  });

  document.querySelector("#progressForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    saveProgressEntry(data);
    render();
  });

  document.querySelectorAll("[data-delete-progress]").forEach((button) => {
    button.addEventListener("click", () => {
      state.progress = state.progress.filter((entry) => entry.date !== button.dataset.deleteProgress);
      writeStorage(PROGRESS_KEY, state.progress);
      render();
    });
  });

  document.querySelector("#calendarNoteForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    saveCalendarNote(data);
    render();
  });

  document.querySelectorAll("[data-delete-calendar-note]").forEach((button) => {
    button.addEventListener("click", () => {
      state.calendarNotes = state.calendarNotes.filter((note) => note.date !== button.dataset.deleteCalendarNote);
      writeStorage(CALENDAR_KEY, state.calendarNotes);
      render();
    });
  });
}

function rotateMeals() {
  Object.keys(mealTemplates).forEach((key) => {
    mealTemplates[key] = [...mealTemplates[key].slice(1), mealTemplates[key][0]];
  });
}

function render() {
  app.innerHTML = state.profile ? appTemplate() : onboardingTemplate();
  attachEvents();
}

render();
