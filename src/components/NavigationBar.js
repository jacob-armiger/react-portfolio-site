import Link from "next/link";

export default function NavBar() {
  return (
    <div className="mx-8 mt-6 text-xl md:mx-48 lg:mx-64 xl:mx-96">
      <nav className="flex items-center justify-between">
        <div>
          <Link href="/">Home</Link>
        </div>
        <div>
          <Link href="/resume">Resume</Link>
        </div>
        <div>
          <Link href="/projects">Projects</Link>
        </div>
      </nav>
    </div>
  );
}
