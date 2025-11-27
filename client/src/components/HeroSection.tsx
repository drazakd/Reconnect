import { Button } from "@/components/ui/button";
import { Search, Heart, Users, MessageCircle } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-subtle overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Personnes se reconnectant avec joie"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-warm opacity-10"></div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 z-10">
        <div className="animate-float absolute top-20 left-10 opacity-30">
          <Heart className="w-16 h-16 text-primary" />
        </div>
        <div className="animate-float absolute top-40 right-20 opacity-30" style={{ animationDelay: '1s' }}>
          <Users className="w-20 h-20 text-secondary" />
        </div>
        <div className="animate-float absolute bottom-40 left-20 opacity-30" style={{ animationDelay: '2s' }}>
          <MessageCircle className="w-12 h-12 text-primary" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-warm bg-clip-text text-transparent leading-tight">
            Retrouvez vos <br />
            <span className="text-primary">proches perdus</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            La plateforme qui reconnecte les familles et les amis séparés par le temps et la distance. 
            Partagez vos souvenirs, soutenez-vous mutuellement.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link to="/search">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                <Search className="w-5 h-5 mr-2" />
                Commencer ma recherche
              </Button>
            </Link>
            {/* <Button variant="warm" size="xl" className="w-full sm:w-auto">
              <Users className="w-5 h-5 mr-2" />
              Créer mon profil
            </Button> */}
          </div>
          
          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Retrouvailles réussies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">50,000+</div>
              <div className="text-muted-foreground">Utilisateurs actifs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">150+</div>
              <div className="text-muted-foreground">Pays connectés</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;