import { Outlet } from 'react-router-dom'
import { MultimediaProvider } from './MultimediaContext'
import Multi from './Multi'
import './App.css'

/** Layout de /multimedia: filtros arriba y <Outlet /> para el carrusel o la ficha de detalle. */
export default function MultimediaLayout() {
  return (
    <MultimediaProvider>
      <div className="multimedia-page">
        <Multi />
        <main className="multimedia-swipe-mount">
          <Outlet />
        </main>
      </div>
    </MultimediaProvider>
  )
}
