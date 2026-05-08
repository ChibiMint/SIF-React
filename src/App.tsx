import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Bar from './Bar'
import Home from './Home'
import InfoBar from './InfoBar'
import Redes from './Redes'	
import ItemDetail from './ItemDetail'
import MultimediaLayout from './MultimediaLayout'
import Swipe from './Swipe'
import Tienda from './Tienda'
import Wiki from './Wiki'

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
      <Route path='/redes' element={
        <>
        <Redes/>
        </>
        }
        />
        <Route path='/tienda' element={
        <>
        <Tienda/>
        </>
        }
        />
        <Route path='/wiki' element={
        <>
        <Wiki/>
        </>
        }
        />
    </Routes>
    <Bar/>
    </>
  )
}
