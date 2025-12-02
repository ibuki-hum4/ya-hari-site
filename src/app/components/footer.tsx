"use client";

import { FiAlignLeft } from "react-icons/fi";
import { FiGrid } from "react-icons/fi";
import { IoMailOutline } from "react-icons/io5";
import { FiBox } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-50/80 backdrop-blur-md text-gray-800 py-8 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        {/* 左カラム */}
        <div className="flex-[2] flex flex-col text-left">
          <p className="font-bold text-lg text-gray-900 select-none">やーはり</p>
          <p className="text-sm text-gray-700 select-none"><a href="mailto:yahari@mail.skyia.jp">yahari@mail.skyia.jp</a></p>
          <p className="text-xs mt-2 text-gray-600 select-none">&copy; {new Date().getFullYear()} やーはり. All rights reserved.</p>
        </div>

        {/* 中央カラム（空） */}
        <div className="flex-1"></div>

        {/* 右カラム（縦並びリンク） */}
        <div className="flex-[1] flex flex-col items-end gap-3">
          <a href="/#about" className="group flex items-center text-gray-700 hover:text-gray-900 transition-colors">
            <FiAlignLeft size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-300 ease-out">About</span>
          </a>
          <a href="/#projects" className="group flex items-center text-gray-700 hover:text-gray-900 transition-colors">
            <FiGrid size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-300 ease-out">Projects</span>
          </a>
          <a href="/#skills" className="group flex items-center text-gray-700 hover:text-gray-900 transition-colors">
            <FiBox size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-300 ease-out">Skills</span>
          </a>
          <a href="/#contact" className="group flex items-center text-gray-700 hover:text-gray-900 transition-colors">
            <IoMailOutline size={20} className="flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-2" />
            <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[100px] group-hover:ml-2 transition-all duration-300 ease-out">Contact</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
