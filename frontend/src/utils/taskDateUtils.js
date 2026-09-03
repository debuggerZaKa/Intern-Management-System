/**
 * Utility functions for task date management and calendar-based week calculation.
 */

/**
 * Returns the Monday (00:00:00) of the calendar week containing the given date.
 * (Assumes work weeks run Monday - Sunday)
 */
export function getMonday(dateInput) {
  const d = new Date(dateInput);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const diff = d.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * Calculate the calendar work week number (1-indexed) based on intern's joining date.
 * If intern joined on a Wednesday, that week is Week 1.
 * The following Monday starts Week 2.
 *
 * @param {string|Date} startDateStr - Intern's start/joining date (e.g. "2026-09-02")
 * @param {string|Date} targetDateStr - Target task date (e.g. "2026-09-07")
 * @returns {number} Week number (>= 1)
 */
export function calculateWeekFromStartDate(startDateStr, targetDateStr) {
  if (!startDateStr || !targetDateStr) return 1;

  try {
    let startDate;
    if (typeof startDateStr === "string" && startDateStr.includes("-")) {
      const [sY, sM, sD] = startDateStr.slice(0, 10).split("-").map(Number);
      startDate = new Date(sY, sM - 1, sD);
    } else {
      startDate = new Date(startDateStr);
    }

    let targetDate;
    if (typeof targetDateStr === "string" && targetDateStr.includes("-")) {
      const [tY, tM, tD] = targetDateStr.slice(0, 10).split("-").map(Number);
      targetDate = new Date(tY, tM - 1, tD);
    } else {
      targetDate = new Date(targetDateStr);
    }

    if (isNaN(startDate.getTime()) || isNaN(targetDate.getTime())) {
      return 1;
    }

    const startMonday = getMonday(startDate);
    const targetMonday = getMonday(targetDate);

    const diffTime = targetMonday.getTime() - startMonday.getTime();
    const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));

    return Math.max(1, diffWeeks + 1);
  } catch (err) {
    console.error("Error calculating week from start date:", err);
    return 1;
  }
}

/**
 * Returns today's date formatted as YYYY-MM-DD in local time.
 */
export function getTodayDateStr() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string (YYYY-MM-DD) into a user-friendly format (e.g., "Sep 3, 2026" or "Today")
 */
export function formatTaskDate(dateStr) {
  if (!dateStr) return null;
  try {
    const rawDate = typeof dateStr === "string" ? dateStr.slice(0, 10) : "";
    const todayStr = getTodayDateStr();
    if (rawDate === todayStr) {
      return "Today";
    }

    const [year, month, day] = rawDate.split("-").map(Number);
    if (!year || !month || !day) return dateStr;

    const dateObj = new Date(year, month - 1, day);
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
}
