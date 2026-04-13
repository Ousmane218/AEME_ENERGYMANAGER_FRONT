import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateStr, options = { day: '2-digit', month: 'short', year: 'numeric' }) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', options);
};
