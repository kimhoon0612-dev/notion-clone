import type { Metadata } from "next";
import { Noto_Sans_KR, Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getPages } from "@/app/actions";
import { ThemeProvider } from "@/components/ThemeProvider";
import SearchModal from "@/components/SearchModal";
import Breadcrumb from "@/components/Breadcrumb";
import { auth } from "@/auth";
import AuthScreen from "@/components/AuthScreen";
import { SessionProvider } from "next-auth/react";
import { getMyWorkspaces, getCurrentWorkspaceId, ensurePersonalWorkspace, getMemberRole } from "@/app/workspace-actions";
import { cookies } from "next/headers";
import { I18nProvider } from "@/components/I18nProvider";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-kr",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Notion Clone",
  description: "A full-featured Notion clone with real-time collaboration",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Notion Clone",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session) {
    return (
      <html lang="ko" className={`${notoSansKR.variable} ${outfit.variable} h-full antialiased`} suppressHydrationWarning>
        <body className="min-h-full transition-colors duration-200">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthScreen />
          </ThemeProvider>
        </body>
      </html>
    );
  }

  // Ensure user has a personal workspace
  const defaultWsId = await ensurePersonalWorkspace(session.user!.id!);
  
  // Get active workspace from cookie or use first one
  const cookieStore = await cookies();
  let activeWorkspaceId = cookieStore.get('activeWorkspaceId')?.value || null;
  
  // Get all workspaces for this user
  const workspaces = await getMyWorkspaces();
  
  // If no active workspace set, or the cookie workspace doesn't exist in user's list, use default
  if (!activeWorkspaceId || !workspaces.find(w => w.id === activeWorkspaceId)) {
    activeWorkspaceId = defaultWsId;
  }

  // Get current role
  const myRole = await getMemberRole(session.user!.id!, activeWorkspaceId) || 'viewer';

  const pages = await getPages();

  return (
      <html
        lang="ko"
        className={`${notoSansKR.variable} ${outfit.variable} h-full antialiased`}
        suppressHydrationWarning
      >
      <body className="min-h-full flex transition-colors duration-200">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SessionProvider>
            <I18nProvider>
              <Sidebar pages={pages} workspaces={workspaces} activeWorkspaceId={activeWorkspaceId} myRole={myRole} />
              <div className="flex-1 h-screen overflow-y-auto flex flex-col bg-white dark:bg-[#191919] transition-colors duration-200">
                <Breadcrumb />
                <main className="flex-1">
                  {children}
                </main>
              </div>
              <SearchModal />
            </I18nProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
