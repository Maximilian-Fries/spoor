import type { ReactNode } from "react";

const KEYS = [
  { cls: "net", label: "Host node" },
  { cls: "hot", label: "Intruder track" },
  { cls: "trace", label: "Trace-back" },
  { cls: "police", label: "Police drone" },
];

export function Legend({ keys = KEYS }: { keys?: { cls: string; label: string }[] }) {
  return (
    <div className="panel-foot">
      {keys.map((k) => <span key={k.cls} className="key"><i className={k.cls} />{k.label}</span>)}
    </div>
  );
}

export default function Panel({ title, tag, children, foot }: { title: ReactNode; tag?: ReactNode; children: ReactNode; foot?: ReactNode }) {
  return (
    <div className="panel">
      <div className="panel-head"><span className="live"><i />{title}</span><span className="phase-tag">{tag}</span></div>
      {children}
      {foot}
    </div>
  );
}
