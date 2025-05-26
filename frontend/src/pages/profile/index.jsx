import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateUserProfile, updateProfileData, uploadProfilePicture } from '@/config/redux/action/authAction';
import UserLayout from '@/layout/UserLayout';
import styles from './styles.module.css';
import { BASE_URL } from '@/config';

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  currentPost: z.string().optional(),
  skills: z.string().optional(),
});

export default function Profile() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, profile, isLoading } = useSelector(state => state.auth);
  
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = React.useState(null);
  const [previewImage, setPreviewImage] = React.useState('');
  const [education, setEducation] = React.useState([]);
  const [experience, setExperience] = React.useState([]);
  const [uploadStatus, setUploadStatus] = React.useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      bio: '',
      currentPost: '',
      skills: ''
    }
  });

  useEffect(() => {
    if (user && profile) {
      setValue('name', user.name || '');
      setValue('bio', profile.bio || '');
      setValue('currentPost', profile.currentPost || '');
      setValue('skills', profile.skills ? profile.skills.join(', ') : '');
      
      setEducation(profile.education || []);
      setExperience(profile.experience || []);
    }
  }, [user, profile, setValue]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewImage(URL.createObjectURL(file));
      uploadImageDirectly(file);
    }
  };
  
  const uploadImageDirectly = async (file) => {
    try {
      setUploadStatus('Uploading...');
      const imageData = new FormData();
      imageData.append('profile_picture', file);
      
      const result = await dispatch(uploadProfilePicture(imageData));
      
      if (result.meta.requestStatus === 'fulfilled') {
        setUploadStatus('Upload successful!');
        setTimeout(() => setUploadStatus(''), 3000);
      } else {
        setUploadStatus('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setUploadStatus('Upload failed. Please try again.');
    }
  };

  const addEducation = () => {
    setEducation([...education, { institution: '', degree: '', startYear: '', endYear: '' }]);
  };

  const updateEducation = (index, field, value) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);
  };

  const addExperience = () => {
    setExperience([...experience, { company: '', position: '', startYear: '', endYear: '', description: '' }]);
  };

  const updateExperience = (index, field, value) => {
    const newExperience = [...experience];
    newExperience[index][field] = value;
    setExperience(newExperience);
  };

  const onSubmit = async (data) => {
    await dispatch(updateUserProfile({
      name: data.name,
      bio: data.bio,
      currentPost: data.currentPost
    }));

    await dispatch(updateProfileData({
      education: education,
      experience: experience,
      skills: data.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
    }));
    if (profileImage && uploadStatus !== 'Upload successful!') {
      const imageData = new FormData();
      imageData.append('profile_picture', profileImage);
      await dispatch(uploadProfilePicture(imageData));
    }
  };

  if (!user || !profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <UserLayout>
      <div className={styles.profileContainer}>
        <h1>My Profile</h1>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.profileImageSection}>
            <div 
              className={styles.imageContainer} 
              onClick={() => fileInputRef.current.click()}
              style={{ cursor: 'pointer' }}
            >
              {previewImage || user.profilePicture ? (
                <img 
                  src={previewImage || `${BASE_URL}/uploads/${user.profilePicture}?v=${new Date().getTime()}`} 
                  alt={`${user.name}'s profile`} 
                  key={user.profilePicture} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                  onError={(e) => { e.target.src = '/images/default-profile.png'; }}
                />
              ) : (
                <div className={styles.placeholderImage}>
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
              
              <div className={styles.imageOverlay}>
                <span>Change Photo</span>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageChange} 
              accept="image/*" 
              style={{ display: 'none' }}
            />
            
            {uploadStatus && (
              <div className={styles.uploadStatus}>
                {uploadStatus}
              </div>
            )}
          </div>

          <div className={styles.formSection}>
            <h2>Basic Information</h2>
            <div className={styles.formGroup}>
              <label>Name</label>
              <input {...register('name')} />
              {errors.name && <span className={styles.error}>{errors.name.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Bio</label>
              <textarea {...register('bio')} />
              {errors.bio && <span className={styles.error}>{errors.bio.message}</span>}
            </div>

            <div className={styles.formGroup}>
              <label>Current Position</label>
              <input {...register('currentPost')} />
              {errors.currentPost && <span className={styles.error}>{errors.currentPost.message}</span>}
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Education</h2>
            {education.map((edu, index) => (
              <div key={index} className={styles.educationItem}>
                <input 
                  type="text" 
                  placeholder="Institution" 
                  value={edu.institution} 
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)} 
                />
                <input 
                  type="text" 
                  placeholder="Degree" 
                  value={edu.degree} 
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)} 
                />
                <div className={styles.yearInputs}>
                  <input 
                    type="text" 
                    placeholder="Start Year" 
                    value={edu.startYear} 
                    onChange={(e) => updateEducation(index, 'startYear', e.target.value)} 
                  />
                  <input 
                    type="text" 
                    placeholder="End Year" 
                    value={edu.endYear} 
                    onChange={(e) => updateEducation(index, 'endYear', e.target.value)} 
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={addEducation} className={styles.addButton}>Add Education</button>
          </div>

          <div className={styles.formSection}>
            <h2>Experience</h2>
            {experience.map((exp, index) => (
              <div key={index} className={styles.experienceItem}>
                <input 
                  type="text" 
                  placeholder="Company" 
                  value={exp.company} 
                  onChange={(e) => updateExperience(index, 'company', e.target.value)} 
                />
                <input 
                  type="text" 
                  placeholder="Position" 
                  value={exp.position} 
                  onChange={(e) => updateExperience(index, 'position', e.target.value)} 
                />
                <div className={styles.yearInputs}>
                  <input 
                    type="text" 
                    placeholder="Start Year" 
                    value={exp.startYear} 
                    onChange={(e) => updateExperience(index, 'startYear', e.target.value)} 
                  />
                  <input 
                    type="text" 
                    placeholder="End Year" 
                    value={exp.endYear} 
                    onChange={(e) => updateExperience(index, 'endYear', e.target.value)} 
                  />
                </div>
                <textarea 
                  placeholder="Description" 
                  value={exp.description} 
                  onChange={(e) => updateExperience(index, 'description', e.target.value)} 
                />
              </div>
            ))}
            <button type="button" onClick={addExperience} className={styles.addButton}>Add Experience</button>
          </div>

          <div className={styles.formSection}>
            <h2>Skills</h2>
            <textarea 
              {...register('skills')}
              placeholder="Enter skills separated by commas"
            />
            {errors.skills && <span className={styles.error}>{errors.skills.message}</span>}
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </UserLayout>
  );
}
