import { Geist, Geist_Mono, Noto_Sans_Bengali } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/shared/Header/Navbar";
import { AuthProvider } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";
import { VideoProvider } from "@/contexts/VideoContext";
import { PaymentProvider } from "@/contexts/PaymentContext";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoBangla = Noto_Sans_Bengali({
  variable: "--notoBangla",
  subsets: ["latin"],
});


const banglaFont = localFont({
  src: "../../public/fonts/LiAdorNoirrit-Bold.woff2",
  variable: "--banglaFont",
  subsets: ["latin"]
})
const banglaFontTwo = localFont({
  src: "../../public/fonts/LiAdorNoirrit-SemiBold.woff2",
  variable: "--banglaFontTwo",
  subsets: ["latin"]
})
const banglaFontThree = localFont({
  src: "../../public/fonts/LiAdorNoirrit.woff2",
  variable: "--banglaFontThree",
  subsets: ["latin"]
})

export const metadata = {
  title: "Aurora Innovative Learning - Modern Educational Platform",
  description: "A comprehensive learning management system with secure video delivery, course management, and role-based access control.",
  keywords: "online learning, LMS, education, courses, video streaming, Aurora Learning",
  authors: [{ name: "Aurora Learning Team" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${notoBangla.variable} ${banglaFontTwo.variable} ${banglaFont.variable} pt-16 antialiased`}
      >
        <AuthProvider>
          <CourseProvider>
            <VideoProvider>
              <PaymentProvider>
                <Navbar/>
                {children}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      theme: {
                        primary: '#4aed88',
                      },
                    },
                    error: {
                      duration: 4000,
                      theme: {
                        primary: '#ff6b6b',
                      },
                    },
                  }}
                />
              </PaymentProvider>
            </VideoProvider>
          </CourseProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
