import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

let uidCounter = 0;

export function createUid(prefix = "id"): string {
  uidCounter = (uidCounter + 1) % 100000;
  return `${prefix}-${Date.now()}-${uidCounter}`;
}
