import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { createPost, getAllPosts, deletePost, toggleLike, get_likes_by_post, getCommentsByPost} from '@/config/redux/action/postAction';
import { useDispatch, useSelector } from 'react-redux';
import { getAboutUser, getAllUsers } from '@/config/redux/action/authAction';
import CommentSection from '@/Components/Comment';
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from '@/layout/DashboardLayout';
import CommentModal from '@/Components/CommentModal';
import styles from "./styles.module.css";
import { BASE_URL } from '@/config';

export default function Dashboard() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const postState = useSelector((state) => state.posts);

  const [postContent, setPostContent] = useState("");
  const [fileContent, setFileContent] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sortOrder, setSortOrder] = useState('latest');
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [currentLikesPostId, setCurrentLikesPostId] = useState(null);
  const [showComments, setShowComments] = useState({});
  const [commentModalState, setCommentModalState] = useState({
  isOpen: false,
  postId: null
});
const [page, setPage] = useState(1);



  useEffect(() => {
  if (authState.isTokenThere) {
    dispatch(getAllPosts({ page: 1, limit: 10 }));
    dispatch(getAboutUser());
  }

  if (!authState.all_profiles_fetched) {
    dispatch(getAllUsers());
  }
}, [authState.isTokenThere, dispatch]);


  useEffect(() => {
  if (postState.posts && postState.posts.length > 0) {
    postState.posts.forEach(post => {
      if (post.likesCount > 0) {
        dispatch(get_likes_by_post({ post_id: post._id }));
      }
    });
  }
}, [postState.posts, dispatch]);

useEffect(() => {
  if (postState.posts && postState.posts.length > 0) {
    postState.posts.forEach(post => {
      dispatch(getCommentsByPost({ post_id: post._id, page: 1 }));
    });
  }
}, [postState.posts, dispatch]);



