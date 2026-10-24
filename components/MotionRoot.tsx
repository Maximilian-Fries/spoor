"use client";
import { useEffect } from "react";

/** Marks the document as script-enabled so reveal transitions apply (without script everything stays visible). */
export default function MotionRoot() {
  useEffect(() => { document.documentElement.classList.add("js"); }, []);
  return null;
}
