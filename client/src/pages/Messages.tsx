// src/pages/Messages.tsx
import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";
import MessageList from "@/components/messages/MessageList";
import ConversationView from "@/components/messages/ConversationView";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Contact {
  id: string; // conversation_id
  otherUserId: number;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

export default function Messages() {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [conversations, setConversations] = useState<Contact[]>([]);
  const [selectedConv, setSelectedConv] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const isMobile = useIsMobile(); // ✅ Détection mobile

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Charger les conversations
  useEffect(() => {
    if (!token) return;

    fetch(`${API_URL}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = (data.data || []).map((conv: any) => ({
          id: conv.id.toString(),
          otherUserId: conv.otherUser?.id || 0,
          name: `${conv.otherUser?.prenom || ""} ${conv.otherUser?.nom || ""}`,
          avatar: conv.otherUser?.image || "",
          lastMessage: conv.lastMessage?.content || "",
          timestamp: conv.lastMessage?.created_at
            ? new Date(conv.lastMessage.created_at).toLocaleTimeString()
            : "",
          unread: conv.unread || 0,
          online: conv.otherUser?.online || false,
        }));
        setConversations(formatted);
      })
      .catch((err) => console.error("Erreur fetch conversations:", err));

    // Connexion socket
    const newSocket = io(API_URL, { auth: { token } });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  // Nouveaux messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      if (selectedConv && msg.conversationId === parseInt(selectedConv.id)) {
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id.toString(),
            senderId: msg.senderId === user?.id ? "me" : msg.senderId,
            text: msg.content,
            timestamp: new Date(msg.created_at).toLocaleTimeString(),
          },
        ]);
      }

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === msg.conversationId.toString()
            ? {
                ...conv,
                lastMessage: msg.content,
                timestamp: new Date(msg.created_at).toLocaleTimeString(),
              }
            : conv
        )
      );
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, selectedConv, user]);

  // Charger messages d'une conversation
  const handleSelectConversation = (conv: Contact) => {
    if (socket) socket.emit("join", conv.id);
    setSelectedConv(conv);

    fetch(`${API_URL}/conversations/${conv.id}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const formatted = (data.data || []).map((m: any) => ({
          id: m.id.toString(),
          senderId: m.sender_id === user?.id ? "me" : m.sender_id,
          text: m.content,
          timestamp: new Date(m.created_at).toLocaleTimeString(),
        }));
        setMessages(formatted);
      })
      .catch((err) => console.error("Erreur chargement messages:", err));
  };

  // Retour sur mobile
  const handleBackToList = () => {
    setSelectedConv(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto h-[calc(100vh-4rem)] flex flex-col md:flex-row overflow-hidden rounded-lg border bg-card shadow-lg">
        {/* ✅ Vue bureau : 2 colonnes côte à côte */}
        {!isMobile ? (
          <>
            <MessageList
              contacts={conversations}
              selectedContact={selectedConv}
              onSelectContact={handleSelectConversation}
            />
            <ConversationView
              contact={selectedConv}
              messages={messages}
              onMessageSent={(msg) => setMessages((prev) => [...prev, msg])}
            />
          </>
        ) : (
          <>
            {/* ✅ Vue mobile : soit liste, soit conversation */}
            {!selectedConv ? (
              <MessageList
                contacts={conversations}
                selectedContact={selectedConv}
                onSelectContact={handleSelectConversation}
              />
            ) : (
              <ConversationView
                contact={selectedConv}
                messages={messages}
                onMessageSent={(msg) => setMessages((prev) => [...prev, msg])}
                onBack={handleBackToList} // ✅ nouveau
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// // partie non responsive avec gestion des sockets et fetch API
// import { useEffect, useState } from "react";
// import { io, Socket } from "socket.io-client";
// import MessageList from "@/components/messages/MessageList";
// import ConversationView from "@/components/messages/ConversationView";
// import { useAuth } from "@/context/AuthContext";

// export interface Contact {
//   id: string; // conversation_id
//   otherUserId: number; // id réel de l'autre utilisateur
//   name: string;
//   avatar: string;
//   lastMessage: string;
//   timestamp: string;
//   unread: number;
//   online: boolean;
// }

// export interface Message {
//   id: string;
//   senderId: string;
//   text: string;
//   timestamp: string;
// }

// export default function Messages() {
//   const { user, token } = useAuth();
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [conversations, setConversations] = useState<Contact[]>([]);
//   const [selectedConv, setSelectedConv] = useState<Contact | null>(null);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [newMessage, setNewMessage] = useState("");

//   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

//   // Charger les conversations à la connexion
//   useEffect(() => {
//     if (!token) return;

//     fetch(`${API_URL}/conversations`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         const convs = data.data || [];
//         const formatted = convs.map((conv: any) => ({
//           id: conv.id.toString(),
//           otherUserId: conv.otherUser?.id || 0,
//           name: `${conv.otherUser?.prenom || ""} ${conv.otherUser?.nom || ""}`,
//           avatar: conv.otherUser?.image || "",
//           lastMessage: conv.lastMessage?.content || "",
//           timestamp: conv.lastMessage?.created_at
//             ? new Date(conv.lastMessage.created_at).toLocaleTimeString()
//             : "",
//           unread: conv.unread || 0,
//           online: conv.otherUser?.online || false,
//         }));
//         setConversations(formatted);
//       })
//       .catch((err) => console.error("Erreur fetch conversations:", err));

//     // Connexion Socket.IO
//     const newSocket = io(API_URL, { auth: { token } });
//     setSocket(newSocket);

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [token]);

//   // Gestion des nouveaux messages reçus via socket
//   useEffect(() => {
//     if (!socket) return;

//     const handleNewMessage = (msg: any) => {
//       // Si c'est la conversation actuellement ouverte
//       if (selectedConv && msg.conversationId === parseInt(selectedConv.id)) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: msg.id.toString(),
//             senderId: msg.senderId === user?.id ? "me" : msg.senderId,
//             text: msg.content,
//             timestamp: new Date(msg.created_at).toLocaleTimeString(),
//           },
//         ]);
//       }

//       // Mettre à jour l’aperçu du dernier message dans la liste
//       setConversations((prev) =>
//         prev.map((conv) =>
//           conv.id === msg.conversationId.toString()
//             ? { ...conv, lastMessage: msg.content, timestamp: new Date(msg.created_at).toLocaleTimeString() }
//             : conv
//         )
//       );
//     };

//     socket.on("newMessage", handleNewMessage);
//     return () => {
//       socket.off("newMessage", handleNewMessage);
//     };
//   }, [socket, selectedConv, user]);

//   // Quand on sélectionne une conversation
//   const handleSelectConversation = (conv: Contact) => {
//     if (socket) socket.emit("join", conv.id);
//     setSelectedConv(conv);

//     fetch(`${API_URL}/conversations/${conv.id}/messages`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then((res) => res.json())
//       .then((data) => {
//         const msgs = data.data || [];
//         const formatted = msgs.map((m: any) => ({
//           id: m.id.toString(),
//           senderId: m.sender_id === user?.id ? "me" : m.sender_id,
//           text: m.content,
//           timestamp: new Date(m.created_at).toLocaleTimeString(),
//         }));
//         setMessages(formatted);
//       })
//       .catch((err) => console.error("Erreur chargement messages:", err));
//   };

//   // Envoi d’un message
//   const handleSend = () => {
//     if (!newMessage.trim() || !selectedConv || !socket) return;

//     // Envoi au backend (via Socket)
//     socket.emit("sendMessage", {
//       conversationId: parseInt(selectedConv.id),
//       content: newMessage,
//       receiverId: selectedConv.otherUserId,
//     });

//     // Affichage optimiste
//     const tempMessage: Message = {
//       id: Date.now().toString(),
//       senderId: "me",
//       text: newMessage,
//       timestamp: new Date().toLocaleTimeString(),
//     };
//     setMessages((prev) => [...prev, tempMessage]);
//     setNewMessage("");
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       <div className="container mx-auto h-[calc(100vh-4rem)]">
//         <div className="flex h-full overflow-hidden rounded-lg border bg-card shadow-lg">
//           <MessageList
//             contacts={conversations}
//             selectedContact={selectedConv}
//             onSelectContact={handleSelectConversation}
//           />
//           <ConversationView
//             contact={selectedConv}
//             messages={messages}
//             onMessageSent={(newMsg) => setMessages((prev) => [...prev, newMsg])}
//           />

//         </div>
//       </div>
//     </div>
//   );
// }


// // src/pages/Messages.tsx
// import { useState } from "react";
// import Header from "@/components/Header";
// import MessageList from "@/components/messages/MessageList";
// import ConversationView from "@/components/messages/ConversationView";

// export interface Contact {
//   id: string;
//   name: string;
//   avatar: string;
//   lastMessage: string;
//   timestamp: string;
//   unread: number;
//   online: boolean;
// }

// export interface Message {
//   id: string;
//   senderId: string;
//   text: string;
//   timestamp: string;
// }

// const Messages = () => {
//   const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

//   const mockContacts: Contact[] = [
//     {
//       id: "1",
//       name: "Sophie Martin",
//       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie",
//       lastMessage: "Super ! On se voit ce soir alors ? 😊",
//       timestamp: "Il y a 5 min",
//       unread: 2,
//       online: true,
//     },
//     {
//       id: "2",
//       name: "Lucas Dubois",
//       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas",
//       lastMessage: "Merci pour cette belle soirée !",
//       timestamp: "Il y a 1h",
//       unread: 1,
//       online: true,
//     },
//     {
//       id: "3",
//       name: "Emma Bernard",
//       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
//       lastMessage: "J'ai adoré notre discussion 💕",
//       timestamp: "Hier",
//       unread: 0,
//       online: false,
//     },
//     {
//       id: "4",
//       name: "Thomas Petit",
//       avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas",
//       lastMessage: "À bientôt j'espère !",
//       timestamp: "Il y a 2 jours",
//       unread: 0,
//       online: false,
//     },
//   ];

//   const mockMessages: Message[] = selectedContact
//     ? [
//         {
//           id: "1",
//           senderId: selectedContact.id,
//           text: "Salut ! Comment vas-tu ?",
//           timestamp: "14:30",
//         },
//         {
//           id: "2",
//           senderId: "me",
//           text: "Très bien merci ! Et toi ?",
//           timestamp: "14:32",
//         },
//         {
//           id: "3",
//           senderId: selectedContact.id,
//           text: selectedContact.lastMessage,
//           timestamp: "14:35",
//         },
//       ]
//     : [];

//   return (
//     <div className="min-h-screen bg-background">
//       {/* <Header /> */}
//       <div className="container mx-auto h-[calc(100vh-4rem)]">
//         <div className="flex h-full gap-0 overflow-hidden rounded-lg border bg-card shadow-lg">
//           <MessageList
//             contacts={mockContacts}
//             selectedContact={selectedContact}
//             onSelectContact={setSelectedContact}
//           />
//           <ConversationView
//             contact={selectedContact}
//             messages={mockMessages}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Messages;
