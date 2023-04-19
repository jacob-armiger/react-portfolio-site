import Link from "next/link";

export default function NavBar() {
  return (
    <div className="text-xl ">
      <nav className="flex flex-row items-center border-black-500 rounded-b p-2 ">
        <div>
          <input type="text" placeholder="Search.."></input>
          <Link className="navbar-button" href="/">
            Home
          </Link>
        </div>
      </nav>
    </div>
  );
}
