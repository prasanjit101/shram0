import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TRPCProvider from "@/components/trpc-provider";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Shram",
  description: "Task Management App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TooltipProvider>
          <TRPCProvider>
            <nav className="fixed top-0 h-16 left-0 right-0 py-4 px-6 z-10 border-b bg-background justify-between flex items-center">
              <span className="text-xl font-bold">Shram0</span>
              <Popover>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                      <Button size="sm">How to use?</Button>
                    </PopoverTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Help</p>
                  </TooltipContent>
                </Tooltip>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <h4 className="font-medium">How to use Shram0</h4>
                    <p className="text-sm">
                      To use Shram0, simply click the microphone icon and start speaking. Don't worry about pausing or stopping; the app will automatically detect when you finish speaking. When you are done, you can click the microphone icon again to stop the detection and it will stop processing.
                    </p>
                    <p className="text-sm">
                      Use your voice to manage tasks:
                    </p>
                    <ul className="text-sm list-disc list-inside space-y-1 mt-4">
                      <li>Say something like "Create a task to [description] at [time]" to add a new task</li>
                      <li>Say "Show me all tasks related to shopping" to view your tasks</li>
                      <li>Say "Delete the task about [description]" to remove a task</li>
                      <li>Say "Delete the 4th item" to remove a specific task by its position</li>
                      <li>Say "Update the task about [description] to [new description]" to edit</li>
                      <li>Say "Update the 2nd item to [new description]" to edit a specific task by its position</li>
                    </ul>
                  </div>
                </PopoverContent>
              </Popover>
            </nav>
            <div className="pt-16 w-full"> {/* Add padding to account for fixed nav */}
              {children}
            </div>
          </TRPCProvider>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
