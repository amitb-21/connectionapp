import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyConnectionRequests, whatAreMyConnections, acceptConnectionRequest, rejectConnectionRequest } from '@/config/redux/action/authAction';
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import styles from './styles.module.css';
import { BASE_URL } from '@/config';

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const { connections, connectionRequests, isLoading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('connections');

  useEffect(() => {
    dispatch(whatAreMyConnections());
    dispatch(getMyConnectionRequests());
  }, [dispatch]);

  const handleAcceptRequest = (userId) => {
    dispatch(acceptConnectionRequest({ userId }))
      .then(() => {
        dispatch(whatAreMyConnections());
        dispatch(getMyConnectionRequests());
      });
  };

  const handleRejectRequest = (userId) => {
    dispatch(rejectConnectionRequest({ userId }))
      .then(() => {
        dispatch(getMyConnectionRequests());
      });
  };

  return (
    <div className={styles.container}>
      <UserLayout>
        <DashboardLayout>
          <div className={styles.connectionsContainer}>
            <h1 className={styles.pageTitle}>My Network</h1>
            
            <div className={styles.tabsContainer}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'connections' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('connections')}
              >
                Connections ({connections?.length || 0})
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'requests' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                Requests ({connectionRequests?.length || 0})
              </button>
            </div>

            {isLoading ? (
              <div className={styles.loadingContainer}>
                <p>Loading...</p>
              </div>
            ) : (
              <div className={styles.contentContainer}>
                {activeTab === 'connections' ? (
                  <div className={styles.connectionsGrid}>
                    {connections && connections.length > 0 ? (
                      connections.map((connection) => (
                        <div key={connection._id} className={styles.connectionCard}>
                          <div className={styles.profileImageContainer}>
                            <img
                              src={connection.profilePicture ? `${BASE_URL}/uploads/${connection.profilePicture}` : '/images/default-profile.png'}
                              alt={connection.name}
                              className={styles.profileImage}
                              onError={(e) => { e.target.src = '/images/default-profile.png'; }}
                            />
                          </div>
                          <div className={styles.connectionInfo}>
                            <h3 className={styles.connectionName}>{connection.name}</h3>
                            <p className={styles.connectionUsername}>@{connection.username}</p>
                          </div>
                          <button 
                            className={styles.viewProfileButton}
                            onClick={() => window.location.href = `/view_profile/${connection.username}`}
                          >
                            View Profile
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        <p>You don't have any connections yet.</p>
                        <p>Connect with other users to grow your network!</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.requestsContainer}>
                    {connectionRequests && connectionRequests.length > 0 ? (
                      connectionRequests.map((request) => (
                        <div key={request._id} className={styles.requestCard}>
                          <div className={styles.requestProfile}>
                            <img
                              src={request.profilePicture ? `${BASE_URL}/uploads/${request.profilePicture}` : '/images/default-profile.png'}
                              alt={request.name}
                              className={styles.requestProfileImage}
                              onError={(e) => { e.target.src = '/images/default-profile.png'; }}
                            />
                            <div className={styles.requestInfo}>
                              <h3 className={styles.requestName}>{request.name}</h3>
                              <p className={styles.requestUsername}>@{request.username}</p>
                            </div>
                          </div>
                          <div className={styles.requestActions}>
                            <button 
                              className={styles.acceptButton}
                              onClick={() => handleAcceptRequest(request._id)}
                            >
                              Accept
                            </button>
                            <button 
                              className={styles.rejectButton}
                              onClick={() => handleRejectRequest(request._id)}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className={styles.emptyState}>
                        <p>You don't have any pending connection requests.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </DashboardLayout>
      </UserLayout>
    </div>
  );
}
