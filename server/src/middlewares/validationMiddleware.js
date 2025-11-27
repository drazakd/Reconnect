// Server/src/middlewares/validationMiddleware.js
import Joi from "joi";

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details.map((detail) => detail.message).join(", "),
    });
  }
  next();
};

export const registerSchema = Joi.object({
  nom: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Le nom est requis",
    "string.min": "Le nom doit contenir au moins 2 caractères",
    "string.max": "Le nom ne peut pas dépasser 100 caractères",
  }),
  prenom: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Le prénom est requis",
    "string.min": "Le prénom doit contenir au moins 2 caractères",
    "string.max": "Le prénom ne peut pas dépasser 100 caractères",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "L'email doit être valide",
    "string.empty": "L'email est requis",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Le mot de passe doit contenir au moins 6 caractères",
    "string.empty": "Le mot de passe est requis",
  }),
  pays: Joi.string().min(2).required().messages({
    "string.empty": "Le pays est requis",
  }),
  ville: Joi.string().min(2).required().messages({
    "string.empty": "La ville est requise",
  }),
  sexe: Joi.string().valid("Homme", "Femme").required().messages({
    "any.only": "Le sexe doit être 'Homme' ou 'Femme'",
    "string.empty": "Le sexe est requis",
  }),
  telephone: Joi.string().optional().allow("").messages({
    "string.pattern.base": "Le numéro de téléphone est invalide",
  }),
  // ✅ Nouveaux champs
  ecole: Joi.string().max(150).optional().allow("").messages({
    "string.max": "Le nom de l'école ne peut pas dépasser 150 caractères",
  }),
  entreprise: Joi.string().max(150).optional().allow("").messages({
    "string.max": "Le nom de l'entreprise ne peut pas dépasser 150 caractères",
  }),
  image: Joi.any().optional(),

}).unknown(true); 

export default validate;
