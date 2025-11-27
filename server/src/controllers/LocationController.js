import * as LocationService from "../services/LocationService.js";

export const getPays = async (req, res) => {
  try {
    const countries = await LocationService.getAllCountries();
    res.json(countries); // renvoie [{pays: 'Côte d''Ivoire'}, ...]
  } catch (err) {
    console.error("Erreur récupération pays:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getVilles = async (req, res) => {
  try {
    const { pays } = req.params;
    const cities = await LocationService.getCitiesByCountry(pays);
    res.json(cities); // renvoie [{ville: 'Abidjan'}, ...]
  } catch (err) {
    console.error("Erreur récupération villes:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
