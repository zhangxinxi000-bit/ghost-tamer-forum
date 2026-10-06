import React from 'react';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import NotFound from './pages/NotFound/NotFound';
import HomePage from './pages/Home/HomePage';
import BoardPage from './pages/Board/BoardPage';
import PostDetailPage from './pages/Post/PostDetailPage';
import NewPostPage from './pages/NewPost/NewPostPage';
import BountyPage from './pages/Bounty/BountyPage';
import BountyDetailPage from './pages/Bounty/BountyDetailPage';
import WantedPage from './pages/Wanted/WantedPage';
import WantedDetailPage from './pages/Wanted/WantedDetailPage';
import TradePage from './pages/Trade/TradePage';
import TradeDetailPage from './pages/Trade/TradeDetailPage';
import AnnouncementPage from './pages/Announcement/AnnouncementPage';
import AnnouncementDetailPage from './pages/Announcement/AnnouncementDetailPage';
import LoginPage from './pages/Login/LoginPage';
import RegisterPage from './pages/Register/RegisterPage';
import ProfilePage from './pages/Profile/ProfilePage';
import HqPage from './pages/Hq/HqPage';
import HqEventDetailPage from './pages/Hq/HqEventDetailPage';
import HqMissionDetailPage from './pages/Hq/HqMissionDetailPage';
import ApplicationCenterPage from './pages/Application/ApplicationCenterPage';
import MyApplicationsPage from './pages/Application/MyApplicationsPage';
import ApplicationReviewPage from './pages/Application/ApplicationReviewPage';

const RoutesComponent = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="board/:slug" element={<BoardPage />} />
        <Route path="post/:id" element={<PostDetailPage />} />
        <Route path="new-post" element={<NewPostPage />} />
        <Route path="bounties" element={<BountyPage />} />
        <Route path="bounties/:id" element={<BountyDetailPage />} />
        <Route path="wanted" element={<WantedPage />} />
        <Route path="wanted/:id" element={<WantedDetailPage />} />
        <Route path="trades" element={<TradePage />} />
        <Route path="trades/:id" element={<TradeDetailPage />} />
        <Route path="announcements" element={<AnnouncementPage />} />
        <Route path="announcements/:id" element={<AnnouncementDetailPage />} />
        <Route path="hq" element={<HqPage />} />
        <Route path="hq/events/:id" element={<HqEventDetailPage />} />
        <Route path="hq/missions/:id" element={<HqMissionDetailPage />} />
        <Route path="applications" element={<ApplicationCenterPage />} />
        <Route path="applications/mine" element={<MyApplicationsPage />} />
        <Route path="applications/review" element={<ApplicationReviewPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="profile/:username" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default RoutesComponent;
