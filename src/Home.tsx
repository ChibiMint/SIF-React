import './Home.css'
import cuadro from './assets/BR3.png'
import iz from './assets/t1.svg'
import der from './assets/t2.svg'

export default function Home() {
    return (
        <div className="home">
        <div className="box">
            <img src={iz} className="iz" alt="iz" />
            <img src={cuadro} className="cuadro" alt="Cuadro" />
            <img src={der} className="der" alt="der" />
        </div>
        <div className="imag">
            <img src={"https://i.idol.st/u/idol/9Minami-Kotori-97bAtR.png"} className="character" alt="character" />
        </div>
        </div>
    )
}