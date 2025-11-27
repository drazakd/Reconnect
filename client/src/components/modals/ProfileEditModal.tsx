// src/components/modals/ProfileEditModal.tsx
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Edit } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

function ProfileEditForm({ user, onClose, onUserUpdated }) {
  const [formData, setFormData] = useState({
    nom: user.nom || "",
    prenom: user.prenom || "",
    email: user.email || "",
    telephone: user.telephone || "",
    bio: user.bio || "",
    ecole: user.ecole || "",
    entreprise: user.entreprise || "",
    pays: user.pays || "",
    ville: user.ville || "",
    sexe: user.sexe || "Homme",
  });
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (image) data.append("image", image);

      const res = await api.put(`/users/${user.id}`, data);
      const updatedUser = res.data;

      toast.success("Profil mis à jour avec succès 🎉");

      // ✅ Actualise le user dans le contexte global
      onUserUpdated(updatedUser);

      onClose(); // ferme la modale
    } catch (err) {
      console.error("Erreur de mise à jour :", err);
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4">
        {[
          { id: "nom", label: "Nom" },
          { id: "prenom", label: "Prénom" },
          { id: "email", label: "Email", type: "email" },
          { id: "telephone", label: "Téléphone" },
          { id: "pays", label: "Pays" },
          { id: "ville", label: "Ville" },
          { id: "ecole", label: "École / Université" },
          { id: "entreprise", label: "Entreprise / Société" },
        ].map(({ id, label, type }) => (
          <div className="grid gap-2" key={id}>
            <Label htmlFor={id}>{label}</Label>
            <Input id={id} type={type || "text"} value={formData[id]} onChange={handleChange} />
          </div>
        ))}

        <div className="grid gap-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            value={formData.bio}
            onChange={handleChange}
            className="border rounded p-2 resize-none"
            rows={3}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="sexe">Sexe</Label>
          <select id="sexe" value={formData.sexe} onChange={handleChange}>
            <option>Homme</option>
            <option>Femme</option>
            <option>Autre</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="image">Photo de profil</Label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
          />
        </div>
      </div>

      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button variant="outline" type="button">
            Annuler
          </Button>
        </DialogClose>
        <Button type="submit" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function ProfileEditModal({ user }) {
  const { login, token } = useAuth();

  // Met à jour le user dans le contexte et localStorage
  const handleUserUpdated = (updatedUser) => {
    login(updatedUser, token);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
          <Edit className="h-4 w-4 mr-2" />
          Modifier le profil
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>
            Modifiez vos informations personnelles, puis cliquez sur "Enregistrer".
          </DialogDescription>
        </DialogHeader>

        <ProfileEditForm
          user={user}
          onClose={() => {}}
          onUserUpdated={handleUserUpdated}
        />
      </DialogContent>
    </Dialog>
  );
}
