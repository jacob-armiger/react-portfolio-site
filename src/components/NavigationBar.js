import Link from "next/link";

export default function NavBar() {
  return (
    <div className="mx-4 mt-4 text-xl md:mx-48 lg:mx-64">
      <nav className="flex items-center justify-between">
        <div>
          <Link href="/">Home</Link>
        </div>
        <div>
          <Link href="/resume">Resume</Link>
        </div>
        <div>
          <Link href="/">Projects</Link>
        </div>
        <div>
          <Link href="/">Community</Link>
        </div>
      </nav>
    </div>
  );
}
