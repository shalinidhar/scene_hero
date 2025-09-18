'use client'
import { useState } from "react";

type Project = {
  id: number;
  name: string;
};

type Props = {
  onClose: React.Dispatch<React.SetStateAction<boolean>>;
  projects: Project[];
  // setUpdate: React.Dispatch<React.SetStateAction<number>>;
  // update: number;
};

export default function NewProjectModal({ onClose, projects}:Props) {
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [writtenBy, setWrittenBy] = useState("");

    const handleCreateNew = async (e)=>{
        e.preventDefault();  
        console.log(title)
        console.log(subtitle)
        console.log(writtenBy) 
        const user = "sdhr" 
        const res = await fetch(`http://localhost:3000/api/projects?user=${user}&title=${title}`, {
            method: "PUT"
        });  
        onClose()
    }
  return (
    <div
      id="crud-modal"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex justify-center items-center backdrop-blur-sm bg-black/10"
    >
      <div className="relative p-4 w-full max-w-md">
        <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create New Project
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            >
              <svg
                className="w-3 h-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          {/* Modal Body */}
          <form onSubmit={(e)=>handleCreateNew(e)} className="p-4 md:p-5">
            <div className="grid gap-4 mb-4 grid-cols-2">
              {/* Title */}
              <div className="col-span-2">
                <label
                  htmlFor="title"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Type project title"
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                />
              </div>

              {/* Written by */}
              <div className="col-span-2">
                <label
                  htmlFor="writtenBy"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Written By
                </label>
                <input
                  type="text"
                  name="writtenBy"
                  id="writtenBy"
                  onChange={(e) => setWrittenBy(e.target.value)}
                  placeholder="Author name"
                  required
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                />
              </div>

              {/* Subtitle */}
              <div className="col-span-2">
                <label
                  htmlFor="subtitle"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Subtitle
                </label>
                <textarea
                  id="subtitle"
                  name="subtitle"
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={4}
                  placeholder="Enter subtitle or tagline"
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-600 focus:border-blue-600 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full text-white inline-flex items-center justify-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              <svg
                className="me-2 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add New Project
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
