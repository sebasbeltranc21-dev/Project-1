const STORAGE_KEY = "project1_progress_v1";
const DEFAULT_PROGRESS = {
  unlockedLevel: 1,
  completedLevels: []
};

function normalizeProgress(value) {
  const source = value && typeof value === "object" ? value : {};
  const completed = Array.isArray(source.completedLevels)
    ? source.completedLevels.filter((id) => typeof id === "string")
    : [];

  return {
    unlockedLevel: Math.max(1, Number.isFinite(source.unlockedLevel) ? source.unlockedLevel : 1),
    completedLevels: [...new Set(completed)]
  };
}

export function getProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS, completedLevels: [] };
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_PROGRESS, completedLevels: [] };
  }
}

export function completeLevel(levelNumber) {
  const progress = getProgress();
  if (!progress.completedLevels.includes(String(levelNumber))) {
    progress.completedLevels.push(String(levelNumber));
  }
  progress.unlockedLevel = Math.max(progress.unlockedLevel, levelNumber + 1);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Progress still works during the current session.
  }

  return progress;
}
