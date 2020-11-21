import Link from 'next/link'
import styles from './navBar.module.css'

class NavBar extends React.Component {
  render() {
    return(
      <ul className={styles.navbar}>
        <li className={styles.tab}><Link href="/"><a>HOME</a></Link></li>
        <li className={styles.tab}><Link href="/resume"><a>RESUME</a></Link></li>
        <li className={styles.tab}><Link href=""><a>PROJECTS</a></Link></li>
        <li className={styles.tab}><Link href=""><a>COMMUNITY</a></Link></li>
      </ul>
    )
  }
}

export default NavBar