import Head from 'next/head'
import Image from 'next/image'
import NavBar from '../components/navBar'

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
          width={480}
          height={727}
        />

        <div className="content">
          <h1 className="title">
            Jacob Armiger
          </h1>

          <p>
            Welcome to my portfolio!
          </p>
          <p>
            This is my short bio! jdklfjklsdfk  jdkslfjks jdi jidfj eifie jdklfjklsdfk
            dfjksld fdks ljkd dkjfdfi eji foep klf i fep kofekf fjefepoe ke keo profilef
            fejfiej feji efpe ekef kpe kef ifkeo feo pfoe pe jfope oekp ep keof ke
          </p>
        </div>
      </main>

    </>
  )
}
