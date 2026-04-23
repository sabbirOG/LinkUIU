import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | LinkedUIU Alumni Connect",
  description: "Sign in to your LinkedUIU account to connect with United International University alumni and students.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
