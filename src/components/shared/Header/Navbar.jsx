"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const { user, userProfile, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownOpen && !event.target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileDropdownOpen]);

  return (
    <nav
      className={`fixed z-50 top-0 left-0 w-full bg-white shadow-md transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href={"/"} className="text-2xl font-bold">Aurora</Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6 w-full ml-10">
          <Link href={"/"} className="hover:text-blue-600 cursor-pointer">Home</Link>
          <Link href={"/courses"} className="hover:text-blue-600 cursor-pointer">Courses</Link>
          <Link href={"/about"} className="hover:text-blue-600 cursor-pointer">About</Link>
          <Link href={"/contact"} className="hover:text-blue-600 cursor-pointer">Contact</Link>
        </ul>

        <div className="items-center gap-5 hidden md:flex">
          {isAuthenticated ? (
            <div className="relative profile-dropdown">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="font-medium">{user?.name || 'User'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-500 border-b">
                      {userProfile?.role === 'admin' && <span className="text-red-600 font-semibold">Admin</span>}
                      {userProfile?.role === 'instructor' && <span className="text-green-600 font-semibold">Instructor</span>}
                      {userProfile?.role === 'regular' && <span className="text-blue-600 font-semibold">Student</span>}
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {userProfile?.role === 'admin' && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 font-semibold"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        🛡️ Admin Dashboard
                      </Link>
                    )}
                    <Link
                      href="/debug"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Debug Database
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      href="/dashboard/my-courses"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      My Courses
                    </Link>
                    <button
                      onClick={async () => {
                        setProfileDropdownOpen(false);
                        const result = await logout();
                        if (result.success) {
                          router.push('/');
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href={"/auth/signup"} className="px-8 py-3 bg-blue-600 rounded-md text-white">Signup</Link>
              <Link href={"/auth/login"} className="px-8 py-3 bg-blue-600 rounded-md text-white">Login</Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md absolute top-full left-0 w-full p-5 flex items-center flex-col space-y-4">
          <Link href={"/"} className="hover:text-blue-600 cursor-pointer" onClick={() => setMenuOpen(false)}>Home</Link>
          <Link href={"/courses"} className="hover:text-blue-600 cursor-pointer" onClick={() => setMenuOpen(false)}>Courses</Link>
          <Link href={"/about"} className="hover:text-blue-600 cursor-pointer" onClick={() => setMenuOpen(false)}>About</Link>
          <Link href={"/contact"} className="hover:text-blue-600 cursor-pointer" onClick={() => setMenuOpen(false)}>Contact</Link>
          
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 py-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="font-medium">{user?.name || 'User'}</span>
                {userProfile?.role === 'admin' && <span className="text-red-600 text-xs font-semibold">(Admin)</span>}
                {userProfile?.role === 'instructor' && <span className="text-green-600 text-xs font-semibold">(Instructor)</span>}
              </div>
              <Link href={"/dashboard"} className="px-8 py-3 bg-gray-100 rounded-md text-gray-700 w-full text-center" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {userProfile?.role === 'admin' && (
                <Link href={"/admin"} className="px-8 py-3 bg-red-100 rounded-md text-red-600 w-full text-center font-semibold" onClick={() => setMenuOpen(false)}>🛡️ Admin Dashboard</Link>
              )}
              <Link href={"/debug"} className="px-8 py-3 bg-gray-100 rounded-md text-gray-700 w-full text-center" onClick={() => setMenuOpen(false)}>Debug Database</Link>
              <Link href={"/profile"} className="px-8 py-3 bg-gray-100 rounded-md text-gray-700 w-full text-center" onClick={() => setMenuOpen(false)}>Profile</Link>
              <Link href={"/dashboard/my-courses"} className="px-8 py-3 bg-gray-100 rounded-md text-gray-700 w-full text-center" onClick={() => setMenuOpen(false)}>My Courses</Link>
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  const result = await logout();
                  if (result.success) {
                    router.push('/');
                  }
                }}
                className="px-8 py-3 bg-red-600 rounded-md text-white w-full"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href={"/auth/signup"} className="px-8 py-3 bg-blue-600 rounded-md text-white" onClick={() => setMenuOpen(false)}>Signup</Link>
              <Link href={"/auth/login"} className="px-8 py-3 bg-blue-600 rounded-md text-white" onClick={() => setMenuOpen(false)}>Login</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
