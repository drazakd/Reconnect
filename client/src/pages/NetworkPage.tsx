// src/pages/NetworkPage.jsx
import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Send, MessageCircle, X, Check } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import DefaultAvatar from "@/assets/profileimg.jpeg";
import MessageDialog from "@/components/messages/MessageDialog";


const buildImageSrc = (img) => {
  if (!img) return DefaultAvatar;
  if (/^https?:\/\//.test(img)) return img;
  const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
  return `${base}/${img.replace(/^\/+/, "")}`;
};

const NetworkPage = () => {
  // --- États globaux
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [sent, setSent] = useState([]);
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(null);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  // --- Récupération des données
  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqRes, sentRes, friendsRes] = await Promise.all([
        api.get("/contacts/requests"),
        api.get("/contacts/sent"),
        api.get("/contacts/friends"),
      ]);

      setRequests(reqRes.data || []);
      setSent(sentRes.data || []);
      setFriends(friendsRes.data || []);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données réseau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // --- Actions
  const acceptRequest = async (contactId) => {
    try {
      await api.post(`/contacts/${contactId}/accept`);
      toast.success("Demande acceptée ✅");
      await fetchAll();
    } catch (err) {
      console.error("Erreur accept:", err);
      toast.error("Impossible d'accepter la demande.");
    }
  };

  const declineRequest = async (contactId) => {
    try {
      await api.post(`/contacts/${contactId}/decline`);
      toast.info("Demande refusée ❌");
      await fetchAll();
    } catch (err) {
      console.error("Erreur decline:", err);
      toast.error("Impossible de refuser la demande.");
    }
  };

  const cancelSent = async (contactId) => {
    try {
      await api.delete(`/contacts/sent/${contactId}`);
      toast.info("Demande annulée ✉️");
      await fetchAll();
    } catch (err) {
      console.error("Erreur cancel:", err);
      toast.error("Impossible d'annuler la demande.");
    }
  };

  const removeFriend = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast.info("Ami retiré 🗑️");
      await fetchAll();
    } catch (err) {
      console.error("Erreur remove friend:", err);
      toast.error("Impossible de retirer l'ami.");
    }
  };

  const handleMessage = (friend) => {
    setSelectedFriend(friend);
    setMessageDialogOpen(true);
  };

  

  // --- Rendu principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Mon Réseau
          </h1>
          <p className="text-muted-foreground">
            Gérez vos connexions et développez votre réseau
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-card shadow-sm">
            <TabsTrigger value="received" className="gap-2">
              <UserPlus className="w-4 h-4" />
              Reçues
              {requests.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-primary text-primary-foreground">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent" className="gap-2">
              <Send className="w-4 h-4" />
              Envoyées
              {sent.length > 0 && (
                <Badge variant="outline" className="ml-1">
                  {sent.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="friends" className="gap-2">
              <Users className="w-4 h-4" />
              Amis
              <Badge variant="outline" className="ml-1">
                {friends.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* --- Demandes reçues --- */}
          <TabsContent value="received" className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
            ) : requests.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <UserPlus className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Aucune demande reçue pour le moment
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {requests.map((r) => (
                  <Card key={r.id} className="shadow-sm hover:shadow-md border-l-4 border-l-primary transition-all">
                    <CardContent className="p-6 flex items-start gap-4">
                      <Avatar className="w-16 h-16 ring-2 ring-primary/20">
                        <AvatarImage src={buildImageSrc(r.from_user?.image)} />
                        <AvatarFallback>{r.from_user?.prenom?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 truncate">
                          {r.from_user?.nom} {r.from_user?.prenom}
                        </h3>
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => acceptRequest(r.id)}
                            className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                            size="sm"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Accepter
                          </Button>
                          <Button onClick={() => declineRequest(r.id)} variant="outline" size="sm">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* --- Demandes envoyées --- */}
          <TabsContent value="sent" className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
            ) : sent.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Send className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Aucune demande envoyée
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {sent.map((s) => (
                  <Card key={s.id} className="shadow-sm hover:shadow-md transition-all duration-300">
                    <CardContent className="p-6 flex items-start gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={buildImageSrc(s.to_user?.image)} />
                        <AvatarFallback>{s.to_user?.prenom?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 truncate">
                          {s.to_user?.nom} {s.to_user?.prenom}
                        </h3>
                        <Button
                          onClick={() => cancelSent(s.id)}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Annuler la demande
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* --- Liste d'amis --- */}
          <TabsContent value="friends" className="space-y-4">
            {loading ? (
              <p className="text-center text-muted-foreground">Chargement...</p>
            ) : friends.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Votre liste d'amis est vide
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {friends.map((f) => (
                  <Card key={f.id} className="shadow-sm hover:shadow-md transition-all duration-300 group">
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <Avatar className="w-20 h-20 mb-4 ring-2 ring-accent/20">
                        <AvatarImage src={buildImageSrc(f.user?.image)}  />
                        <AvatarFallback>{f.user?.prenom?.[0] || "?"}</AvatarFallback>
                      </Avatar>
                      <h3 className="font-semibold text-lg mb-1">
                        {f.user?.nom} {f.user?.prenom}
                      </h3>
                      <Badge variant="outline">{f.user?.statut || "En ligne"}</Badge>
                      <div className="flex gap-2 w-full mt-4">
                        <Button
                          onClick={() => handleMessage(f.user)}
                          variant="secondary"
                          size="sm"
                          className="flex-1 bg-gradient-to-r from-accent to-primary hover:opacity-90"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>

                        <Button
                          onClick={() => removeFriend(f.id)}
                          variant="outline"
                          size="sm"
                          className="hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <MessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        otherUserId={selectedFriend?.id?.toString() || ""}
        recipientName={`${selectedFriend?.nom || ""} ${selectedFriend?.prenom || ""}`}
        onMessageSent={(convId, msg) => {
          toast.success(`Message envoyé à ${selectedFriend?.prenom}`);
        }}
      />

    </div>
  );
};

export default NetworkPage;
