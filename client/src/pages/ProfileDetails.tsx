// // src/pages/ProfileDetails.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from "@/lib/api";
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Building2, GraduationCap, MessageCircle, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DefaultAvatar from "@/assets/profileimg.jpeg";
import MessageDialog from '@/components/messages/MessageDialog';
// import { mockUser } from '@/types/user';

const buildImageSrc = (img) => {
  if (!img) return DefaultAvatar;
  if (/^https?:\/\//.test(img)) return img;
  const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
  return `${base}/${img.replace(/^\/+/, "")}`;
};

const ProfileDetails = () => {
  const { id } = useParams(); // 👈 récupère l'id de l'utilisateur
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error("Erreur récupération utilisateur:", err);
        toast.error("Utilisateur introuvable");
        navigate(-1);
      }
    };
    fetchUser();
  }, [id]);

  if (!user) {
    return <div className="text-center py-10 text-gray-500">Chargement...</div>;
  }


  const handleSendMessage = () => {
    toast.success('Message envoyé', {
      description: `Votre message a été envoyé à ${`${user.nom} ${user.prenom}`}`,
    });
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 transition-all hover:bg-muted/50">
      <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm text-foreground font-medium truncate">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 hover:bg-muted/50"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        {/* Header Card */}
        <Card className="mb-6 border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Picture */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                  <img
                    src={buildImageSrc(user?.image)}
                    alt={`${user.nom} ${user.prenom}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-primary to-accent p-2 rounded-full shadow-lg">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>

              {/* Header Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                      {user.nom} {user.prenom}
                    </h1>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>
                  <Button 
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                    onClick={() => setMessageDialogOpen(true)}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Envoyer un message
                  </Button>
                </div>

                {user.bio && (
                  <p className="text-foreground/80 leading-relaxed">{user.bio}</p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  {user.sexe && (
                    <Badge variant="secondary" className="font-medium">
                      {user.sexe === "Homme" ? "Homme" : user.sexe === "Femme" ? "Femme" : "Autre"}
                    </Badge>
                  )}
                  {(user.ville || user.pays) && (
                    <Badge variant="outline" className="font-medium">
                      {user.ville || "—"}, {user.pays || "—"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Information */}
          <Card className="border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                Informations de contact
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoItem icon={Mail} label="Email" value={user.email} />
              <InfoItem icon={Phone} label="Téléphone" value={user.telephone} />
              <InfoItem 
                icon={MapPin} 
                label="Localisation" 
                value={`${user.ville || "—"}, ${user.pays || "—"}`}
              />
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
            <CardHeader>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-accent" />
                </div>
                Informations professionnelles
              </h2>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.ecole && (
                <InfoItem icon={GraduationCap} label="École/Université" value={user.ecole} />
              )}
              {user.entreprise && (
                <InfoItem icon={Building2} label="Entreprise/Société" value={user.entreprise} />
              )}
              {!user.ecole && !user.entreprise && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Aucune information professionnelle ajoutée
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <MessageDialog
        open={messageDialogOpen}
        onOpenChange={setMessageDialogOpen}
        otherUserId={id} // On utilise maintenant otherUserId au lieu de recipientId
        // recipientId={id}
        recipientName={`${user.nom} ${user.prenom}`}
        onMessageSent={handleSendMessage}
        // onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ProfileDetails;