import React from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import UsersPage from './UsersPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';
import Register from './Register'

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/UsersPage" element={<UsersPage />} /> 
                <Route path="Register" element={<Register />} />
            </Routes>
        </Router>
    );
};

export default App;
