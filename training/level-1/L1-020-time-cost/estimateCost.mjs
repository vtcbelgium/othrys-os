export function estimateCost(ratePerHour, duration, unit = "hours") {
  const validUnits = ["hours", "minutes", "seconds", "milliseconds"];

  // Type validation: check if it's a number
  if (typeof ratePerHour !== "number") {
    throw new TypeError("ratePerHour must be a number");
  }

  // Range validation: check if it's finite and non-negative
  if (!Number.isFinite(ratePerHour) || ratePerHour < 0) {
    throw new RangeError("ratePerHour must be a finite number >= 0");
  }

  // Type validation: check if it's a number
  if (typeof duration !== "number") {
    throw new TypeError("duration must be a number");
  }

  // Range validation: check if it's finite and non-negative
  if (!Number.isFinite(duration) || duration < 0) {
    throw new RangeError("duration must be a finite number >= 0");
  }

  if (!validUnits.includes(unit)) {
    throw new RangeError(`Invalid unit: ${unit}. Must be one of: hours, minutes, seconds, milliseconds`);
  }

  let hours;
  switch (unit) {
    case "hours":
      hours = duration;
      break;
    case "minutes":
      hours = duration / 60;
      break;
    case "seconds":
      hours = duration / 3600;
      break;
    case "milliseconds":
      hours = duration / 3600000;
      break;
    default:
      throw new RangeError(`Invalid unit: ${unit}`);
  }

  const cost = ratePerHour * hours;

  // Normalize -0 to 0
  const normalizedCost = cost === 0 ? 0 : cost;

  return Object.freeze({
    ratePerHour,
    duration,
    unit,
    hours,
    cost: normalizedCost
  });
}
