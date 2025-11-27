// src/pages/NetworkPage.jsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api from "../lib/api";
import MiniProfileCard from "@/components/MiniProfileCard";

const NetworkPage = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [sent, setSent] = useState([]);
  const [friends, setFriends] = useState([]);
  const [error, setError] = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reqRes, sentRes, friendsRes] = await Promise.all([
        api.get("/contacts/requests"),
        api.get("/contacts/sent"),
        api.get("/contacts/friends"),
      ]);
      setRequests(reqRes.data.data || reqRes.data || []);
      setSent(sentRes.data.data || sentRes.data || []);
      setFriends(friendsRes.data.data || friendsRes.data || []);
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

  // Actions
  const acceptRequest = async (contactId) => {
    try {
      await api.post(`/contacts/${contactId}/accept`);
      await fetchAll();
    } catch (err) {
      console.error("Erreur accept:", err);
      setError("Impossible d'accepter la demande.");
    }
  };

  const declineRequest = async (contactId) => {
    try {
      await api.post(`/contacts/${contactId}/decline`);
      await fetchAll();
    } catch (err) {
      console.error("Erreur decline:", err);
      setError("Impossible de refuser la demande.");
    }
  };

  const cancelSent = async (contactId) => {
    try {
      await api.delete(`/contacts/sent/${contactId}`);
      await fetchAll();
    } catch (err) {
      console.error("Erreur cancel:", err);
      setError("Impossible d'annuler la demande.");
    }
  };

  const removeFriend = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      await fetchAll();
    } catch (err) {
      console.error("Erreur remove friend:", err);
      setError("Impossible de retirer l'ami.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mon Réseau</h1>

      {error && (<div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-100">{error}</div>)}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Demandes reçues</CardTitle>
            <CardDescription>Personnes qui ont demandé à se connecter</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? "Chargement..." : requests.length === 0 ? (
              <div className="text-sm text-muted-foreground">Aucune demande en attente</div>
            ) : (
              <div className="flex flex-col gap-3">
                {requests.map(r => (
                  <MiniProfileCard
                    key={r.id}
                    user={r.from_user}
                    contactId={r.id}
                    type="incoming"
                    onAccept={acceptRequest}
                    onDecline={declineRequest}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Demandes envoyées</CardTitle>
            <CardDescription>En attente de réponse</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? "Chargement..." : sent.length === 0 ? (
              <div className="text-sm text-muted-foreground">Aucune demande envoyée</div>
            ) : (
              <div className="flex flex-col gap-3">
                {sent.map(s => (
                  <MiniProfileCard
                    key={s.id}
                    user={s.to_user}
                    contactId={s.id}
                    type="sent"
                    onCancel={cancelSent}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Amis</CardTitle>
            <CardDescription>Liste de vos contacts acceptés</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? "Chargement..." : friends.length === 0 ? (
              <div className="text-sm text-muted-foreground">Vous n'avez pas encore d'amis</div>
            ) : (
              <div className="flex flex-col gap-3">
                {friends.map(f => (
                  <MiniProfileCard
                    key={f.id}
                    user={f.user}
                    contactId={f.id}
                    type="friends"
                    onRemove={removeFriend}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NetworkPage;
