import { useEffect, useId, useState } from "react";
import type { Certificate } from "../../types/database";
import { educationTimeline, readableEducationDate } from "../../lib/education";

export const EducationProgress = ({ entry }: { entry: Certificate }) => {
  const [now, setNow] = useState(Date.now);
  const id = useId();
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = window.setInterval(update, 60_000);
    document.addEventListener("visibilitychange", update);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", update); };
  }, []);
  if (entry.educationStatus !== "in_progress") return null;
  const timeline = educationTimeline(entry, now);
  if (!timeline) return <p className="education-progress-pending">In progress{entry.endDate ? ` · Expected ${readableEducationDate(entry.endDate)}` : " · Completion date to be confirmed"}</p>;
  return <div className="education-progress">
    <div className="education-progress-heading"><span id={id}>{timeline.estimated ? "Estimated timeline" : "Planned timeline"}</span><strong>{timeline.percent}%</strong></div>
    <progress max={100} value={timeline.percent} aria-labelledby={id} aria-valuetext={`${timeline.percent}% of the planned time has elapsed; completion is confirmed separately.`} />
    <div className="education-progress-dates"><span>{readableEducationDate(entry.startDate)}</span><span>{timeline.estimated ? "Expected " : "Target "}{readableEducationDate(entry.endDate)}</span></div>
    <p>{timeline.reached ? "Planned end reached. Completion is awaiting confirmation." : !timeline.started ? "The planned learning period has not started yet." : "Time elapsed in the learning plan; coursework completion is confirmed separately."}</p>
  </div>;
};
