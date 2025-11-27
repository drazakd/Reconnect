// src/components/modals/PasswordChangeModal.tsx
import { useState } from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

export default function PasswordChangeModal({ userId }) {
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      alert("Le nouveau mot de passe et sa confirmation ne correspondent pas.");
      return;
    }
    try {
      await api.put(`/users/${userId}/password`, { currentPwd, newPwd });
      alert("Mot de passe mis à jour avec succès !");
    } catch (err) {
      console.error("Erreur de mise à jour du mot de passe:", err);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Changer mot de passe</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Changer mot de passe</DialogTitle>
          <DialogDescription>Entrez votre mot de passe actuel et le nouveau mot de passe.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="currentPwd">Mot de passe actuel</Label>
              <Input id="currentPwd" type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="newPwd">Nouveau mot de passe</Label>
              <Input id="newPwd" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPwd">Confirmer mot de passe</Label>
              <Input id="confirmPwd" type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">Annuler</Button>
            </DialogClose>
            <Button type="submit">Valider</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
