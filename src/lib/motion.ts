export function motionClass(enabled = true) {
  return enabled ? "vf-animate-fade-up motion-safe:transition motion-safe:duration-200" : "";
}

export function pressClass() {
  return "vf-press motion-safe:transition motion-safe:duration-200";
}

export function cardClass() {
  return "vf-hover-card";
}
