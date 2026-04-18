import { Navigate, Route, Routes } from 'react-router-dom'
import { MultimediaProvider } from './MultimediaContext'
import './App.css'
import Bar from './Bar'
import Home from './Home'
import InfoBar from './InfoBar'
import Multi from './Multi'
import Swipe from './Swipe'

export default function App() {
  return (
    <>
    <Routes>
      <Route path='/' element ={ 
        <> 
        <InfoBar/>
        <Home/>
        </>
        }
        />
        {/* MultimediaProvider comparte estado de filtros entre Multi y Swipe en esta ruta. */}
        <Route
          path="/multimedia"
          element={
            <MultimediaProvider>
              <div className="multimedia-page">
                <Multi />
                <main className="multimedia-swipe-mount">
                  <Swipe />
                </main>
              </div>
            </MultimediaProvider>
          }
        />
        <Route path='*' element={<Navigate to="/" replace />}/>
    </Routes>
    <Bar/>
    </>
  )
}
