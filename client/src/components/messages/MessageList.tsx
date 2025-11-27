// src/components/messages/MessagesList.tsx
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Contact } from "@/pages/Messages";
import DefaultAvatar from "@/assets/profileimg.jpeg";

interface MessageListProps {
  contacts: Contact[];
  selectedContact: Contact | null;
  onSelectContact: (contact: Contact) => void;
}
const buildImageSrc = (img) => {
  if (!img) return DefaultAvatar;
  if (/^https?:\/\//.test(img)) return img;
  const base = import.meta.env.VITE_API_URL || "http://localhost:3000";
  return `${base}/${img.replace(/^\/+/, "")}`;
};

const MessageList = ({ contacts, selectedContact, onSelectContact }: MessageListProps) => {
  return (
    <div className="w-full md:w-96 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une conversation..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={cn(
              "w-full p-4 flex items-start gap-3 hover:bg-primary transition-colors border-b",
              selectedContact?.id === contact.id && "bg-primary"
            )}
          >
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={buildImageSrc(contact.avatar)} />
                <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              {contact.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-card" />
              )}
            </div>

            <div className="flex-1 text-left overflow-hidden">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{contact.name}</span>
                <span className="text-xs text-muted-foreground">{contact.timestamp}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate flex-1">
                  {contact.lastMessage}
                </p>
                {contact.unread > 0 && (
                  <Badge className="ml-2 h-5 min-w-[20px] rounded-full bg-primary">
                    {contact.unread}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MessageList;
