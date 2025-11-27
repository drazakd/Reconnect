// src/components/SearchSection.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, GraduationCap, Building } from "lucide-react";
import UserProfileCard from "@/components/ProfileCard";
import api from "@/lib/api";

const SearchSection = () => {
  const [filters, setFilters] = useState({
    nom: "",
    prenom: "",
    pays: "",
    ville: "",
    ecole: "",
    entreprise: "",
  });

  const [paysList, setPaysList] = useState([]);
  const [villeList, setVilleList] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Charger pays
  useEffect(() => {
    api.get("/users/pays")
      .then((res) => setPaysList(res.data))
      .catch((err) => console.error("Erreur pays:", err));
  }, []);

  // 🔹 Charger villes si pays choisi
  useEffect(() => {
    if (filters.pays) {
      api.get(`/users/villes/${encodeURIComponent(filters.pays)}`)
        .then((res) => setVilleList(res.data))
        .catch((err) => console.error("Erreur villes:", err));
    } else {
      setVilleList([]);
      setFilters((prev) => ({ ...prev, ville: "" }));
    }
  }, [filters.pays]);

  // 🔹 Lancer recherche - VERSION CORRIGÉE
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Nettoyage des filtres
      const cleanFilters: any = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          cleanFilters[key] = value;
        }
      });

      console.log('🔍 Filtres envoyés:', cleanFilters);
      
      const res = await api.get("/users/search", { 
        params: cleanFilters,
        paramsSerializer: {
          indexes: null // Formatage correct des arrays
        }
      });
      
      console.log('✅ Réponse complète:', res);
      
      // Gestion flexible de la réponse
      if (Array.isArray(res.data)) {
        setResults(res.data);
      } else if (res.data && Array.isArray(res.data.data)) {
        setResults(res.data.data);
      } else if (res.data && Array.isArray(res.data.users)) {
        setResults(res.data.users);
      } else {
        console.warn('⚠️ Format de réponse inattendu:', res.data);
        setResults([]);
      }
    } catch (err: any) {
      console.error("❌ Erreur recherche complète:", err);
      console.error("❌ Détails erreur:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="search" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Commencez votre recherche
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Utilisez nos outils pour retrouver vos proches
          </p>
        </div>

        {/* Formulaire CORRIGÉ */}
        <Card className="max-w-4xl mx-auto mb-16">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-6 h-6 text-primary" />
              Recherche Avancée
            </CardTitle>
            <CardDescription>Renseignez les informations connues</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input 
                placeholder="Nom" 
                value={filters.nom}
                onChange={(e) => setFilters({ ...filters, nom: e.target.value })} 
              />
              <Input 
                placeholder="Prénom" 
                value={filters.prenom}
                onChange={(e) => setFilters({ ...filters, prenom: e.target.value })} 
              />
              <Select 
                value={filters.pays} 
                onValueChange={(val) => setFilters({ ...filters, pays: val, ville: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un pays" />
                </SelectTrigger>
                <SelectContent>
                  {paysList.map((p: any, i) => (
                    <SelectItem key={i} value={p.pays}>{p.pays}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={filters.ville}
                onValueChange={(val) => setFilters({ ...filters, ville: val })}
                disabled={!filters.pays}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filters.pays ? "Sélectionnez une ville" : "Choisissez d'abord un pays"} />
                </SelectTrigger>
                <SelectContent>
                  {villeList.map((v: string, i) => (
                    <SelectItem key={i} value={v}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input 
                placeholder="École / Université" 
                value={filters.ecole}
                onChange={(e) => setFilters({ ...filters, ecole: e.target.value })} 
              />
            </div>

            <Input 
              placeholder="Entreprise" 
              value={filters.entreprise}
              onChange={(e) => setFilters({ ...filters, entreprise: e.target.value })} 
            />

            <Button 
              variant="hero" 
              size="lg" 
              className="w-full" 
              onClick={handleSearch} 
              disabled={loading}
            >
              <Search className="w-5 h-5 mr-2" />
              {loading ? "Recherche en cours..." : "Lancer la recherche"}
            </Button>
          </CardContent>
        </Card>

        {/* Résultats CORRIGÉ */}
        {results && results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 mx-auto">
            {results.map((u: any) => (
              <UserProfileCard
                key={u.id}
                user={{
                  ...u,
                  relationStatus: u.relationStatus || "none",
                }}
              />
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {Object.values(filters).some(f => f && f.trim() !== '') 
                  ? "Aucun résultat trouvé avec ces critères" 
                  : "Utilisez le formulaire pour lancer une recherche"
                }
              </p>
            </div>
          )
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Recherche en cours...</p>
          </div>
        )}

        {/* Catégories (fixes) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Par Lieu</h3>
              <p className="text-muted-foreground">Ville, région, pays</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <GraduationCap className="w-12 h-12 text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Par École</h3>
              <p className="text-muted-foreground">Retrouvez vos camarades</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <Building className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Par Travail</h3>
              <p className="text-muted-foreground">Reconnectez avec vos collègues</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SearchSection;







// import { useState } from "react";
// import axios from "axios";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { Search, MapPin, GraduationCap, Building } from "lucide-react";
// import UserProfileCard from "./ProfileCard";

// const SearchSection = () => {
//   // 🔹 States pour form
//   const [filters, setFilters] = useState({
//     nom: "",
//     prenom: "",
//     pays: "",
//     ville: "",
//     ecole: "",
//     entreprise: ""
//   });

//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // 🔹 Gestion changement champs
//   const handleChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const handleSelect = (name, value) => {
//     setFilters({ ...filters, [name]: value });
//   };

//   // 🔹 Soumettre la recherche
//   const handleSearch = async () => {
//     try {
//       setLoading(true);

//       // Appel backend
//       const res = await axios.get("http://localhost:3000/api/users", {
//         params: filters
//       });

//       setResults(res.data.data || []); // backend renvoie { success, data }
//     } catch (err) {
//       console.error("Erreur de recherche:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section id="search" className="py-20 bg-background">
//       <div className="container mx-auto px-4">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
//             Commencez votre recherche
//           </h2>
//           <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
//             Utilisez nos outils de recherche avancés pour retrouver vos proches.
//           </p>
//         </div>

//         {/* Formulaire */}
//         <Card variant="feature" className="max-w-4xl mx-auto mb-16">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Search className="w-6 h-6 text-primary" />
//               Recherche Avancée
//             </CardTitle>
//             <CardDescription>
//               Renseignez les informations connues
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <Input name="nom" placeholder="Nom" onChange={handleChange} />
//               <Input name="prenom" placeholder="Prénom" onChange={handleChange} />
//               <Select onValueChange={(val) => handleSelect("pays", val)}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Pays" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Côte d'Ivoire">Côte d'Ivoire</SelectItem>
//                   <SelectItem value="France">France</SelectItem>
//                   <SelectItem value="Canada">Canada</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <Input name="ville" placeholder="Ville" onChange={handleChange} />
//               <Input name="ecole" placeholder="École / Université" onChange={handleChange} />
//             </div>

//             <Input name="entreprise" placeholder="Entreprise" onChange={handleChange} />

//             <Button variant="hero" size="lg" className="w-full" onClick={handleSearch} disabled={loading}>
//               <Search className="w-5 h-5 mr-2" />
//               {loading ? "Recherche en cours..." : "Lancer la recherche"}
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Résultats */}
//         {results.length > 0 && (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
//             {results.map((user) => (
//               <UserProfileCard
//                 key={user.id}
//                 nom={user.nom}
//                 prenom={user.prenom}
//                 job={user.entreprise || user.ecole}
//                 image={user.image}
//                 bio={`Habite à ${user.ville}, ${user.pays}`}
//               />
//             ))}
//           </div>
//         )}

//         {/* Search Categories */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//           <Card variant="warm" className="text-center">
//             <CardContent className="pt-6">
//               <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
//               <h3 className="text-xl font-semibold mb-2">Par Lieu</h3>
//               <p className="text-muted-foreground">Recherchez par ville, région ou pays</p>
//             </CardContent>
//           </Card>

//           <Card variant="warm" className="text-center">
//             <CardContent className="pt-6">
//               <GraduationCap className="w-12 h-12 text-secondary mx-auto mb-4" />
//               <h3 className="text-xl font-semibold mb-2">Par École</h3>
//               <p className="text-muted-foreground">Retrouvez vos anciens camarades</p>
//             </CardContent>
//           </Card>

//           <Card variant="warm" className="text-center">
//             <CardContent className="pt-6">
//               <Building className="w-12 h-12 text-primary mx-auto mb-4" />
//               <h3 className="text-xl font-semibold mb-2">Par Travail</h3>
//               <p className="text-muted-foreground">Reconnectez avec vos anciens collègues</p>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default SearchSection;
