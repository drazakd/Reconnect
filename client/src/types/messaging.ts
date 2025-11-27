export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  sexe: 'Homme' | 'Femme';
  image?: string;
  ville?: string;
  pays?: string;
}

export interface Conversation {
  id: number;
  title?: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadCount?: number;
}

export interface ConversationParticipant {
  user_id: number;
  role: 'member' | 'admin' | 'owner';
  joined_at: string;
  last_read_at?: string;
  user: User;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
}
