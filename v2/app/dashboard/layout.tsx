import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | LinkedUIU Alumni Network",
  description: "Your professional UIU alumni dashboard. Access jobs, directory, and events.",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
