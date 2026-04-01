import './InfoBar.css'
import Bar from './assets/BR2.svg'

export default function InfoBar() {
    return (
        <div className="InfoBar">
        <div className="imag">
            <img src={Bar} className="Bar" alt="Bar" />
        </div>
        </div>
    )
}