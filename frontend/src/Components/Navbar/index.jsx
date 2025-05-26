import React from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '@/config/redux/action/authAction';
import styles from './styles.module.css';

export default function Navbar() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, loggedIn } = useSelector(state => state.auth);
  
  const handleLogout = () => {
    dispatch(logoutUser());
    router.push('/');
  };
  
  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <div 
          className={styles.logo}
          onClick={() => router.push('/')}
        >
          Pro Connect
        </div>
        
        <div className={styles.navbarOptions}>
          {loggedIn ? (
            <>
              <div className={styles.userSection}>
                <span className={styles.userName}>
                  Hey, {user?.name || 'User'}
                </span>
                <span 
                  className={styles.profileLink}
                  onClick={() => router.push('/profile')}
                >
                  Profile
                </span>
              </div>
              
              <button 
                onClick={handleLogout}
                className={styles.buttonLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <button 
              onClick={() => router.push('/login')}
              className={styles.buttonJoin}
            >
              Be a part
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
