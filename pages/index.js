import Head from "next/head";
import Image from "next/image";
import NavBar from "../components/navBar";

export default function Home() {
  return (
    <>
      <Head>
        <title>Armiger Portfolio</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <main>
        <Image
          src="/images/profile.jpg"
          alt="Picture of me"
          quality={100}
          width={360}
          height={545}
        />

        <div className="content">
          <h1>Jacob Armiger</h1>

          <i>Welcome to my portfolio!</i>

          <p>
            I'm a special operations veteran pursuing a career in computer
            science. Looking to make meaningful changes in the lives of others
            in the world's most rapidly evolving industry.
          </p>

          <div className="horizontal_list">
            <a target="_blank" href="https://github.com/jacob-armiger">
              Github
            </a>
            <a
              target="_blank"
              href="https://www.linkedin.com/in/jacob-armiger-64189317a/"
            >
              Linkedin
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
