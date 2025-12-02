"use client";

import { FiAlignLeft } from "react-icons/fi";
import { FiGrid } from "react-icons/fi";
import { IoMailOutline } from "react-icons/io5";
import { FiBox } from "react-icons/fi";
import { FiShield, FiSettings } from "react-icons/fi";

export default function Footer() {
  const handleCookieSettings = () => {
    // Cookie同意をリセットして再表示
    localStorage.removeItem("cookie-consent");
    window.location.reload();
  };

  return (
    <footer className="w-full bg-gray-50/80 dark:bg-gray-800/80 backdrop-blur-md text-gray-800 dark:text-gray-200 py-8 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        {/* 左カラム */}
        <div className="flex-[2] flex flex-col text-left">
          <p className="font-bold text-lg text-gray-900 dark:text-white select-none">やーはり</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 select-none"><a href="mailto:yahari@mail.skyia.jp">yahari@mail.skyia.jp</a></p>
          <p className="text-xs mt-2 text-gray-600 dark:text-gray-400 select-none">&copy; {new Date().getFullYear()} やーはり. All rights reserved.</p>
        </div>

        {/* 中央カラム */}
        <div className="flex-1 flex flex-col items-center gap-3">
          <a href="/privacy" className="group flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <FiShield size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[150px] group-hover:ml-2 transition-all duration-300 ease-out">Privacy Policy</span>
          </a>
          <button 
            onClick={handleCookieSettings}
            className="group flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <FiSettings size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[150px] group-hover:ml-2 transition-all duration-300 ease-out">Cookie設定</span>
          </button>
        </div>

        {/* 右カラム（縦並びリンク） */}
        <div className="flex-[1] flex flex-col items-end gap-3">
          <a href="/#about" className="group flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <FiAlignLeft size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-300 ease-out">About</span>
          </a>
          <a href="/#projects" className="group flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <FiGrid size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-300 ease-out">Projects</span>
          </a>
          <a href="/#skills" className="group flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <FiBox size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-300 ease-out">Skills</span>
          </a>
          <a href="/#contact" className="group flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            <IoMailOutline size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-300 ease-out">Contact</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
