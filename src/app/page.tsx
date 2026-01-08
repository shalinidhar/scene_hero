import { useEffect } from "react";
import Dashboard from "./components/Dashboard";
import Image from "next/image";
import { useState } from "react";

export default async function Home() {  
    const res = await fetch(`http://localhost:3000/api/projects?user=sdhr`, {
        cache: "no-store" // disable caching for latest data
    })
    if (!res.ok) {
        return <div>User not found</div>;
    }
    const projects = await res.json()

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Dashboard projects={projects}></Dashboard>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a>
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
