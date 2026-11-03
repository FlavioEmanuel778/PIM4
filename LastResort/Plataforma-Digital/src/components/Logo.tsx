import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Logo({ href = "/" }: { href?: string }) {
  return <Link href={href} className="logo"><span className="logo-mark"><BookOpen aria-hidden /></span>EduDigital</Link>;
}
