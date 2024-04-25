import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom'; 

const UsersPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [userName, setUserName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        if (token) {
            const [, payload] = token.split('.');
            const decodedToken = JSON.parse(atob(payload));
            if (decodedToken && decodedToken.name) {
                setUserName(decodedToken.name);
            } else {
                navigate('/');
                console.error('Invalid decoded token or missing name:', decodedToken);
            }
        } else {
            navigate('/');
            console.error('Token not found in sessionStorage');
        }
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users', {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
            const fetchedUsers = response.data;
    
            const token = sessionStorage.getItem('token');
            if (token) {
                const [, payload] = token.split('.');
                const decodedToken = JSON.parse(atob(payload));
                if (decodedToken && decodedToken.userId && fetchedUsers.some(user => user.id === decodedToken.userId && user.status === 'blocked')) {
                    sessionStorage.removeItem('token');
                    navigate('/'); 
                    return;
                }
            }
    
            setUsers(fetchedUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    };
    

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCheckboxChange = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleSelectAll = () => {
        if (users.length === 0) {
            return;
        }
    
        if (selectAll) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(user => user.id));
        }
        setSelectAll(!selectAll);
    };

    const handleLogout = () => {
        sessionStorage.removeItem('token');
        navigate('/');
    };

    const handleDelete = async () => {
        try {
            if (selectAll) {
                await axios.delete('http://localhost:5000/api/users/', {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                });
            } else {
                await axios.delete('http://localhost:5000/api/users/', {
                    data: { userIds: selectedUsers },
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                    },
                });
            }
            setSelectedUsers([]);
            setSelectAll(false);
            fetchUsers();
    
            setUsers(users.filter(user => !selectedUsers.includes(user.id)));
        } catch (error) {
            console.error('Failed to delete users:', error);
        }
    };

    const handleBlock = async () => {
        try {
            await axios.put('http://localhost:5000/api/users/block', {
                userIds: selectedUsers,
            }, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
    
            fetchUsers();
    
            setUsers(users.map(user => {
                if (selectedUsers.includes(user.id)) {
                    return { ...user, status: 'blocked' };
                }
                return user;
            }));
        } catch (error) {
            console.error('Failed to block users:', error);
        }
    };
    
    const handleUnblock = async () => {
        try {
            await axios.put('http://localhost:5000/api/users/unblock', {
                userIds: selectedUsers,
            }, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
            fetchUsers();
    
            setUsers(users.map(user => {
                if (selectedUsers.includes(user.id)) {
                    return { ...user, status: 'active' };
                }
                return user;
            }));
        } catch (error) {
            console.error('Failed to unblock users:', error);
        }
    };
    
    return (
        <div style={{ height: '100vh', userSelect: 'none' }}>
            <Navbar name={userName} onLogout={handleLogout} />
            <div className="d-flex justify-content-center mt-4">
                <div className="table-responsive" style={{ maxWidth: '800px' }}>
                    <table className="table table-bordered table-hover shadow">
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                                </th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Last Login</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <input type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => handleCheckboxChange(user.id)} />
                                    </td>
                                    <td>{user.id}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.last_login}</td>
                                    <td>{user.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="d-flex justify-content-center mt-4">
                <button className="btn btn-danger me-2" onClick={handleDelete}>Delete</button>
                <button className="btn btn-warning me-2" onClick={handleBlock}>Block</button>
                <button className="btn btn-success" onClick={handleUnblock}>Unblock</button>
            </div>
        </div>
    );
};

export default UsersPage;
