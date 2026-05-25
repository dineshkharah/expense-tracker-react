import React from "react";
import { FaLinkedin, FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <div className="flex justify-center items-center gap-2 text-gray-500 dark:text-slate-400 text-sm">
      <a
        href="https://www.linkedin.com/in/dineshkharah"
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-blue-500 dark:hover:text-blue-400 transition"
      >
        <FaLinkedin className="text-lg" />
      </a>
      <span>|</span>
      <span>
        Created by{" "}
        <a
          href="https://github.com/dineshkharah"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold hover:text-blue-500 dark:hover:text-blue-400 transition"
        >
          Dinesh Kharah
        </a>
      </span>
      <span>|</span>
      <a
        href="https://github.com/dineshkharah/expense-tracker-react.git"
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold hover:text-blue-500 dark:hover:text-blue-400 transition"
      >
        <FaGithub className="inline mr-1" />
        Source Code
      </a>
    </div>
  );
};

export default Footer;
