import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import NavBar from "../components/navBar";

export default function Resume() {
  return (
    <>
      <Head>
        <title>Armiger Community</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <main>
        <div className="entry">
          <Image
            src="/images/ewb.jpg"
            alt="Picture of me"
            quality={100}
            width={717}
            height={586}
          />

          <div className="content">
            <h1>Engineering Without Borders</h1>
            <i>Personal Committee Vice Chair</i>
            <p>
              This organization solves problems for both its local community and
              abroad with multidisciplinary engineering projects. We recently
              designed and built a solar powered charging station that is to be
              installed at a local bus stop!
            </p>

            <a target="_blank " href="https://www.ewbutk.com/">
              Chapter Website
            </a>
          </div>
        </div>

        <div className="entry">
          <Image
            src="/images/hack4impact_logo.png"
            alt="Picture of me"
            quality={100}
            width={717}
            height={586}
          />

          <div className="content">
            <h1>Hack4Impact</h1>
            <i>Bootcamp Member</i>
            <p>
              This organization solves problems for non-profit organizations via
              software solutions. I'm currently in the organization's bootcamp
              to learn the MERN tech stack!
            </p>

            <a target="_blank " href="https://github.com/hack4impact-utk">
              Chapter Github
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
