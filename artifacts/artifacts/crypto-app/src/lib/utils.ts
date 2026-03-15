import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEth(value: number | undefined | null): string {
  if (value === undefined || value === null) return "0.00 ETH";
  return `${value.toFixed(4)} ETH`;
}

export function truncateWallet(address: string | undefined | null): string {
  if (!address) return "";
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
