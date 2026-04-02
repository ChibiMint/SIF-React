import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Bar from './Bar'
import Home from './Home'
import InfoBar from './InfoBar'
import Multi from './Multi'

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
        <Route path='/multimedia' element= {<Multi/>}/>
        <Route path='*' element={<Navigate to="/" replace />}/>
    </Routes>
    <Bar/>
    </>
  )
}
