import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Bar from './Bar'
import Home from './Home'
import InfoBar from './InfoBar'
import ItemDetail from './ItemDetail'
import MultimediaLayout from './MultimediaLayout'
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
        <Route path="/multimedia" element={<MultimediaLayout />}>
          <Route index element={<Swipe />} />
          <Route path="item/:itemId" element={<ItemDetail />} />
        </Route>
        <Route path='*' element={<Navigate to="/" replace />}/>
    </Routes>
    <Bar/>
    </>
  )
}
