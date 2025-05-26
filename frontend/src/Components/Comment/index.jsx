import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { commentPost, getCommentsByPost, deleteComment } from '@/config/redux/action/postAction';
import styles from './styles.module.css';
import { BASE_URL } from '@/config';

const Comment = ({ postId, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const postState = useSelector(state => state.posts);
  const [commentText, setCommentText] = useState('');
  const [page, setPage] = useState(1);
  
  // Get comments from the new nested structure
  const comments = postState.commentsByPostId?.[postId] || [];
  const commentPagination = postState.commentPagination?.[postId];
  
  // Fetch comments when component mounts
  useEffect(() => {
    if (postId) {
      dispatch(getCommentsByPost({ post_id: postId, page: 1 }));
    }
  }, [dispatch, postId]);

  const post = useSelector(state => 
    state.posts.posts.find(post => post._id === postId)
  );
  
  const isPostOwner = post && user && post.userId?._id === user._id;

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    
    await dispatch(commentPost({ 
      post_id: postId, 
      commentBody: commentText 
    }));
    
    setCommentText('');
  };

  const handleDeleteComment = async (commentId) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      await dispatch(deleteComment({ 
        comment_id: commentId,
        post_id: postId 
      }));
    }
  };
  
  const loadMoreComments = () => {
    if (commentPagination?.hasMore) {
      const nextPage = page + 1;
      dispatch(getCommentsByPost({ post_id: postId, page: nextPage }));
      setPage(nextPage);
    }
  };

  return (
    <div className={styles.commentContainer}>
      <div className={styles.commentHeader}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="24" height="24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h4>Comments</h4>
      </div>
      
      <div className={styles.commentInputContainer}>
        <img 
          src={`${BASE_URL}/uploads/${user?.profilePicture || 'default.png'}`} 
          alt="Profile" 
          className={styles.userAvatar}
          onError={(e) => { e.target.src = '/images/default-profile.png'; }} 
        />
        <input
          type="text"
          value={commentText}
          onChange={handleCommentChange}
          placeholder="Write a comment..."
          onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
          className={styles.commentInput}
        />
        <button 
          onClick={handleAddComment} 
          className={styles.commentButton}
          disabled={!commentText.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </div>
      
      <div className={styles.commentsList}>
        {comments.map((comment) => (
          <div key={comment._id} className={styles.commentItem}>
            <img 
              src={`${BASE_URL}/uploads/${comment.userId?.profilePicture || 'default.png'}`} 
              alt="Profile" 
              className={styles.commentAvatar}
              onError={(e) => { e.target.src = '/images/default-profile.png'; }} 
            />
            <div className={styles.commentContent}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor}>
                  {comment.userId?.name}
                </span>
                {(comment.userId?._id === user?._id || isPostOwner) && (
                  <button 
                    className={styles.deleteCommentButton}
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
              <p className={styles.commentBody}>{comment.body}</p>
              <span className={styles.commentTime}>
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <div className={styles.noComments}>
            No comments yet. Be the first to comment!
          </div>
        )}
        
        {commentPagination?.hasMore && (
          <button 
            className={styles.loadMoreButton} 
            onClick={loadMoreComments}
          >
            Load more comments
          </button>
        )}
      </div>
    </div>
  );
};

export default Comment;
