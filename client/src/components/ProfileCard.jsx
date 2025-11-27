// src/components/ProfileCard.jsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Twitter, Linkedin, Facebook } from "lucide-react";
import ProfileImage from "../assets/profileimg.jpeg";
import api from "@/lib/api";
import { useNavigate } from "react-router-dom";

const buildImageSrc = (img) => {
  if (!img) return ProfileImage;
  if (/^https?:\/\//.test(img)) return img;
  const base = import.meta.env.VITE_API_URL;
  return `${base}/${img.replace(/^\/+/, "")}`;
};

const ProfileCard = ({ user }) => {
  console.log("User data in ProfileCard:", user);
  console.log("User image:", user?.image);
  const [status, setStatus] = useState("unknown"); // none | pending_sent | pending_received | friend
  const [contactId, setContactId] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate(`/profile/${user.id}`);
  };  

  useEffect(() => {
    let mounted = true;
    const fetchRelation = async () => {
      try {
        const res = await api.get(`/contacts/${user.id}/status`);
        if (!mounted) return;
        const { status: s, contactId: cid } = res.data;
        setStatus(s || "none");
        setContactId(cid || null);
      } catch (err) {
        // silent
        setStatus("none");
      }
    };
    fetchRelation();
    return () => { mounted = false; };
  }, [user.id]);

  const handleAction = async () => {
    try {
      setLoading(true);
      if (status === "none") {
        // envoyer demande
        const res = await api.post(`/contacts/${user.id}/request`);
        // backend répond { contactId, accepted? }
        const payload = res.data.data || res.data;
        if (payload && payload.contactId) {
          setContactId(payload.contactId);
        }
        if (payload && payload.accepted) {
          setStatus("friend");
        } else {
          setStatus("pending_sent");
        }
      } else if (status === "friend") {
        // retirer
        if (!contactId) {
          alert("Impossible : contactId manquant.");
          return;
        }
        if (!confirm("Voulez-vous supprimer cet ami ?")) return;
        await api.delete(`/contacts/${contactId}`);
        setStatus("none");
        setContactId(null);
      }
    } catch (err) {
      console.error("❌ Erreur relation:", err);
      // gestion simple d'erreur : refresh status
      try {
        const res = await api.get(`/contacts/${user.id}/status`);
        const { status: s, contactId: cid } = res.data;
        setStatus(s || "none");
        setContactId(cid || null);
      } catch (_e) {}
    } finally {
      setLoading(false);
    }
  };

  const getLabel = () => {
    if (status === "none") return "Connecter";
    if (status === "pending_sent") return "En attente";
    if (status === "pending_received") return "Répondu";
    if (status === "friend") return "Ami(e)";
    return "—";
  };

  return (
    <div className="w-[300px] bg-white rounded-md overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
      <div className="w-full h-[140px] bg-primary flex items-center justify-center">
        <div className="w-[90px] h-[90px] rounded-full bg-white relative overflow-hidden">
          <img 
            src={buildImageSrc(user.image)} 
            alt={`${user.nom} ${user.prenom}`} 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      <div className="py-6 px-4 flex flex-col gap-3">
        <div className="text-center">
          <h3 
            className="text-2xl font-semibold text-primary cursor-pointer hover:underline"
            onClick={handleProfileClick}
          >
            {user.nom} {user.prenom}
          </h3>
          <p className="font-semibold text-gray-700">{user.entreprise || "Utilisateur"}</p>
        </div>

        <p className="text-center text-gray-500 text-sm">{user.bio}</p>

        <div className="flex items-center justify-center mt-2 gap-2">
          <Twitter size={16} />
          <Linkedin size={16} />
          <Facebook size={16} />
        </div>

        <div className="w-full flex justify-center mt-4">
          <Button variant={status === "friend" ? "secondary" : "hero"} onClick={handleAction} disabled={loading || status === "pending_received"}>
            {loading ? "Chargement..." : getLabel()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
