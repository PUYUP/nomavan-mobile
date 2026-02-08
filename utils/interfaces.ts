export interface BPGroup {
    readonly id: number;
    readonly creator_id: number;
    parent_id: number;
    date_created: string;
    date_created_gmt: string;
    created_since: string;
    description: BPGroupDescription;
    enable_forum: boolean;
    link: string;
    name: string;
    slug: string;
    status: string;
    types: string[];
    admins: BPGroupMember[];
    mods: BPGroupMember[];
    total_member_count: number;
    last_activity: string;
    last_activity_gmt: string;
    last_activity_diff: string;
    avatar_urls: BPAvatarUrls;
    _links: BPLinks;
}

export interface BPGroupDescription {
    raw: string;
    rendered: string;
}

export interface BPAvatarUrls {
    full: string;
    thumb: string;
}

export interface BPGroupMember {
    ID: number;
    user_login: string;
    user_nicename: string;
    user_url: string;
    user_registered: string;
    user_status: number;
    display_name: string;
    fullname: string;
    friendship_status: string;
    user_id: number;
    is_admin: number;
    is_mod: number;
    is_banned: number;
    date_modified: string;
    user_title: string;
    comments: string;
    invite_sent: number;
    inviter_id: number;
    is_confirmed: number;
    membership_id: number;
    last_activity: string;
    total_friend_count: number;
}

export interface BPLinks {
    self: BPLink[];
    collection: BPLink[];
    user?: BPLink[];
    "bp-action-group-leave"?: BPLink[];
}

export interface BPLink {
    href: string;
    embeddable?: boolean;
    targetHints?: {
        allow: string[];
    };
}