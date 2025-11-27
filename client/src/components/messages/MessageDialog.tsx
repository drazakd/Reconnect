// client/src/components/messages/MessageDialog.tsx
import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  otherUserId: string; // ID du destinataire
  // recipientId: string; // ID du destinataire
  recipientName: string; // Nom du destinataire
  onMessageSent?: (conversationId: string, message: string) => void; // callback pour MAJ de mon interface
}

const MessageDialog = ({ open, onOpenChange, otherUserId, recipientName, onMessageSent }: MessageDialogProps) => {
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(false);

  const { token } = useAuth(); // On recupere le token utilisateur
  const API_URL = import.meta.env.VITE_API_URL;

  // Fonction principale pour envoyer un message
  // const handleSend = () => {
  //   if (messageText.trim()) {
  //     onSendMessage(messageText);
  //     setMessageText("");
  //     onOpenChange(false);
  //   }
  // };

  // Fonction principale pour envoyer un message
  const handleSend = async () => {
    if (!messageText.trim()) {
      // Ne rien faire si le message est vide
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Étape 1 : Vérifier si une conversation existe déjà avec ce destinataire
      const res = await fetch(`${API_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      
      // On cherche une conversation contenant ce destinataire
      const existingConv = data.data?.find(
        (conv: any) => conv.otherUser?.id === Number(otherUserId)
      );
      
      let conversationId: string;
      
      // 2️⃣ Étape 2 : Si elle n'existe pas, on la crée
      if (!existingConv) {
        const createRes = await fetch(`${API_URL}/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ otherUserId }), // On envoie { otherUserId } comme attendu par le backend
        });

        if (!createRes.ok) {
          throw new Error("Erreur création conversation");
        }

        const createData = await createRes.json();
        conversationId = createData.data.id; // Récupérer l'ID de la nouvelle conversation
      } else {
        // Conversation existante : on récupère son ID
        conversationId = existingConv.id;
      }

      // // 3️⃣ Étape 3 : Connexion WebSocket
      // const socket: Socket = io(API_URL, {
      //   auth: { token },
      // });

      // 4️⃣ Étape 4 : Envoyer le message via le socket
      // 4️⃣ Envoi du message via l’API REST (pour persister)
      const msgRes = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: messageText.trim() }),
      });

      if (!msgRes.ok) {
        throw new Error("Erreur lors de l’envoi du message");
      }

      const msgData = await msgRes.json();

      // 5️⃣ Notification temps réel (facultatif)
      const socket: Socket = io(API_URL, {
        auth: { token },
      });
      socket.emit("sendMessage", {
        conversationId,
        text: messageText.trim(),
      });
      socket.disconnect();

      // 5️⃣ Étape 5 : Mettre à jour l'interface si callback fourni
      if (onMessageSent) {
        onMessageSent(conversationId, messageText.trim());
      }

      // 6️⃣ Étape 6 : Réinitialiser le champ et fermer le popup
      setMessageText("");
      onOpenChange(false);

      // Fermer la connexion WebSocket proprement après l'envoi
      // socket.disconnect();
    } catch (error) {
      console.error("Erreur envoi message :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Envoyer un message</DialogTitle>
          <DialogDescription>
            Écrivez votre message à {recipientName}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder="Écrivez votre message ici..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="min-h-[120px]"
          />
          <Button
            onClick={handleSend}
            className="w-full bg-primary hover:bg-primary/90"
            disabled={!messageText.trim()}
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Envoi..." : "Envoyer le message"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageDialog;
