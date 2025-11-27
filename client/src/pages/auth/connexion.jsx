import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const Connexion = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });

      console.log("Réponse API:", res.data); // 👈 debug
      login(res.data.user, res.data.token);
      
      navigate("/search", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-primary">
            Connexion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Connexion..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Connexion;









// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import api from "@/lib/api"; // ton axios instance
// import { useAuth } from "@/context/AuthContext";

// const Connexion = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       const res = await api.post("/auth/login", { email, password });
//       // Stocker token et user
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("user", JSON.stringify(res.data.user));
//       // Redirection après connexion
//       navigate("/"); // adapte selon ton app
//     } catch (err) {
//       setError(err.response?.data?.message || "Erreur de connexion");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100">
//       <Card className="w-full max-w-md shadow-lg rounded-2xl">
//         <CardHeader>
//           <CardTitle className="text-center text-2xl font-bold text-primary">Connexion</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-1">Email</label>
//               <Input
//                 type="email"
//                 placeholder="votre@email.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-1">Mot de passe</label>
//               <Input
//                 type="password"
//                 placeholder="Votre mot de passe"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//             {error && <p className="text-red-500 text-sm">{error}</p>}
//             <Button type="submit" className="w-full" disabled={loading}>
//               {loading ? "Connexion..." : "Se connecter"}
//             </Button>
//           </form>

//           <p className="text-center text-sm text-muted-foreground mt-2">
//             <Link to="/reset-password" className="text-primary font-medium">
//               Mot de passe oublié ?
//             </Link>
//           </p>

//           <p className="text-center text-sm text-muted-foreground mt-4">
//             Pas encore de compte ?{" "}
//             <Link to="/inscription" className="text-primary font-medium">
//               Inscrivez-vous
//             </Link>
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default Connexion;
