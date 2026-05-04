// UPDATED: 2025-04-16 - Redirect to main dashboard
// Aggregate settings page dihapus, redirect ke /dashboard

import { redirect } from "next/navigation";

export default function DashboardSettingsPage() {
  redirect("/dashboard");
}
