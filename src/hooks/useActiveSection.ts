import { useEffect, useState } from "react";

export const useActiveSection = (ids: readonly string[]) => {
  const [active, setActive] = useState("");
  const key = ids.join("|");
  useEffect(() => {
    const sections = key.split("|").filter(Boolean).map(id => document.getElementById(id)).filter((element): element is HTMLElement => !!element);
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = sections[0]?.id ?? "";
      for (const section of sections) if (section.getBoundingClientRect().top <= 190) current = section.id;
      setActive(value => value === current ? value : current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, [key]);
  return active;
};
