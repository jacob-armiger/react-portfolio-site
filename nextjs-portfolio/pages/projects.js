import Head from 'next/head'
import Link from 'next/link'
import Layout from '../components/layout'
import NavBar from '../components/navBar'

export default function Resume() {
  return (
    <>
      <Head>
        <title>Armiger Projects</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <NavBar />

      <main>
        <h1>Projects</h1>
      </main>
    </>
  )
}