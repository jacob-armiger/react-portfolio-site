import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/layout'
import NavBar from '../components/navBar'

export default function Resume() {
  return (
    <>
      <Head>
        <title>Armiger Resume</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />
      <main>
        <h1>First Post</h1>
        <h2>
          <Link href="/">
            <a>Back to home</a>
          </Link>
        </h2>
      </main>
    </>
  )
}