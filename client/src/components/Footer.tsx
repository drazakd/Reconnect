import { Heart, Facebook, Twitter, Instagram, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-8 h-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ReConnect
              </span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              La plateforme qui reconnecte les familles et les amis séparés par le temps et la distance. 
              Ensemble, rebuilding connections that matter.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Mail className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Liens Rapides</h3>
            <ul className="space-y-2">
              <li><a href="#search" className="text-muted-foreground hover:text-primary transition-colors">Rechercher</a></li>
              <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Fonctionnalités</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Support</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Centre d'aide</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Politique de confidentialité</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Conditions d'utilisation</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2025 ReConnect. Tous droits réservés. Fait avec{" "}
            <Heart className="w-4 h-4 text-primary inline mx-1" />{" "}
            pour reconnecte les familles.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;