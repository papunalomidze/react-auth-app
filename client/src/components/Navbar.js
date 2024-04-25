import React from 'react';

const Navbar = ({ name, onLogout }) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <a className="navbar-brand" href="#">Navbar</a>
                <ul className="navbar-nav me-auto">
                    <li className="nav-item">
                        <a>Hello, {name}</a>
                    </li>
                </ul>
                <button className="btn btn-outline-danger" onClick={onLogout}>Logout</button>
            </div>
        </nav>
    );
};

export default Navbar;
