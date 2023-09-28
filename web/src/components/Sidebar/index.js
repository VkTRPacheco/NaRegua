import { Link, withRouter } from 'react-router-dom';
import NaRégua from '../../assets/NaRégua.png'

const Sidebar = ({ location }) => {
    return (
        <sidebar className="col-2 h-100">
            <img src={NaRégua} className="img-fluid px-3 py-4" />
            <ul className='p-0 m-0'>
                <li>
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                        <span className="mdi mdi-calendar-check"></span>
                        <text>Agendamentos</text>
                    </Link>
                </li>
                <li>
                    <Link to="/clientes" className={location.pathname === '/clientes' ? 'active' : ''}>
                        <span className="mdi mdi-account-multiple"></span>
                        <text>Clientes</text>
                    </Link>
                </li>
            </ul>
        </sidebar >
    )
};

export default withRouter(Sidebar);