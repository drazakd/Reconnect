// src/components/messages/ConversationView.tsx
import { useState } from "react";
import { useEffect, useRef } from "react";
import { ArrowLeft, Send, Phone, Video, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Contact, Message } from "@/pages/Messages";
import { useAuth } from "@/context/AuthContext";
import { io, Socket } from "socket.io-client";
import DefaultAvatar from "@/assets/profileimg.jpeg";

interface ConversationViewProps {
  contact: Contact | null;
  messages: Message[];
  onMessageSent?: (message: Message) => void;
  onBack?: () => void; // ✅ pour retour sur mobile
}

const buildImageSrc = (img) => {
  if (!img) return DefaultAvatar;
  if (/^https?:\/\//.test(img)) return img;
  const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
  return `${base}/${img.replace(/^\/+/, "")}`;
};

export default function ConversationView({
  contact,
  messages,
  onMessageSent,
  onBack,
}: ConversationViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // ✅ Fonction d’envoi de message
  const handleSend = async () => {
    if (!contact || !newMessage.trim() || !token) return;

    setLoading(true);
    try {
      // 1️⃣ Vérifie si la conversation existe toujours
      const res = await fetch(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const existingConv = data.data?.find(
        (conv: any) => conv.id === parseInt(contact.id)
      );

      let conversationId = existingConv ? existingConv.id : null;

      // 2️⃣ Si la conversation n’existe plus, la créer
      if (!conversationId) {
        const createRes = await fetch(`${API_URL}/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otherUserId: contact.otherUserId }),
        });

        const createData = await createRes.json();
        conversationId = createData.data.id;
      }

      // 3️⃣ Envoi du message via l’API (persistance en base)
      const msgRes = await fetch(
        `${API_URL}/conversations/${conversationId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: newMessage.trim() }),
        }
      );

      if (!msgRes.ok) throw new Error("Erreur lors de l’envoi du message");
      const msgData = await msgRes.json();
      const message = msgData.data;

      // 4️⃣ Envoi en temps réel via Socket.IO
      const socket: Socket = io(API_URL, { auth: { token } });
      socket.emit("sendMessage", {
        conversationId,
        text: newMessage.trim(),
      });
      socket.disconnect();

      // 5️⃣ Mise à jour locale optimiste
      const newMsg: Message = {
        id: message.id.toString(),
        senderId: "me",
        text: message.content,
        timestamp: new Date(message.created_at).toLocaleTimeString(),
      };

      if (onMessageSent) onMessageSent(newMsg);
      setNewMessage("");
    } catch (err) {
      console.error("Erreur envoi message:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Si aucune conversation sélectionnée
  if (!contact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Send className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Sélectionnez une conversation
          </h3>
          <p className="text-muted-foreground">
            Choisissez un contact pour commencer à discuter
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full max-h-[calc(100vh-4rem)]">
      {/* ✅ HEADER */}
      <div className="p-4 border-b bg-card flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Bouton retour — visible uniquement sur mobile */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden mr-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}

          {/* Avatar + état */}
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={buildImageSrc(contact.avatar)} />
              <AvatarFallback>
                {contact.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {contact.online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
            )}
          </div>

          {/* Nom + statut */}
          <div>
            <h3 className="font-semibold text-sm md:text-base">
              {contact.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              {contact.online ? "En ligne" : "Hors ligne"}
            </p>
          </div>
        </div>

        {/* Boutons actions (affichés seulement sur bureau) */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* ✅ CONTENU DES MESSAGES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20 overscroll-contain">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.senderId === "me"
                ? "justify-end"
                : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2 break-words",
                message.senderId === "me"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card"
              )}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
        {/* ⬇️ Ref unique pour scroll vers le bas */}
        {/* <div ref={messagesEndRef} /> */}
      </div>

      {/* ✅ INPUT D’ENVOI */}
      <div className="p-4 border-t bg-card">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Écrivez votre message..."
            disabled={loading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            size="icon"
            disabled={!newMessage.trim() || loading}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


// // partie non responsive, pas besoin d’utiliser le hook useIsMobile ici
// import { useState } from "react";
// import { Send, Phone, Video, MoreVertical } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { cn } from "@/lib/utils";
// import type { Contact, Message } from "@/pages/Messages";
// import { useAuth } from "@/context/AuthContext";
// import { io, Socket } from "socket.io-client";

// interface ConversationViewProps {
//   contact: Contact | null;
//   messages: Message[];
//   onMessageSent?: (message: Message) => void;
// }

// export default function ConversationView({
//   contact,
//   messages,
//   onMessageSent,
// }: ConversationViewProps) {
//   const [newMessage, setNewMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { token } = useAuth();
//   const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

//   const handleSend = async () => {
//     if (!contact || !newMessage.trim() || !token) return;

//     setLoading(true);
//     try {
//       // ✅ 1) Vérifie si la conversation existe encore
//       const res = await fetch(`${API_URL}/conversations`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       const existingConv = data.data?.find(
//         (conv: any) => conv.id === parseInt(contact.id)
//       );

//       let conversationId = existingConv
//         ? existingConv.id
//         : null;

//       // ✅ 2) Si la conversation n’existe pas (rare ici), la créer
//       if (!conversationId) {
//         const createRes = await fetch(`${API_URL}/conversations`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ otherUserId: contact.otherUserId }),
//         });

//         const createData = await createRes.json();
//         conversationId = createData.data.id;
//       }

//       // ✅ 3) Envoi du message via l’API REST (persistance en base)
//       const msgRes = await fetch(
//         `${API_URL}/conversations/${conversationId}/messages`,
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ content: newMessage.trim() }),
//         }
//       );

//       if (!msgRes.ok) {
//         throw new Error("Erreur lors de l’envoi du message");
//       }

//       const msgData = await msgRes.json();
//       const message = msgData.data;

//       // ✅ 4) Envoi en temps réel via Socket.IO
//       const socket: Socket = io(API_URL, { auth: { token } });
//       socket.emit("sendMessage", {
//         conversationId,
//         text: newMessage.trim(),
//       });
//       socket.disconnect();

//       // ✅ 5) Mise à jour locale immédiate (optimiste)
//       const newMsg: Message = {
//         id: message.id.toString(),
//         senderId: "me",
//         text: message.content,
//         timestamp: new Date(message.created_at).toLocaleTimeString(),
//       };

//       if (onMessageSent) onMessageSent(newMsg);

//       setNewMessage("");
//     } catch (err) {
//       console.error("Erreur envoi message:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!contact) {
//     return (
//       <div className="flex-1 flex items-center justify-center bg-muted/20">
//         <div className="text-center">
//           <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
//             <Send className="h-12 w-12 text-primary" />
//           </div>
//           <h3 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h3>
//           <p className="text-muted-foreground">
//             Choisissez un contact pour commencer à discuter
//           </p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col">
//       {/* Header */}
//       <div className="p-4 border-b bg-card flex items-center justify-between">
//         <div className="flex items-center gap-3">
//           <div className="relative">
//             <Avatar className="h-10 w-10">
//               <AvatarImage src={contact.avatar} alt={contact.name} />
//               <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
//             </Avatar>
//             {contact.online && (
//               <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
//             )}
//           </div>
//           <div>
//             <h3 className="font-semibold">{contact.name}</h3>
//             <p className="text-xs text-muted-foreground">
//               {contact.online ? "En ligne" : "Hors ligne"}
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-2">
//           <Button variant="ghost" size="icon">
//             <Phone className="h-5 w-5" />
//           </Button>
//           <Button variant="ghost" size="icon">
//             <Video className="h-5 w-5" />
//           </Button>
//           <Button variant="ghost" size="icon">
//             <MoreVertical className="h-5 w-5" />
//           </Button>
//         </div>
//       </div>

//       {/* Messages */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
//         {messages.map((message) => (
//           <div
//             key={message.id}
//             className={cn(
//               "flex",
//               message.senderId === "me" ? "justify-end" : "justify-start"
//             )}
//           >
//             <div
//               className={cn(
//                 "max-w-[70%] rounded-2xl px-4 py-2",
//                 message.senderId === "me"
//                   ? "bg-primary text-primary-foreground"
//                   : "bg-card"
//               )}
//             >
//               <p className="text-sm">{message.text}</p>
//               <span className="text-xs opacity-70 mt-1 block">
//                 {message.timestamp}
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Input */}
//       <div className="p-4 border-t bg-card">
//         <div className="flex gap-2">
//           <Input
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             onKeyDown={(e) => e.key === "Enter" && handleSend()}
//             placeholder="Écrivez votre message..."
//             disabled={loading}
//             className="flex-1"
//           />
//           <Button
//             onClick={handleSend}
//             size="icon"
//             disabled={!newMessage.trim() || loading}
//             className="bg-primary hover:bg-primary/90"
//           >
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
