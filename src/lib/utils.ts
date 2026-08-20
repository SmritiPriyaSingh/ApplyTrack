import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, differenceInDays, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "MMM dd, yyyy");
}

export function formatRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function getDaysAgo(date: Date | string | null | undefined): number {
  if (!date) return 0;
  const d = typeof date === "string" ? new Date(date) : date;
  return differenceInDays(new Date(), d);
}

export function formatSalary(min?: number | null, max?: number | null, pkg?: string | null): string {
  if (pkg) return pkg;
  if (min && max) return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
  if (min) return `$${(min / 1000).toFixed(0)}k+`;
  return "Not specified";
}

export function getStatusBadge(status: string) {
  switch (status) {
    case "SAVED":
      return { label: "Saved", bg: "bg-[#1A1A1A] text-[#BFC3C7] border border-white/10" };
    case "APPLIED":
      return { label: "Applied", bg: "bg-[#C3195D]/15 text-[#C3195D] border border-[#C3195D]/30" };
    case "APPLICATION_VIEWED":
      return { label: "Viewed", bg: "bg-[#1A1A1A] text-[#EFECEC] border border-white/10" };
    case "ONLINE_ASSESSMENT":
      return { label: "Assessment", bg: "bg-[#E2B85C]/15 text-[#E2B85C] border border-[#E2B85C]/30" };
    case "TECHNICAL_INTERVIEW":
      return { label: "Tech Interview", bg: "bg-[#62929A]/20 text-[#62929A] border border-[#62929A]/40" };
    case "HR_INTERVIEW":
      return { label: "HR Interview", bg: "bg-[#1A1A1A] text-[#EFECEC] border border-white/10" };
    case "FINAL_INTERVIEW":
      return { label: "Final Round", bg: "bg-[#C3195D]/25 text-[#EFECEC] border border-[#C3195D]" };
    case "OFFER":
      return { label: "Offer Received", bg: "bg-[#6CBF84]/20 text-[#6CBF84] border border-[#6CBF84]/40" };
    case "JOINED":
      return { label: "Joined", bg: "bg-[#6CBF84]/30 text-[#6CBF84] border border-[#6CBF84]" };
    case "REJECTED":
      return { label: "Rejected", bg: "bg-[#D96C6C]/15 text-[#D96C6C] border border-[#D96C6C]/30" };
    case "GHOSTED":
      return { label: "Ghosted", bg: "bg-[#0A0A0A] text-[#737373] border border-white/5" };
    default:
      return { label: status, bg: "bg-[#1A1A1A] text-[#EFECEC] border border-white/10" };
  }
}
