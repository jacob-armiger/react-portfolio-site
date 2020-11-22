import Link from 'next/link'
import styles from './navBar.module.css'

var activeTab = 0;

function setActive(props) {
  activeTab = props
}

function color(props) {
  if(props == activeTab) {
    return "#b6c3c9";
  } else {
    return "white";
  }
  
}

class NavBar extends React.Component {
  render() {
    return(
      <ul className={styles.navbar}>
        <li className={styles.tab} style={{background: color(0)}} onClick={() => {setActive(0)}}><Link href="/"><a>HOME</a></Link></li>
        <li className={styles.tab} style={{background: color(1)}} onClick={() => {setActive(1)}}><Link href="/resume"><a>RESUME</a></Link></li>
        <li className={styles.tab} style={{background: color(2)}} onClick={() => {setActive(2)}}><Link href="/projects"><a>PROJECTS</a></Link></li>
        <li className={styles.tab} style={{background: color(3)}} onClick={() => {setActive(3)}}><Link href="/community"><a>COMMUNITY</a></Link></li>
      </ul>
    )
  }
}

export default NavBar