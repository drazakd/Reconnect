import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Search, Users, Bell, Menu, X, Check, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ✅ Import du service Notification
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, } from "@/services/notificationApi";

interface Notification {
  id: number;
  title: string;
  is_read: boolean;
}

const Header = () => {
  const { user, logout, token } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 🔁 Charger les notifications depuis le backend
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const data = await getNotifications(token);
      setNotifications(data || []);
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    }
  };

  // 📦 Charger les notifications au montage + recharger toutes les 30 secondes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // const markAsRead = (id: number) => {
  //   setNotifications((prev) =>
  //     prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
  //   );
  // };

  // const markAllAsRead = () => {
  //   setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  // };

  const markAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id, token); // ✅ Màj côté backend
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Erreur lors du marquage comme lu :", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(token); // ✅ Màj côté backend
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Erreur lors du marquage de toutes comme lues :", err);
    }
  };

  return (
    <header className="bg-background/95 backdrop-blur border-b border-border sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/reconnect" className="flex items-center space-x-2">
          <Heart className="w-8 h-8 text-primary" />
          <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ReConnect
          </span>
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            to="/search"
            className="flex items-center space-x-1 text-muted-foreground hover:text-primary"
          >
            <Search className="w-4 h-4" />
            <span>Rechercher</span>
          </Link>
          <Link
            to="/network"
            className="flex items-center space-x-1 text-muted-foreground hover:text-primary"
          >
            <Users className="w-4 h-4" />
            <span>Mon Réseau</span>
          </Link>
          <Link to="/features" className="text-muted-foreground hover:text-primary">
            Fonctionnalités
          </Link>
          
        </div>

        {/* Droite */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-full hover:bg-muted transition">
                  <Bell className="w-6 h-6 text-primary" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:underline flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Tout lire</span>
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <DropdownMenuItem>Aucune notification</DropdownMenuItem>
                ) : (
                  notifications.map((n) => (
                    <DropdownMenuItem
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={n.is_read ? "text-muted-foreground" : "font-semibold"}
                    >
                      {n.title}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Auth */}
          {user ? (
            <>
              <Link to="/messages" className="hidden md:block text-muted-foreground hover:text-primary">
                {/* <MessageCircle /> */}
                Messages
              </Link>
              <Link to="/profile" className="hidden md:block text-muted-foreground hover:text-primary">
                Profile
              </Link>

              <span className="hidden sm:block text-sm font-medium text-primary">
                👋 Bonjour, {user.nom || user.email}
              </span>
              <Button variant="destructive" size="sm" onClick={logout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link to="/connexion">
                <Button variant="ghost" size="sm">
                  Connexion
                </Button>
              </Link>
              <Link to="/inscription">
                <Button variant="hero" size="sm">
                  S'inscrire
                </Button>
              </Link>
            </>
          )}

          {/* Burger Menu (mobile) */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Menu Mobile */}
      {mobileOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="flex flex-col p-4 space-y-4">
            <Link to="/search" onClick={() => setMobileOpen(false)}>
              🔍 Rechercher
            </Link>
            <Link to="/network" onClick={() => setMobileOpen(false)}>
              👥 Mon Réseau
            </Link>
            <Link to="/features" onClick={() => setMobileOpen(false)}>
              ⚡ Fonctionnalités
            </Link>
            <Link to="/messages" onClick={() => setMobileOpen(false)}>
              💬 Message
            </Link>
            <Link to="/profile" onClick={() => setMobileOpen(false)}>
              👤 Profil
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;









// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Heart, Search, Users, Bell, Menu, X } from "lucide-react";
// import { Link } from "react-router-dom";
// import { useAuth } from "@/context/AuthContext";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";

// const Header = () => {
//   const { user, logout } = useAuth();
//   const [menuOpen, setMenuOpen] = useState(false);

//   // Notifications mock (tu remplaceras par API backend)
//   const [notifications, setNotifications] = useState([
//     { id: 1, message: "Nouvelle demande de connexion", read: false },
//     { id: 2, message: "Ton profil a été visité 5 fois aujourd'hui", read: false },
//   ]);

//   const unreadCount = notifications.filter((n) => !n.read).length;
//   const markAsRead = (id: number) => {
//     setNotifications((prev) =>
//       prev.map((n) => (n.id === id ? { ...n, read: true } : n))
//     );
//   };

//   return (
//     <header className="bg-background/95 backdrop-blur border-b sticky top-0 z-50">
//       <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
//         {/* Logo */}
//         <Link to="/reconnect">
//           <div className="flex items-center space-x-2">
//             <Heart className="w-8 h-8 text-primary" />
//             <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
//               ReConnect
//             </span>
//           </div>
//         </Link>

//         {/* --- Desktop Nav --- */}
//         <div className="hidden md:flex items-center space-x-6">
//           <Link to="/search" className="flex items-center space-x-1 hover:text-primary">
//             <Search className="w-4 h-4" />
//             <span>Rechercher</span>
//           </Link>
//           <Link to="/network" className="flex items-center space-x-1 hover:text-primary">
//             <Users className="w-4 h-4" />
//             <span>Mon Réseau</span>
//           </Link>
//           <Link to="/features" className="hover:text-primary">Fonctionnalités</Link>
//         </div>

//         {/* --- Right side --- */}
//         <div className="flex items-center space-x-3">
//           {/* Notifications */}
//           {user && (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <button className="relative p-2 rounded-full hover:bg-muted transition">
//                   <Bell className="w-6 h-6 text-primary" />
//                   {unreadCount > 0 && (
//                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
//                       {unreadCount}
//                     </span>
//                   )}
//                 </button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-72">
//                 <DropdownMenuLabel>Notifications</DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 {notifications.length === 0 ? (
//                   <DropdownMenuItem>Aucune notification</DropdownMenuItem>
//                 ) : (
//                   notifications.map((n) => (
//                     <DropdownMenuItem
//                       key={n.id}
//                       onClick={() => markAsRead(n.id)}
//                       className={n.read ? "text-muted-foreground" : "font-semibold"}
//                     >
//                       {n.message}
//                     </DropdownMenuItem>
//                   ))
//                 )}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           )}

//           {/* Auth */}
//           {user ? (
//             <>
//               <span className="hidden md:inline text-sm font-medium text-primary">
//                 👋 {user.nom || user.email}
//               </span>
//               <Button variant="destructive" size="sm" onClick={logout}>
//                 Déconnexion
//               </Button>
//             </>
//           ) : (
//             <>
//               <Link to="/connexion">
//                 <Button variant="ghost" size="sm">Connexion</Button>
//               </Link>
//               <Link to="/inscription">
//                 <Button variant="hero" size="sm">S'inscrire</Button>
//               </Link>
//             </>
//           )}

//           {/* --- Mobile Menu Button --- */}
//           <button
//             className="md:hidden p-2 rounded hover:bg-muted"
//             onClick={() => setMenuOpen(!menuOpen)}
//           >
//             {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//           </button>
//         </div>
//       </nav>

//       {/* --- Mobile Menu Drawer --- */}
//       {menuOpen && (
//         <div className="md:hidden bg-background border-t px-4 py-3 space-y-3">
//           <Link to="/search" className="block hover:text-primary">Rechercher</Link>
//           <Link to="/network" className="block hover:text-primary">Mon Réseau</Link>
//           <Link to="/features" className="block hover:text-primary">Fonctionnalités</Link>
//         </div>
//       )}
//     </header>
//   );
// };

// export default Header;
