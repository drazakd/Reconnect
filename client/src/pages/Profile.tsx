// // src/pages/Profile.tsx
import { useAuth } from "@/context/AuthContext"; // récupération des infos utilisateur connecté
import { User, Mail, Phone, MapPin, Building2, GraduationCap } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProfileEditModal from "@/components/modals/ProfileEditModal";
import PasswordChangeModal from "@/components/modals/PasswordChangeModal";
import { Button } from "@/components/ui/button";
import DefaultAvatar from "@/assets/profileimg.jpeg";

const buildImageSrc = (img) => {
  if (!img) return DefaultAvatar;
  if (/^https?:\/\//.test(img)) return img;
  const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
  return `${base}/${img.replace(/^\/+/, "")}`;
};

const Profile = () => {
  // Récupération du user connecté depuis le contexte global
  const { user } = useAuth();

  // Sécurité : Si aucun utilisateur n'est connecté, afficher un message
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-muted-foreground">Aucun utilisateur connecté.</p>
      </div>
    );
  }

  // Composant utilitaire pour afficher une ligne d'information (avec icône + texte)
  const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 transition-all hover:bg-muted/50">
      <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm text-foreground font-medium truncate">{value || "—"}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* === HEADER === */}
        <Card className="mb-6 border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              
              {/* Image de profil */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/50 group-hover:ring-primary/40 transition-all duration-300">
                  <img
                    src={buildImageSrc(user?.image)}
                    alt={`${user.prenom} ${user.nom}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* === Informations principales === */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
                      {user.prenom} {user.nom}
                    </h1>
                    <p className="text-muted-foreground">{user.email}</p>
                  </div>

                  {/* Boutons d’action */}
                  <div className="flex gap-2 justify-center md:justify-end">
                    <ProfileEditModal user={user} />
                    <PasswordChangeModal userId={user.id} />
                  </div>
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-foreground/80 leading-relaxed mt-2">{user.bio}</p>
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

        {/* === SECTION INFOS === */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* --- Informations de contact --- */}
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

          {/* --- Informations professionnelles --- */}
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
                <InfoItem icon={GraduationCap} label="École / Université" value={user.ecole} />
              )}
              {user.entreprise && (
                <InfoItem icon={Building2} label="Entreprise / Société" value={user.entreprise} />
              )}
              {!user.ecole && !user.entreprise && (
                <p className="text-muted-foreground text-sm text-center py-4">
                  Aucune information professionnelle ajoutée.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;






// import { useState } from 'react';
// import { User, Mail, Phone, MapPin, Building2, GraduationCap, Edit } from 'lucide-react';
// import { Card, CardContent, CardHeader } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { mockUser } from '@/types/user';

// const Profile = () => {
//   const [user] = useState(mockUser);

//   const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
//     <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 transition-all hover:bg-muted/50">
//       <Icon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
//       <div className="flex-1 min-w-0">
//         <p className="text-sm font-medium text-muted-foreground mb-0.5">{label}</p>
//         <p className="text-sm text-foreground font-medium truncate">{value}</p>
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
//       <div className="container mx-auto px-4 py-8 max-w-4xl">
//         {/* Header Card */}
//         <Card className="mb-6 border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
//           <CardContent className="p-8">
//             <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
//               {/* Profile Picture */}
//               <div className="relative group">
//                 <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary/50 group-hover:ring-primary/40 transition-all duration-300">
//                   <img
//                     src={user.profilePicture}
//                     alt={`${user.firstName} ${user.lastName}`}
//                     className="w-full h-full object-cover"
//                   />
//                 </div>
//                 <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-primary to-accent p-2 rounded-full shadow-lg">
//                   <User className="h-4 w-4 text-primary-foreground" />
//                 </div>
//               </div>

//               {/* Header Info */}
//               <div className="flex-1 text-center md:text-left">
//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
//                   <div>
//                     <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-1">
//                       {user.firstName} {user.lastName}
//                     </h1>
//                     <p className="text-muted-foreground">{user.email}</p>
//                   </div>
//                   <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
//                     <Edit className="h-4 w-4 mr-2" />
//                     Modifier le profil
//                   </Button>
//                 </div>

//                 {user.bio && (
//                   <p className="text-foreground/80 leading-relaxed">{user.bio}</p>
//                 )}

//                 <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
//                   <Badge variant="secondary" className="font-medium">
//                     {user.gender === 'male' ? 'Homme' : user.gender === 'female' ? 'Femme' : 'Autre'}
//                   </Badge>
//                   <Badge variant="outline" className="font-medium">
//                     {user.city}, {user.country}
//                   </Badge>
//                 </div>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Information Cards */}
//         <div className="grid md:grid-cols-2 gap-6">
//           {/* Contact Information */}
//           <Card className="border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
//             <CardHeader>
//               <h2 className="text-xl font-semibold flex items-center gap-2">
//                 <div className="p-2 bg-primary/10 rounded-lg">
//                   <Mail className="h-5 w-5 text-primary" />
//                 </div>
//                 Informations de contact
//               </h2>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               <InfoItem icon={Mail} label="Email" value={user.email} />
//               <InfoItem icon={Phone} label="Téléphone" value={user.phone} />
//               <InfoItem icon={MapPin} label="Localisation" value={`${user.city}, ${user.country}`} />
//             </CardContent>
//           </Card>

//           {/* Professional Information */}
//           <Card className="border-border shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300">
//             <CardHeader>
//               <h2 className="text-xl font-semibold flex items-center gap-2">
//                 <div className="p-2 bg-accent/10 rounded-lg">
//                   <Building2 className="h-5 w-5 text-accent" />
//                 </div>
//                 Informations professionnelles
//               </h2>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {user.school && (
//                 <InfoItem icon={GraduationCap} label="École/Université" value={user.school} />
//               )}
//               {user.company && (
//                 <InfoItem icon={Building2} label="Entreprise/Société" value={user.company} />
//               )}
//               {!user.school && !user.company && (
//                 <p className="text-muted-foreground text-sm text-center py-4">
//                   Aucune information professionnelle ajoutée
//                 </p>
//               )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Profile;
