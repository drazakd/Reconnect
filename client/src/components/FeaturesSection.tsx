import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Heart, Users, Gift, MapPin, Shield } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: MessageCircle,
      title: "Messagerie Instantanée",
      description: "Communiquez en temps réel avec vos proches retrouvés grâce à notre système de chat sécurisé.",
      color: "text-primary"
    },
    {
      icon: Heart,
      title: "Cartes de Vœux Numériques",
      description: "Envoyez des cartes personnalisées pour les fêtes, anniversaires ou simplement pour prendre des nouvelles.",
      color: "text-secondary"
    },
    {
      icon: Users,
      title: "Réseau Personnel",
      description: "Gérez votre réseau de contacts retrouvés et suivez vos interactions avec chacun d'eux.",
      color: "text-primary"
    },
    {
      icon: Gift,
      title: "Soutien Financier",
      description: "Aidez vos proches en difficulté grâce à notre système de dons sécurisé et transparent.",
      color: "text-secondary"
    },
    {
      icon: MapPin,
      title: "Géolocalisation Intelligente",
      description: "Trouvez des personnes près de chez vous ou suivez les déplacements avec leur consentement.",
      color: "text-primary"
    },
    {
      icon: Shield,
      title: "Sécurité & Confidentialité",
      description: "Vos données sont protégées et vous contrôlez entièrement votre visibilité sur la plateforme.",
      color: "text-secondary"
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-warm bg-clip-text text-transparent">
            Fonctionnalités Complètes
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Une plateforme complète conçue pour faciliter les retrouvailles et maintenir des liens durables 
            avec vos proches, où qu'ils soient dans le monde.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} variant="feature" className="h-full">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card variant="glow">
            <CardHeader>
              <CardTitle className="text-2xl mb-4 flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                Success Stories
              </CardTitle>
              <CardDescription className="text-base">
                "Grâce à ReConnect, j'ai retrouvé mon frère après 15 ans de séparation. 
                Nous vivons maintenant dans la même ville et nos enfants se connaissent enfin !"
              </CardDescription>
              <p className="text-sm text-primary font-medium mt-2">- Marie, utilisatrice depuis 2023</p>
            </CardHeader>
          </Card>

          <Card variant="glow">
            <CardHeader>
              <CardTitle className="text-2xl mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-secondary" />
                Communauté Active
              </CardTitle>
              <CardDescription className="text-base">
                Rejoignez une communauté bienveillante de personnes qui partagent le même objectif : 
                retrouver leurs proches et maintenir des liens familiaux forts.
              </CardDescription>
              <p className="text-sm text-secondary font-medium mt-2">+1000 nouvelles connexions par mois</p>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;