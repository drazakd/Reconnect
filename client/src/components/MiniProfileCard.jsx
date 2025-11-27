// src/components/MiniProfileCard.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import DefaultAvatar from "@/assets/profileimg.jpeg";

const buildImageSrc = (img) => {
  if (!img) return DefaultAvatar;
  if (/^https?:\/\//.test(img)) return img;
  const base = import.meta.env.VITE_API_URL;
  return `${base}/${img.replace(/^\/+/, "")}`;
};

// const buildImageSrc = (img) => {
//   if (!img) return DefaultAvatar;
//   if (/^https?:\/\//.test(img)) return img;
//   const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
//   // 🔥 Enlever "api/" s’il est au début
//   return `${base}/${img.replace(/^\/+/, "").replace(/^api\//, "")}`;
// };


/**
 * props:
 *  - user: { id, nom, prenom, image }
 *  - contactId: id de la row contacts (utile pour accepter/decliner)
 *  - type: "incoming" | "sent" | "friends"
 *  - onAccept(contactId) / onDecline(contactId) / onCancel(contactId) / onRemove(contactId)
 */
const MiniProfileCard = ({ user, contactId, type, onAccept, onDecline, onCancel, onRemove }) => {
  return (
    <div className="flex items-center justify-between bg-white shadow-sm rounded-lg p-3 w-full">
      <div className="flex items-center gap-3">
        <img
          src={buildImageSrc(user?.image)}
          alt={`${user?.nom ?? ""} ${user?.prenom ?? ""}`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <div className="font-medium text-gray-800">{user?.nom} {user?.prenom}</div>
        </div>
      </div>

      <div className="flex gap-2 flex-col sm:flex-row">
        {type === "incoming" && (
          <>
            <Button size="sm" onClick={() => onAccept(contactId)}>Accepter</Button>
            <Button size="sm" variant="destructive" onClick={() => onDecline(contactId)}>Refuser</Button>
          </>
        )}
        {type === "sent" && (
          <Button size="sm" variant="outline" onClick={() => onCancel(contactId)}>Annuler</Button>
        )}
        {type === "friends" && (
          <Button size="sm" variant="destructive" onClick={() => onRemove(contactId)}>Retirer</Button>
        )}
      </div>
    </div>
  );
};

export default MiniProfileCard;
