// Client/src/pages/auth/inscription.jsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ Ajout de useNavigate
import api from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";

export default function Inscription() {
  const { toast } = useToast();
  const navigate = useNavigate(); // ✅ Hook pour la navigation
  const [isLoading, setIsLoading] = useState(false); // ✅ État de chargement

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    sexe: "",
    pays: "",
    ville: "",
    ecole: "",
    entreprise: "",
    bio: "",
    password: "",
    passwordConfirm: "",
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true); // ✅ Début du chargement

    // Validation des mots de passe
    if (formData.password !== formData.passwordConfirm) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas ❌",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Validation de la longueur du mot de passe
    if (formData.password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères ❌",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "passwordConfirm") { // ✅ Ne pas envoyer passwordConfirm
          data.append(key, formData[key] || "");
        }
      });
      if (image) data.append("image", image);

      const response = await api.post("/auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast({
          title: "Félicitations 🎉",
          description: "Votre compte a été créé avec succès ! Vous pouvez maintenant vous connecter.",
          duration: 5000, // ✅ Toast plus long pour lire le message
        });
        
        // ✅ Redirection vers la page de connexion après 2 secondes
        setTimeout(() => {
          navigate("/connexion"); // ✅ Navigation React Router
        }, 2000);
      }
    } catch (err) {
      console.error("Erreur d'inscription:", err);
      
      // ✅ Messages d'erreur plus spécifiques
      let errorMessage = "Erreur lors de l'inscription 🚨";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.code === "NETWORK_ERROR") {
        errorMessage = "Problème de connexion au serveur";
      }

      toast({
        title: "Erreur d'inscription",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // ✅ Fin du chargement dans tous les cas
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-green-100 to-teal-100 p-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-primary">
            Créer votre compte
          </CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Rejoignez la communauté Reconnect
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom *</label>
                <Input
                  type="text"
                  name="nom"
                  placeholder="Votre nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prénom *</label>
                <Input
                  type="text"
                  name="prenom"
                  placeholder="Votre prénom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <Input
                type="email"
                name="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Téléphone</label>
              <Input
                type="tel"
                name="telephone"
                placeholder="+225 .. .. .. .. .."
                value={formData.telephone}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sexe *</label>
                <Select
                  name="sexe"
                  value={formData.sexe}
                  onValueChange={(value) =>
                    handleChange({ target: { name: "sexe", value } })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisissez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Homme">Homme</SelectItem>
                    <SelectItem value="Femme">Femme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Pays *</label>
                <Input
                  type="text"
                  name="pays"
                  placeholder="Côte d'Ivoire"
                  value={formData.pays}
                  onChange={handleChange}
                  required
                  autoComplete="country"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Ville *</label>
              <Input
                type="text"
                name="ville"
                placeholder="Abidjan"
                value={formData.ville}
                onChange={handleChange}
                required
                autoComplete="address-level2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                École / Université
              </label>
              <Input
                type="text"
                name="ecole"
                placeholder="Université FHB"
                value={formData.ecole}
                onChange={handleChange}
                autoComplete="school"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Entreprise / Société
              </label>
              <Input
                type="text"
                name="entreprise"
                placeholder="ReConnect company"
                value={formData.entreprise}
                onChange={handleChange}
                autoComplete="organization"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Biographie
              </label>
              <textarea
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                name="bio"
                placeholder="Présentez-vous en quelques mots..."
                value={formData.bio}
                onChange={handleChange}
                autoComplete="bio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Photo de profil
              </label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Formats acceptés: JPG, PNG, WEBP (max 5MB)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Mot de passe *
              </label>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 caractères"
                required
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Confirmer le mot de passe *
              </label>
              <Input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="Confirmez votre mot de passe"
                required
                autoComplete="new-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading} // ✅ Désactiver pendant le chargement
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Création du compte...
                </>
              ) : (
                "Créer mon compte"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Déjà inscrit ?{" "}
            <Link 
              to="/connexion" 
              className="text-primary font-medium hover:underline"
            >
              Connectez-vous ici
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}