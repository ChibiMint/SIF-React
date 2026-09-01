import { Outlet, useLocation } from 'react-router-dom'
import { MultimediaProvider } from './MultimediaContext'
import Multi from './Multi'
import './App.css'

export default function MultimediaLayout() {
  const location = useLocation()
  const isCarousel = location.pathname === '/multimedia'

  return (
    <MultimediaProvider>
      <div className={`multimedia-page ${isCarousel ? 'multimedia-page--carousel' : 'multimedia-page--detail'}`}>
        {isCarousel && <Multi />}

        <main className="multimedia-swipe-mount">
          <Outlet />
        </main>
      </div>
    </MultimediaProvider>
  )
}