import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Currency = "RWF" | "USD" | "EUR"

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  RWF: "RWF",
  USD: "$",
  EUR: "€"
}

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "RWF", label: "Rwandan Franc (RWF)" },
  { value: "USD", label: "US Dollar ($)" },
  { value: "EUR", label: "Euro (€)" }
]

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency]
  
  if (currency === "RWF") {
    // RWF typically doesn't use decimal places for large amounts
    return `${symbol} ${Math.round(amount).toLocaleString()}`
  }
  
  return `${symbol} ${amount.toFixed(2)}`
}
