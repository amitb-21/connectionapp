// src/Components/LogoutButton/index.js
import React from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '../../config/redux/action/authAction';
import styles from './styles.module.css';

const LogoutButton = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <button 
      className={styles.logoutButton} 
      onClick={handleLogout}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
