import { Conversation, Message } from '@/types/messaging';

// Configuration de l'API - à adapter selon votre backend
const API_BASE_URL = 'http://localhost:3000/api'; // Modifier selon votre configuration

// Fonction helper pour les requêtes
const fetchAPI = async (endpoint: string, options?: RequestInit) => {
  const token = localStorage.getItem('auth_token');
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
};

export const conversationsAPI = {
  // Récupérer toutes les conversations de l'utilisateur
  getAll: async (): Promise<Conversation[]> => {
    return fetchAPI('/conversations');
  },

  // Récupérer une conversation spécifique
  getById: async (id: number): Promise<Conversation> => {
    return fetchAPI(`/conversations/${id}`);
  },

  // Créer une nouvelle conversation
  create: async (participantIds: number[], title?: string): Promise<Conversation> => {
    return fetchAPI('/conversations', {
      method: 'POST',
      body: JSON.stringify({
        participant_ids: participantIds,
        title,
        is_group: participantIds.length > 1,
      }),
    });
  },
};

export const messagesAPI = {
  // Récupérer les messages d'une conversation
  getByConversation: async (conversationId: number, limit = 50, offset = 0): Promise<Message[]> => {
    return fetchAPI(`/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`);
  },

  // Envoyer un message
  send: async (conversationId: number, content: string): Promise<Message> => {
    return fetchAPI(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Marquer un message comme lu
  markAsRead: async (messageId: number): Promise<void> => {
    return fetchAPI(`/messages/${messageId}/read`, {
      method: 'PUT',
    });
  },
};

export const contactsAPI = {
  // Récupérer les contacts acceptés
  getAll: async () => {
    return fetchAPI('/contacts?status=accepted');
  },
};
