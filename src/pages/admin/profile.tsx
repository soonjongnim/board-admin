import { getDefaultLayout, IDefaultLayoutPage, IPageHeader } from "@/components/layout/default-layout";
import React from 'react';
import ProfileCard from '@/components/page/profile/ProfileCard';
import { useSession } from "next-auth/react";

const pageHeader: IPageHeader = {
  title: "프로필",
};

const ProfilePage: IDefaultLayoutPage = () => {
    const { data: session, status } = useSession();
    const loading = status === "loading";
    console.log(session);
    if (loading) {
        return <div>Loading...</div>;
    }
    
    if (!session) {
        return <div>You need to be authenticated to view this page.</div>;
    }

    const userProfile = session.user;
    
    return (
        <>
        <div className="profile-page">
        <h1>Admin Profile</h1>
        <p>{userProfile.image}</p>
        <ProfileCard 
            name={userProfile.name ?? 'Unknown'}
            email={userProfile.email ?? 'No email provided'}
            role={userProfile.role ?? 'No role provided'}
            avatarUrl={userProfile.image}
        />
        </div>
        </>
    );
};

ProfilePage.getLayout = getDefaultLayout;
ProfilePage.pageHeader = pageHeader;

export default ProfilePage;