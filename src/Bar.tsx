import './Bar.css'
import b1 from './assets/B1.svg'
import b2 from './assets/B2.svg'
import b4 from './assets/B4.svg'
import b6 from './assets/B6.svg'
import b5 from './assets/B5.svg'

export default function Bar() {
  return (
    <div className="bottom-bar">
      <a href="https://www.facebook.com/profile.php?id=100084039139066" className="nav-btn home">
        <img src={b1} alt="Inicio" height={80} />
      </a>
      <a href="https://www.instagram.com" className="nav-btn redes">
        <img src={b2} alt="Redes" height={80} />
      </a>
      <a href="https://www.youtube.com" className="nav-btn multimedia">
        <img src={b4} alt="Multi" height={80} />
      </a>
      <a href="https://www.tiktok.com" className="nav-btn tienda">
        <img src={b6} alt="Tienda" height={80} />
      </a>
      <a href="https://www.wikipedia.org" className="nav-btn wiki">
        <img src={b5} alt="Wiki" height={80} />
      </a>
    </div>
  )
}
