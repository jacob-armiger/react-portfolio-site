import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
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
        <div className="entry">
          <Image
            src="/images/comic_list.png"
            alt="Picture of me"
            quality={100}
            width={718}
            height={488}
          />

          <div className="content">
            <h1>comic-list-web-scraper</h1>

            <p>
            This project uses a web scraper to gather a comic book reading order from 
            <a href="https://comicbookreadingorders.com/"> this</a> website and 
            formats the data into a csv file. You can upload the csv file to Excel 
            and make a checklist of comics you've read.
            </p>
      
            <div className = "horizontal_list">
            <i>Python</i>
            <i>Web Scraping</i>
            </div>

            <a target="_blank "href="https://github.com/jacob-armiger/comic-list-web-scraper">Repository</a>
          </div>
        </div>

        <div className="entry">
          <Image
            src="/images/devblog.png"
            alt="Picture of me"
            quality={100}
            width={717}
            height={586}
          />

          <div className="content">
            <h1>django-devblog</h1>

            <p>
            This is a blog website that can be used to give your users updates 
            on project development! There are page tabs for each project team and
            a comment system.
            </p>
      
            <div className = "horizontal_list">
            <i>Python</i>
            <i>Django</i>
            <i>bootstrap</i>
            <i>Heroku</i>
            </div>

            <a target="_blank "href="https://github.com/jacob-armiger/comic-list-web-scraper">Repository</a>
          </div>
        </div>
      </main>
    </>
  )
}