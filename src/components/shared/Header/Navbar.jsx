"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

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
          <Link href={"/auth/signup"} className="px-8 py-3 bg-blue-600 rounded-md text-white">Signup</Link>
          <Link href={"/auth/login"} className="px-8 py-3 bg-blue-600 rounded-md text-white">Login</Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✖" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md absolute top-full left-0 w-full p-5 flex items-center flex-col space-y-4">
          <Link href={"/"} className="hover:text-blue-600 cursor-pointer">Home</Link>
          <Link href={"/courses"} className="hover:text-blue-600 cursor-pointer">Courses</Link>
          <Link href={"/about"} className="hover:text-blue-600 cursor-pointer">About</Link>
          <Link href={"/contact"} className="hover:text-blue-600 cursor-pointer">Contact</Link>
          <Link href={"/auth/signup"} className="px-8 py-3 bg-blue-600 rounded-md text-white">Signup</Link>
          <Link href={"/auth/login"} className="px-8 py-3 bg-blue-600 rounded-md text-white">Login</Link>
        </div>
      )}
    </nav>
  );
}
