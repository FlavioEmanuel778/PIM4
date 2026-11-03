import { Laptop, ShieldCheck } from "lucide-react";

export function CourseIcon({ icon }: { icon: string }) {
  const laptop = icon === "laptop";
  return <span className={`course-ico${laptop ? " green" : ""}`}>{laptop ? <Laptop aria-hidden /> : <ShieldCheck aria-hidden />}</span>;
}
