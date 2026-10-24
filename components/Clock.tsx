"use client";
import { useEffect, useState } from "react";

export default function Clock() {
  const [t, setT] = useState("— UTC");
  useEffect(() => {
    const tick = () => setT(new Date().toISOString().slice(0, 19).replace("T", " ") + " UTC");
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return <span className="clock">{t}</span>;
}
