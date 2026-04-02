import { Link } from 'react-router-dom'
import './Bar.css'
import b1 from './assets/B1.svg'
import b2 from './assets/B2.svg'
import b4 from './assets/B4.svg'
import b6 from './assets/B6.svg'
import b5 from './assets/B5.svg'

export default function Bar() {
  return (
    <div className="bottom-bar">
      <Link to="/" className="nav-btn home">
        <img src={b1} alt="Inicio" height={80} />
      </Link>
      <a
        href="https://www.instagram.com"
        className="nav-btn redes"
        target="_blank"
        rel="noreferrer"
      >
        <img src={b2} alt="Redes" height={80} />
      </a>
      <Link to="/multimedia" className="nav-btn multimedia">
        <img src={b4} alt="Multi" height={80} />
      </Link>
      <a
        href="https://www.tiktok.com"
        className="nav-btn tienda"
        target="_blank"
        rel="noreferrer"
      >
        <img src={b6} alt="Tienda" height={80} />
      </a>
      <a
        href="https://www.wikipedia.org"
        className="nav-btn wiki"
        target="_blank"
        rel="noreferrer"
      >
        <img src={b5} alt="Wiki" height={80} />
      </a>
    </div>
  )
}
