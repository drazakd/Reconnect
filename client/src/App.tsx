// src/App.tsx
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Connexion from "@/pages/auth/connexion";
import Inscription from "@/pages/auth/inscription";
import ResetPassword from "@/pages/auth/resetPassword";
import PrivateRoute from "@/components/PrivateRoute";
import Dashboard from "@/pages/Dashboard";
import Header from "@/components/Header";
import HeroSection from "./components/HeroSection";
import SearchSection from "./components/SearchSection";
import Footer from "./components/Footer";
import FeaturesSection from "./components/FeaturesSection";
import ProfileCard from "./components/ProfileCard";
import NetworkPage from "@/pages/NetworkPage";
import Profile from "./pages/Profile";
import ProfileDetails from "./pages/ProfileDetails";
import Messages from "./pages/Messages";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { connectSocket } from "@/lib/socket";

const queryClient = new QueryClient();

// ✅ Composant interne pour initialiser le socket une fois connecté
const SocketInitializer = () => {
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      connectSocket(token);
    }
  }, [token]);

  return null; // rien à afficher
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* 👇 AuthProvider englobe toute l'app */}
        <AuthProvider>
          {/* ✅ Initialise Socket.IO après authentification */}
          <SocketInitializer />

          <Header /> {/* 👈 Le menu est toujours visible */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/reconnect" element={<HeroSection />} />
            <Route
              path="/search"
              element={
                <PrivateRoute>
                  <SearchSection />
                </PrivateRoute>
              }
            />
            <Route path="/features" element={<FeaturesSection />} />
            <Route
              path="/profilecard"
              element={
                <PrivateRoute>
                  <ProfileCard />
                </PrivateRoute>
              }
            />
            <Route
              path="/network"
              element={
                <PrivateRoute>
                  <NetworkPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <PrivateRoute>
                  <ProfileDetails />
                </PrivateRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <PrivateRoute>
                  <Messages />
                </PrivateRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          <Footer /> {/* 👈 Toujours visible */}
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;



// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import Index from "./pages/Index";
// import NotFound from "./pages/NotFound";
// import Connexion from "@/pages/auth/connexion";
// import Inscription from "@/pages/auth/inscription";
// import ResetPassword from "@/pages/auth/resetPassword";
// import PrivateRoute from "@/components/PrivateRoute";
// import Dashboard from "@/pages/Dashboard";
// import Header from "@/components/Header"; 
// import { AuthProvider } from "@/context/AuthContext"; // 👈 import du provider
// import HeroSection from "./components/HeroSection";
// import SearchSection from "./components/SearchSection";
// import Footer from "./components/Footer";
// import FeaturesSection from "./components/FeaturesSection";
// import ProfileCard from "./components/ProfileCard";
// import NetworkPage from "@/pages/NetworkPage"
// import Profile from "./pages/Profile";
// import ProfileDetails from "./pages/ProfileDetails";
// import Messages from "./pages/Messages";

// const queryClient = new QueryClient();

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <BrowserRouter>
//         {/* 👇 AuthProvider englobe toute l'app */}
//         <AuthProvider>
//           <Header /> {/* 👈 Le menu est toujours visible */}
//           <Routes>
//             <Route 
//               path="/" 
//               element={<Index />} 
//             />
//             <Route 
//               path="/connexion" 
//               element={<Connexion />} 
//             />
//             <Route 
//               path="/inscription" 
//               element={<Inscription />} 
//             />
//             <Route 
//               path="/reset-password" 
//               element={<ResetPassword />} 
//             />

//             <Route
//               path="/dashboard"
//               element={
//                 <PrivateRoute>
//                   <Dashboard />
//                 </PrivateRoute>
//               }
//             />
//             <Route
//               path="/reconnect"
//               element={
//                 <HeroSection />  
//               }
//             />
//             <Route
//               path="/search"
//               element={
//                 <PrivateRoute>
//                   <SearchSection />
//                 </PrivateRoute>
//               }
//             />
//             <Route
//               path="/features"
//               element={
//                 <FeaturesSection />                
//               }
//             />
//             <Route
//               path="/profilecard"
//               element={
//                 <PrivateRoute>
//                   <ProfileCard />
//                 </PrivateRoute>
//               }
//             />
//             <Route
//               path="/network"
//               element={
//                 <PrivateRoute>
//                   <NetworkPage />
//                 </PrivateRoute>
//               }
//             />
//             <Route 
//               path="/profile" 
//               element={
//                 <PrivateRoute>
//                   <Profile />
//                 </PrivateRoute>
//               } 
//             />
//             <Route 
//               path="/profile/:id" 
//               element={
//                 <PrivateRoute>
//                   <ProfileDetails />
//                 </PrivateRoute>
//               } 
//             />
//             <Route 
//               path="/messages" 
//               element={
//                 <PrivateRoute>
//                   <Messages />
//                 </PrivateRoute>
//               } 
//             />

//             {/* Catch-all */}
//             <Route path="*" element={<NotFound />} />
//           </Routes>
//           <Footer /> {/* 👈 Le menu est toujours visible */}
//         </AuthProvider>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;
