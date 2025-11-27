// ✅ src/components/EditProfileDialog.tsx
// Ce composant gère la modification du profil utilisateur via une fenêtre modale (Dialog).
// Il utilise les composants Shadcn/UI et les hooks React pour gérer l'état du formulaire.

// ✅ src/components/EditProfileDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ✅ Typages explicites
export interface User {
  id: number;
  nom: string;
  prenom: string;
  telephone?: string;
  pays: string;
  ville: string;
  ecole?: string;
  entreprise?: string;
}

export interface UpdateUserData {
  nom: string;
  prenom: string;
  telephone?: string;
  pays: string;
  ville: string;
  ecole?: string;
  entreprise?: string;
}

interface EditProfileDialogProps {
  user: User;
  onUpdate: (data: UpdateUserData) => Promise<void>;
}

export const EditProfileDialog = ({ user, onUpdate }: EditProfileDialogProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<UpdateUserData>({
    nom: user.nom || "",
    prenom: user.prenom || "",
    telephone: user.telephone || "",
    pays: user.pays || "",
    ville: user.ville || "",
    ecole: user.ecole || "",
    entreprise: user.entreprise || "",
  });

  // ✅ Gestion du formulaire
  const handleChange = (field: keyof UpdateUserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onUpdate(formData);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
      setOpen(false);
    } catch (error) {
      console.error("Erreur mise à jour profil :", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil. Réessayez plus tard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Pencil className="w-4 h-4" />
          Modifier le profil
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Nom & Prénom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="prenom">Prénom</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => handleChange("prenom", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="nom">Nom</Label>
              <Input
                id="nom"
                value={formData.nom}
                onChange={(e) => handleChange("nom", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Téléphone */}
          <div>
            <Label htmlFor="telephone">Téléphone</Label>
            <Input
              id="telephone"
              type="tel"
              value={formData.telephone}
              onChange={(e) => handleChange("telephone", e.target.value)}
            />
          </div>

          {/* Pays & Ville */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pays">Pays</Label>
              <Input
                id="pays"
                value={formData.pays}
                onChange={(e) => handleChange("pays", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="ville">Ville</Label>
              <Input
                id="ville"
                value={formData.ville}
                onChange={(e) => handleChange("ville", e.target.value)}
                required
              />
            </div>
          </div>

          {/* École */}
          <div>
            <Label htmlFor="ecole">École / Université</Label>
            <Input
              id="ecole"
              value={formData.ecole}
              onChange={(e) => handleChange("ecole", e.target.value)}
              placeholder="Ex: Université Félix Houphouët-Boigny"
            />
          </div>

          {/* Entreprise */}
          <div>
            <Label htmlFor="entreprise">Entreprise / Société</Label>
            <Input
              id="entreprise"
              value={formData.entreprise}
              onChange={(e) => handleChange("entreprise", e.target.value)}
              placeholder="Ex: Orange CI"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
