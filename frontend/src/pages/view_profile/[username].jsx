import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { toggleConnectionRequest, downloadProfile } from '@/config/redux/action/authAction';
import { toggleLike, get_likes_by_post, getCommentsByPost } from '@/config/redux/action/postAction';
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import CommentModal from '@/Components/CommentModal';
import styles from './styles.module.css';
import { BASE_URL } from '@/config';

export default function ViewProfilePage({ userProfile, user, connectionStatus, posts }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { username } = router.query;
  const postState = useSelector((state) => state.posts);
  
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [currentLikesPostId, setCurrentLikesPostId] = useState(null);
  const [commentModalState, setCommentModalState] = useState({
    isOpen: false,
    postId: null
  });

  const handleDownloadResume = async () => {
    if (user && user._id) {
      await dispatch(downloadProfile(user._id));
    }
  };

  useEffect(() => {
    if (posts && posts.length > 0) {
      posts.forEach(post => {
        if (post.likesCount > 0) {
          dispatch(get_likes_by_post({ post_id: post._id }));
        }
        dispatch(getCommentsByPost({ post_id: post._id, page: 1 }));
      });
    }
  }, [posts, dispatch]);

  const handleToggleConnection = async () => {
    if (user && user._id) {
      await dispatch(toggleConnectionRequest({ connectionId: user._id }));
      router.replace(router.asPath);
    }
  };
  
  const handleToggleLike = async (postId) => {
    await dispatch(toggleLike({ post_id: postId }));
  };

  const isPostLikedByUser = (postId) => {
    return Boolean(postState.likedByUser && postState.likedByUser[postId]);
  };

  const handleShowLikes = (postId) => {
    setCurrentLikesPostId(postId);
    dispatch(get_likes_by_post({ post_id: postId }));
    setShowLikesModal(true);
  };

  const closeLikesModal = () => {
    setShowLikesModal(false);
    setCurrentLikesPostId(null);
  };

  const openCommentModal = (postId) => {
    setCommentModalState({
      isOpen: true,
      postId
    });
  };

  const closeCommentModal = () => {
    setCommentModalState({
      isOpen: false,
      postId: null
    });
  };

  const generateUsername = (name) => {
    if (!name) return '';
    return '@' + name.toLowerCase().replace(/\s+/g, '_');
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.backdropContainer}>
          <div className={styles.backdrop}></div>
          <div className={styles.profileContainer}>

            <div className={styles.profileHeader}>
              <div className={styles.profilePicture}>
                {user?.profilePicture ? (
                  <img
                    src={`${BASE_URL}/uploads/${user.profilePicture}`}
                    alt={user.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div className={styles.profileInitial}>
                    {user?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              
              <div className={styles.profileInfo}>
                <h1>{user?.name}</h1>
                <p className={styles.profileUsername}>@{user?.username}</p>
                
                <div className={styles.profileActions}>
                  {connectionStatus?.isConnection ? (
                    <span className={styles.connected}>Connected</span>
                  ) : connectionStatus?.requestSent ? (
                    <span className={styles.requestSent}>Connection Request Sent</span>
                  ) : (
                    <button 
                      className={styles.connectBtn}
                      onClick={handleToggleConnection}
                    >
                      Connect
                    </button>
                  )}
                  
                  <button 
                    className={styles.downloadBtn}
                    onClick={handleDownloadResume}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                      <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                    </svg>
                    Download Resume
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.profileDetails}>
              <section className={styles.profileSection}>
                <h3>Bio</h3>
                <p>{userProfile?.bio || "No bio available"}</p>
              </section>
              <section className={styles.profileSection}>
                <h3>Current Position</h3>
                <p>{userProfile?.currentPost || "No current position listed"}</p>
              </section>
              {userProfile?.education?.length > 0 && (
                <section className={styles.profileSection}>
                  <h3>Education</h3>
                  {userProfile.education.map((edu, index) => (
                    <div key={index} className={styles.profileEducation}>
                      <h4>{edu.institution}</h4>
                      <p>
                        {edu.degree}
                        {edu.fieldOfStudy && `, ${edu.fieldOfStudy}`}
                        {(edu.startYear || edu.endYear) && ` (${edu.startYear}${edu.startYear && edu.endYear ? ' - ' : ''}${edu.endYear})`}
                      </p>
                    </div>
                  ))}
                </section>
              )}

              {userProfile?.experience?.length > 0 && (
                <section className={styles.profileSection}>
                  <h3>Past Work</h3>
                  {userProfile.experience.map((work, index) => (
                    <div key={index} className={styles.profileExperience}>
                      <h4>{work.company}</h4>
                      <p>
                        {work.position}
                        {(work.startYear || work.endYear) && ` (${work.startYear}${work.startYear && work.endYear ? ' - ' : ''}${work.endYear})`}
                      </p>
                    </div>
                  ))}
                </section>
              )}

              {userProfile?.skills?.length > 0 && (
                <section className={styles.profileSection}>
                  <h3>Skills</h3>
                  <p>{userProfile.skills.join(', ')}</p>
                </section>
              )}
            </div>

            <div className={styles.profilePosts}>
              <h3>Posts</h3>
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <div className={styles.postCard} key={post._id}>
                    <div className={styles.postHeader}>
                      <img
                        src={`${BASE_URL}/uploads/${post.userId?.profilePicture || 'default.png'}`}
                        alt={post.userId?.name || user?.name}
                        className={styles.profilePicture}
                        onError={(e) => { e.target.src = `${BASE_URL}/uploads/default.png`; }}
                        style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }}
                      />
                      <span className={styles.postAuthor}>{post.userId?.name || user?.name}</span>
                      <span className={styles.postDate}>{post.formattedDate}</span>
                    </div>
                    <div className={styles.postContent}>{post.body || post.content}</div>
                    {post.media && (
                      <div className={styles.postMediaWrapper}>
                        <img
                          src={`${BASE_URL}/uploads/${post.media}`}
                          alt="Post media"
                          className={styles.postMedia}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    
                    <div className={styles.optionsContainer}>
                      <div 
                        className={styles.singleOption__optionsConatiner} 
                        onClick={() => handleToggleLike(post._id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill={isPostLikedByUser(post._id) ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
                        </svg>
                        <p>{post.likesCount || post.likes?.length || 0}</p>
                      </div>
                      
                      <div className={styles.singleOption__optionsConatiner}>
                        <button onClick={() => openCommentModal(post._id)} className={styles.commentButton} style={{display: "flex", alignItems: "center", gap: "5px", background: "none", border: "none", cursor: "pointer"}}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
                          </svg>
                          <p>{postState.commentCountsByPostId[post._id] || 0}</p>
                        </button>
                      </div>
                      
                      <div className={styles.singleOption__optionsConatiner}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                        </svg>
                      </div>
                    </div>
                    
                    {(post.likesCount > 0 || post.likes?.length > 0) && (
                      <div className={styles.likedByUsers}>
                        <div className={styles.likedAvatars}>
                          {postState.currentPostLikes[post._id]?.previewLikes?.slice(0, 3).map((user, index) => (
                            <img 
                              key={user._id}
                              src={`${BASE_URL}/uploads/${user.profilePicture || 'default.png'}`}
                              alt={user.name}
                              className={styles.likedAvatar}
                              style={{ marginLeft: index > 0 ? '-8px' : '0' }}
                              onError={(e) => { e.target.src = `${BASE_URL}/uploads/default.png`; }}
                            />
                          ))}
                        </div>
                        <p className={styles.likedByText} onClick={() => handleShowLikes(post._id)}>
                          {post.likesCount === 1 
                            ? 'Liked by 1 person' 
                            : `Liked by ${post.likesCount || post.likes?.length} people`}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className={styles.noPosts}>No posts yet.</p>
              )}
            </div>
          </div>
        </div>
        
        {showLikesModal && (
          <div className={styles.likesModalOverlay}>
            <div className={styles.likesModal}>
              <div className={styles.likesModalHeader}>
                <button 
                  className={styles.backButton} 
                  onClick={closeLikesModal}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                </button>
                <h3>Likes</h3>
              </div>
              <div className={styles.likesModalContent}>
                {currentLikesPostId && postState.currentPostLikes[currentLikesPostId]?.allLikes?.length > 0 ? (
                  postState.currentPostLikes[currentLikesPostId].allLikes.map(user => (
                    <div key={user._id} className={styles.likeUserItem}>
                      <img 
                        src={`${BASE_URL}/uploads/${user.profilePicture || 'default.png'}`}
                        alt={user.name}
                        className={styles.likeUserAvatar}
                        onError={(e) => { e.target.src = `${BASE_URL}/uploads/default.png`; }}
                      />
                      <div className={styles.likeUserInfo}>
                        <h4 className={styles.likeUserName}>{user.name}</h4>
                        <p className={styles.likeUserHandle}>@{user.username}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.noLikesMessage}>No likes yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {commentModalState.isOpen && (
          <CommentModal 
            postId={commentModalState.postId}
            onClose={closeCommentModal}
          />
        )}
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  const { username } = context.params;
  const token = context.req.cookies.token;
  
  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const profileResponse = await axios.get(`${BASE_URL}/user/profile/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const postsResponse = await axios.get(`${BASE_URL}/posts/user/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return {
      props: {
        userProfile: profileResponse.data.profile || null,
        user: profileResponse.data.user || null,
        connectionStatus: profileResponse.data.connectionStatus || { isConnection: false, requestSent: false },
        posts: postsResponse.data.posts || []
      },
    };
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return {
      props: {
        userProfile: null,
        user: null,
        connectionStatus: { isConnection: false, requestSent: false },
        posts: []
      },
    };
  }
}