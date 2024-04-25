import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post('http://localhost:5000/api/login', { email, password });

            sessionStorage.setItem('token', response.data.token);
            await axios.put(`http://localhost:5000/api/users/${response.data.user.id}/lastlogin`);

            navigate('/UsersPage');
        } catch (error) {
            if (error.response.status === 403) {
                setError('This user is blocked');
            } else {
                setError('Incorrect email or password');
            }
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', userSelect: 'none' }}>
            <div className="card" style={{ width: '300px' }}>
                <div className="card-body">
                    <h1 className="card-title text-center">Login</h1>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">Email:</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password:</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Login</button>
                    </form>
                </div>
                <div className="card-footer text-center">
                    <p>Don't have an account? <Link to="/Register">Register</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Login;
