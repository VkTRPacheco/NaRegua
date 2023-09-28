import { BrowserRouter as Router, Switch, Route} from 'react-router-dom'

import './styles.css';

import Header from "./components/Header";
import Sidebar from "./components/Sidebar"
import Agendamentos from './pages/agendamentos';
import Clientes from './pages/clientes';



const Routes = () => {
    return (
        <>
            <Header />
            <div className="container-fluid h-100">
                <div className='row h-100'>
                    <Router>
                        <Sidebar />
                        <Switch>
                            <Route path="/" exact component={Agendamentos} />
                            <Route path="/clientes" exact component={Clientes} />
                        </Switch>
                    </Router>
                </div>
            </div>
        </>
    );
};

export default Routes;