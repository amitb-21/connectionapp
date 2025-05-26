import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import {
  getAllUsers,
  toggleConnectionRequest,
  sendConnectionRequest
} from '@/config/redux/action/authAction';
import styles from './styles.module.css';
import { Button, CircularProgress } from '@mui/material';
import { BASE_URL } from '@/config';

export default function DiscoverPage() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isProcessing, setIsProcessing] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!authState.all_profiles_fetched) {
      dispatch(getAllUsers());
    }
  }, [authState.all_profiles_fetched, dispatch]);

  useEffect(() => {
    if (authState.all_users?.length > 0) {
      const filtered = searchTerm.trim() === ''
        ? authState.all_users
        : authState.all_users.filter(user =>
            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchTerm.toLowerCase())
          );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, authState.all_users]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleToggleConnection = (e, userId) => {
    e.stopPropagation();
    if (isProcessing[userId]) return;
  
    const user = filteredUsers.find(u => u._id === userId);
    if (!user) return;
  
    setIsProcessing(prev => ({ ...prev, [userId]: true }));

    const updateUserStateLocally = () => {
      setFilteredUsers(prev =>
        prev.map(u => {
          if (u._id !== userId) return u;
  
          if (!u.connectionRequestSent && !u.connectionRequestReceived && !u.isConnection) {
            return { ...u, connectionRequestSent: true, connectionRequestReceived: false, isConnection: false };
          }
          if (u.connectionRequestSent) {
            return { ...u, connectionRequestSent: false, connectionRequestReceived: false, isConnection: false };
          }
          if (u.connectionRequestReceived) {
            return { ...u, isConnection: true, connectionRequestSent: false, connectionRequestReceived: false };
          }
          if (u.isConnection) {
            return { ...u, isConnection: false, connectionRequestSent: false, connectionRequestReceived: false };
          }
          return u;
        })
      );
    };
  
    updateUserStateLocally();
  
    const action =
      !user.connectionRequestSent &&
      !user.connectionRequestReceived &&
      !user.isConnection
        ? sendConnectionRequest
        : toggleConnectionRequest;
  
    dispatch(action({ connectionId: userId }))
      .then((result) => {
        if (result.error) {
          setFilteredUsers(prev => prev.map(u => (u._id === userId ? user : u)));
          setErrorMessage(result.payload?.message || 'Error');
          setTimeout(() => setErrorMessage(''), 3000);
        } else {
          dispatch(getAllUsers());
        }
      })
      .catch(() => {
        setFilteredUsers(prev => prev.map(u => (u._id === userId ? user : u)));
        setErrorMessage('Unexpected error');
        setTimeout(() => setErrorMessage(''), 3000);
      })
      .finally(() => {
        setIsProcessing(prev => ({ ...prev, [userId]: false }));
      });
  };
  
  const displayUsers = filteredUsers.filter(
    (user) => user._id !== authState.user?._id
  );

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.discoverContainer}>
          <div className={styles.header}>
            <h1>Discover People</h1>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Search by name or username"
                value={searchTerm}
                onChange={handleSearch}
                className={styles.searchInput}
              />
              <div className={styles.searchIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
              </div>
            </div>
            {errorMessage && (
              <div className={styles.errorMessage}>
                {errorMessage}
              </div>
            )}
          </div>

          {authState.isLoading ? (
            <div className={styles.loading}>Loading users...</div>
          ) : (
            <div className={styles.allUserProfile}>
              {displayUsers.length > 0 ? (
                displayUsers.map((user) => (
                  <div
                    key={user._id}
                    className={styles.userCard}
                    style={{ cursor: 'pointer' }}
                    onClick={() => router.push(`/view_profile/${user.username}`)}
                  >
                    <div className={styles.avatarContainer}>
                      {user.profilePicture ? (
                        <img
                          src={`${BASE_URL}/uploads/${user.profilePicture || 'default.png'}`} 
                          alt={user.name}
                          className={styles.avatar}
                          onError={(e) => { e.target.src = `${BASE_URL}/uploads/default.png`; }}
                        />
                      ) : (
                        <div className={styles.defaultAvatar}>
                          {user.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    <div className={styles.userInfo}>
                      <h2>{user.name}</h2>
                      <p>@{user.username}</p>
                      {user.bio && <p className={styles.userBio}>{user.bio}</p>}
                      <Button
                        variant="contained"
                        color={
                          user.isConnection
                            ? 'secondary'
                            : user.connectionRequestSent
                            ? 'warning'
                            : user.connectionRequestReceived
                            ? 'primary'
                            : 'primary'
                        }
                        onClick={(e) => handleToggleConnection(e, user._id)}
                        disabled={isProcessing[user._id]}
                        startIcon={
                          isProcessing[user._id] ? <CircularProgress size={20} /> : null
                        }
                      >
                        {user.isConnection
                          ? 'Connected'
                          : user.connectionRequestSent
                          ? 'Pending'
                          : user.connectionRequestReceived
                          ? 'Accept'
                          : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noResults}>
                  {searchTerm
                    ? 'No users found matching your search.'
                    : 'No users available to discover.'}
                </div>
              )}
            </div>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
