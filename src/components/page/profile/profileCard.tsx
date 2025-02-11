import React from 'react';

interface ProfileCardProps {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, email, role, avatarUrl }) => {
  const defaultAvatarUrl = '/No_Image_Available.jpg';
  const imageUrl = avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : defaultAvatarUrl;

  return (
    <div className="profile-card">
      <img src={imageUrl} alt={`${name}'s avatar`} className="avatar" />
      <h2>{name}</h2>
      <p>{email}</p>
      <p>{role}</p>
    </div>
  );
};

export default ProfileCard;