useEffect(() => {
  const handleScroll = () => {
    const scrollComponent = document.getElementById('scrollComponent');
    if (scrollComponent) {
      const { scrollTop, scrollHeight, clientHeight } = scrollComponent;
      if (scrollTop + clientHeight >= scrollHeight - 100 && !isLoading && postState.pagination?.hasMore) {
        loadMorePosts();
      }
    }
  };

  const scrollComponent = document.getElementById('scrollComponent');
  if (scrollComponent) {
    scrollComponent.addEventListener('scroll', handleScroll);
  }

  return () => {
    if (scrollComponent) {
      scrollComponent.removeEventListener('scroll', handleScroll);
    }
  };
}, [page, isLoading, postState.pagination?.hasMore]);

  const handleUpload = async () => {
    if (!postContent && !fileContent) return;
    setIsLoading(true);
    await dispatch(createPost({ file: fileContent, body: postContent }));
    setPostContent("");
    setFileContent(null);
    setPreviewUrl(null);
    setIsLoading(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileContent(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleDeletePost = async (postId) => {
    if (isDeleting) return;
    
    if (confirm("Are you sure you want to delete this post?")) {
      setIsDeleting(true);
      await dispatch(deletePost({ post_id: postId }));
      dispatch(getAllPosts());
      setIsDeleting(false);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'latest' ? 'earliest' : 'latest');
  };

  const getSortedPosts = () => {
    if (!postState.posts) return [];
    
    return [...postState.posts].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      return sortOrder === 'latest' 
        ? dateB - dateA 
        : dateA - dateB; 
    });
  };

  const generateUsername = (name) => {
    if (!name) return '';
    return '@' + name.toLowerCase().replace(/\s+/g, '_');
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

  const handleShowComments = (postId) => {
  setShowComments(prev => ({
    ...prev,
    [postId]: !prev[postId]
  }));
  
  if (!showComments[postId]) {
    dispatch(getCommentsByPost({ post_id: postId }));
  }
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


const [isAuthLoading, setIsAuthLoading] = useState(true);

const loadMorePosts = () => {
  if (postState.pagination && postState.pagination.hasMore) {
    const nextPage = page + 1;
    dispatch(getAllPosts({ page: nextPage, limit: 10 }));
    setPage(nextPage);
  }
};

  if (authState.user) {
    return (
      <UserLayout>
        <DashboardLayout>
          <div className={styles.scrollComponent}>
            <div>
              <div className={styles.createPostcontainer}>
                <img 
                  src={`${BASE_URL}/uploads/${authState.user?.profilePicture || 'default.png'}`} 
                  alt="Profile" 
                  className={styles.userProfile} 
                  onError={(e) => { e.target.src = '/images/default-profile.png'; }} 
                />
                <textarea 
                  onChange={(e) => setPostContent(e.target.value)} 
                  value={postContent} 
                  placeholder="What's on your mind?"
                />
                <label htmlFor="fileUpload">
                  <div className={styles.Fab} title="Add photo">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> </svg>
                  </div>
                </label>
                <input onChange={handleFileChange} type="file" hidden id="fileUpload" accept="image/*" />
                {(postContent.length > 0 || previewUrl) && (
                  <button 
                    onClick={handleUpload} 
                    className={styles.uploadButton} 
                    disabled={isLoading}
                  >
                    {isLoading ? <div className={styles.loader}></div> : "Share"}
                  </button>
                )}
              </div>

              {previewUrl && (
                <div className={styles.previewContainer}>
                  <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                </div>
              )}

              <div className={styles.sortToggleContainer}>
                <button 
                  onClick={toggleSortOrder} 
                  className={styles.sortToggleButton} 
                  title={`Currently showing ${sortOrder === 'latest' ? 'newest' : 'oldest'} posts first`}
                >
                  {sortOrder === 'latest' ? 'Most Recent' : 'Oldest First'}
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16" style={{ marginLeft: '8px' }}> <path strokeLinecap="round" strokeLinejoin="round" d={sortOrder === 'latest' ? 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12' : 'M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4'} /> </svg>
                </button>
              </div>

              <div className={styles.postContainers}>
                {getSortedPosts().length > 0 ? (
                  getSortedPosts().map((post) => (
                    <div className={styles.singleCard} key={post._id}>
                      <div className={styles.singleCard__profileContainer}>
                        <img src={`${BASE_URL}/uploads/${post.userId?.profilePicture || 'default.png'}`} alt="Profile" className={styles.userProfile} onError={(e) => { e.target.src = '/images/default-profile.png'; }} />
                        <div className={styles.userInfo}>
                          <p className={styles.userName}>{post.userId?.name}</p>
                          <p className={styles.userHandle}>{generateUsername(post.userId?.name)}</p>
                        </div>

                        {post.userId?._id === authState.user?._id && (
                          <button className={styles.deleteButton} onClick={() => handleDeletePost(post._id)} disabled={isDeleting} title="Delete post">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20"> <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /> </svg>
                          </button>
                        )}
                      </div>
                    
                      <div className={styles.singleCard__content}>
                        <p>{post.body}</p>
                        {post.media && (
                          <img src={`${BASE_URL}/uploads/${post.media}`} alt="Post media" className={styles.postMedia} onError={(e) => { e.target.style.display = 'none'; }} />
                        )}
                      </div>

                      <div className={styles.optionsContainer}>
                        <div className={styles.singleOption__optionsConatiner} onClick={() => handleToggleLike(post._id)}>
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
                              onError={(e) => { e.target.src = '/images/default-profile.png'; }}
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
                      <CommentModal 
                      isOpen={commentModalState.isOpen} 
                      onClose={closeCommentModal} 
                      postId={commentModalState.postId} 
                      />
                    </div>
                  ))
                ) : (
                  <div className={styles.singleCard} style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#65676b' }}>No posts to display. Be the first to share something!</p>
                  </div>
                )}
              </div>
              {postState.pagination?.hasMore && (
                <div className={styles.singleCard} style={{ textAlign: 'center', padding: '1rem' }}>
                  <div className={styles.loader}></div>
                </div>
              )}
            </div>
            {showLikesModal && (
              <div className={styles.likesModalOverlay}>
                <div className={styles.likesModal}>
                  <div className={styles.likesModalHeader}>
                    <button 
                    className={styles.backButton} 
                    onClick={closeLikesModal}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}     stroke="currentColor" width="24" height="24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                      </svg>
                    </button>
                  <h3>People who liked this post</h3>
                  </div>
        
              <div className={styles.likesModalContent}>
                {postState.currentPostLikes[currentLikesPostId]?.allLikes?.length > 0 ? (
                  postState.currentPostLikes[currentLikesPostId].allLikes.map((user) => (
                    <div key={user._id} className={styles.likeUserItem}>
                      <img 
                        src={`${BASE_URL}/uploads/${user.profilePicture || 'default.png'}`} 
                        alt={user.name} 
                        className={styles.likeUserAvatar}
                        onError={(e) => { e.target.src = '/images/default-profile.png'; }}
                      />
                      <div className={styles.likeUserInfo}>
                        <p className={styles.likeUserName}>{user.name}</p>
                        <p className={styles.likeUserHandle}>{generateUsername(user.name)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className={styles.noLikesMessage}>No likes to display</p>
                )}
              </div>
                </div>
              </div>
           )}
          </div>
        </DashboardLayout>
      </UserLayout>
    );
  }
  return null;
}