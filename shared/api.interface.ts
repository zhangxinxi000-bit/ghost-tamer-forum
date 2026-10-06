export type DangerLevel = 'S' | 'A' | 'B' | 'C';
export type BountyStatus = 'open' | 'in_progress' | 'resolved' | 'failed' | 'closed';
export type WantedStatus = 'active' | 'captured' | 'deceased' | 'closed';
export type TradeType = 'sell' | 'buy' | 'exchange';
export type TradeStatus = 'open' | 'closed' | 'completed';
export type HqEventStatus = 'active' | 'contained' | 'resolved' | 'failed' | 'closed';
export type HqMissionStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type HqMissionType = 'support' | 'containment' | 'transport' | 'investigation' | 'other';
export type ApplicationType = 'registration' | 'join_org' | 'captain_plan' | 'item_claim';
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';
export type DangerLevelSelf = 'normal' | 'dangerous' | 'extremely_dangerous';

export interface ForumUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  city: string | null;
  organization: string | null;
  position: string | null;
  ghostInfo: string | null;
  ghostItems: string | null;
  realName: string | null;
  age: number | null;
  dangerLevelSelf: string | null;
  bio: string | null;
  reputation: number;
  postCount: number;
  isAdmin: boolean;
  createdAt: string;
}

export interface Board {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string | null;
  sortOrder: number;
  postCount: number;
}

export interface PostSummary {
  id: string;
  boardId: string;
  title: string;
  isPinned: boolean;
  isEssence: boolean;
  viewCount: number;
  replyCount: number;
  author: {
    id: string;
    displayName: string;
    avatar: string | null;
  };
  lastReplyAt: string | null;
  createdAt: string;
}

export interface PostDetail {
  id: string;
  boardId: string;
  title: string;
  content: string;
  isPinned: boolean;
  isEssence: boolean;
  viewCount: number;
  replyCount: number;
  author: ForumUser;
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  id: string;
  postId: string;
  content: string;
  floor: number;
  author: ForumUser;
  createdAt: string;
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  dangerLevel: DangerLevel;
  reward: number;
  status: BountyStatus;
  location: string | null;
  ghostName: string | null;
  ghostRules: string | null;
  author: {
    id: string;
    displayName: string;
    avatar: string | null;
  };
  createdAt: string;
}

export interface WantedPerson {
  id: string;
  title: string;
  targetName: string;
  description: string;
  dangerLevel: DangerLevel;
  bountyAmount: number;
  status: WantedStatus;
  ghostInfo: string | null;
  lastSeen: string | null;
  createdAt: string;
}

export interface Trade {
  id: string;
  title: string;
  content: string;
  tradeType: TradeType;
  itemType: string;
  price: string | null;
  status: TradeStatus;
  author: {
    id: string;
    displayName: string;
    avatar: string | null;
  };
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
}

export interface HqEvent {
  id: string;
  title: string;
  content: string;
  dangerLevel: DangerLevel;
  eventLocation: string | null;
  ghostName: string | null;
  ghostRules: string | null;
  status: HqEventStatus;
  isPinned: boolean;
  viewCount: number;
  author: {
    id: string;
    displayName: string;
    avatar: string | null;
    organization: string | null;
    position: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface HqMission {
  id: string;
  title: string;
  content: string;
  missionType: HqMissionType;
  dangerLevel: DangerLevel;
  location: string | null;
  requirements: string | null;
  status: HqMissionStatus;
  reward: number;
  isPinned: boolean;
  author: {
    id: string;
    displayName: string;
    avatar: string | null;
    organization: string | null;
    position: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

// ===== Requests =====

export interface RegisterRequest {
  username: string;
  password: string;
  displayName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: ForumUser;
  token: string;
}

export interface CreatePostRequest {
  boardId: string;
  title: string;
  content: string;
}

export interface CreateReplyRequest {
  content: string;
}

export interface CreateBountyRequest {
  title: string;
  description: string;
  dangerLevel: DangerLevel;
  reward: number;
  location?: string;
  ghostName?: string;
  ghostRules?: string;
}

export interface CreateHqMissionRequest {
  title: string;
  content: string;
  missionType: HqMissionType;
  dangerLevel: DangerLevel;
  location?: string;
  requirements?: string;
  status?: HqMissionStatus;
  reward: number;
  isPinned?: boolean;
}

export interface CreateTradeRequest {
  title: string;
  content: string;
  tradeType: TradeType;
  itemType: string;
  price?: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  city?: string;
  organization?: string;
  position?: string;
  ghostInfo?: string;
  ghostItems?: string;
  realName?: string;
  age?: number;
  dangerLevelSelf?: string;
  bio?: string;
  avatar?: string;
}

// ===== List Responses =====

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export type PostListResponse = PaginatedResponse<PostSummary>;
export type ReplyListResponse = PaginatedResponse<Reply>;
export type BountyListResponse = PaginatedResponse<Bounty>;
export type WantedListResponse = PaginatedResponse<WantedPerson>;
export type TradeListResponse = PaginatedResponse<Trade>;
export type AnnouncementListResponse = PaginatedResponse<Announcement>;
export type HqEventListResponse = PaginatedResponse<HqEvent>;
export type HqMissionListResponse = PaginatedResponse<HqMission>;

export interface Application {
  id: string;
  type: ApplicationType;
  title: string;
  content: string;
  targetOrganization: string | null;
  itemName: string | null;
  status: ApplicationStatus;
  author: {
    id: string;
    displayName: string;
    avatar: string | null;
    organization: string | null;
    position: string | null;
  };
  reviewer: {
    id: string;
    displayName: string;
    avatar: string | null;
  } | null;
  reviewComment: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationRequest {
  type: ApplicationType;
  title: string;
  content: string;
  targetOrganization?: string;
  itemName?: string;
}

export interface ReviewApplicationRequest {
  status: 'approved' | 'rejected';
  reviewComment: string;
}

export type ApplicationListResponse = PaginatedResponse<Application>;
