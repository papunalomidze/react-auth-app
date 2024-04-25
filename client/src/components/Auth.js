import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);

    const toggleAuth = () => {
        setIsLogin(!isLogin);
    };

    return (
        <div>
            <button onClick={toggleAuth}>{isLogin ? 'Register' : 'Login'}</button>
            {isLogin ? <Login /> : <Register />}
        </div>
    );
};

export default Auth;
