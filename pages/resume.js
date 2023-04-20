import Head from "next/head";
import Link from "next/link";
import NavBar from "../components/navBar";

export default function Resume() {
  return (
    <>
      <Head>
        <title>Armiger Resume</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <main>
        <iframe src="/master_resume.pdf" width="50%" height="1000px"></iframe>
      </main>
    </>
  );
}
