import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Join the UIU Alumni Community",
  description: "Create your official LinkedUIU account. Join the United International University alumni association and professional networking directory.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
