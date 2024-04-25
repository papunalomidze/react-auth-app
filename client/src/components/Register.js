import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/register', { name, email, password });
            if (response.status === 201) {
                setError('');
            }
        } catch (error) {
            console.error(error);
            if (error.response && error.response.status === 400) {
                setError('This email is already used');
            } else {
                setError('An error occurred. Please try again later.');
            }
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh', userSelect: 'none' }}>
            <div className="card" style={{ width: '300px' }}>
                <div className="card-body">
                    <h2 className="card-title text-center">Register</h2>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Name:</label>
                            <input
                                type="text"
                                className="form-control"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
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
                        <button type="submit" className="btn btn-primary">Register</button>
                    </form>
                </div>
                <div className="card-footer text-center">
                    <p>Already have an account? <Link to="/">Login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
