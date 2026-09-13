import type { Nutrition, TrafficLight, TrafficLights } from "./types";

/** UK FSA front-of-pack traffic lights, per 100g (foods). */
export function trafficLights(n: Nutrition, isBeverage: boolean): TrafficLights {
  const fat = n.fat ?? n.saturatedFat * 1.4;
  if (isBeverage) {
    return {
      fat: band(fat, 1.5, 8.75),
      saturatedFat: band(n.saturatedFat, 0.75, 2.5),
      sugars: band(n.sugars, 2.5, 6.3),
      salt: band(n.salt, 0.3, 0.75),
    };
  }
  return {
    fat: band(fat, 3, 17.5),
    saturatedFat: band(n.saturatedFat, 1.5, 5),
    sugars: band(n.sugars, 5, 22.5),
    salt: band(n.salt, 0.3, 1.5),
  };
}

function band(value: number, low: number, high: number): TrafficLight {
  if (value <= low) return "green";
  if (value <= high) return "amber";
  return "red";
}
