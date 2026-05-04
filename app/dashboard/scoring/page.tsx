// UPDATED: 2025-04-16 - Redirect to main dashboard
// Aggregate scoring page dihapus, redirect ke /dashboard

import { redirect } from "next/navigation";

export default function DashboardScoringPage() {
  redirect("/dashboard");
}
