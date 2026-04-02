import './Multi.css'
import t1 from './assets/t1.svg'
import t2 from './assets/t2.svg'

export default function Multi() {
    return (
        <div className="songs">
        <div className="grupos">
            <div className="grupo"> <p>μ’s</p> </div>
            <div className="grupo"> <p>Aquors</p> </div>
            <div className="grupo"> <p>Nijigasaki</p> </div>
            <div className="grupo"> <p>Liella</p> </div>
            <div className="grupo"> <p>Hasu no sora</p> </div>
            <div className="grupo"> <p>Ikizu</p> </div>
            <div className="grupo"> <p>Musical</p> </div>
        </div>
        <div className="categorias">
            <div className="categoria"><p>Anime</p></div>
            <div className="categoria"><p>Musica</p></div>
            <div className="categoria"><p>Conciertos</p></div>
            <div className="categoria"><p>Libros</p></div>
            <div className="categoria"><p>Extras</p></div>
            <div className="filtro"><p>Filtros</p></div>
        </div>
        <div className="container">
            <img src={t1} className='buttomS1' alt="prevBtn" height={100} />
            <img src={t2} className='buttomS2' alt="nextBtn" height={100} />
           
           </div>
        <div className="informacion"><p>LoveLive! Series 9th Anniversary Love Live! Fest</p></div>
        </div>
    )
}