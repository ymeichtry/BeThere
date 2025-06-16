import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Heart, Calendar, MapPin, Music, Edit, Trash2, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type Profile = { id: string; name: string | null; avatar_url: string | null };

type Party = {
  id: string;
  title: string;
  location: string;
  datetime: string;
  genre: string | null;
  created_by: string;
  description: string | null;
  is_public: boolean | null;
  created_at: string | null;
  entry_fee: number | null;
  access_id: string;
};

interface PartyCardProps {
  party: Party;
  host: Profile;
  likesCount: number;
  attendeesCount: number;
  isOwner?: boolean;
  showActions?: boolean;
  onEdit?: (party: Party) => void;
  onDelete?: (partyId: string) => void;
}

const PartyCard: React.FC<PartyCardProps> = ({
  party,
  host,
  likesCount,
  attendeesCount,
  isOwner = false,
  showActions = false,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const handlePartyClick = () => {
    navigate(`/party/${party.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(party);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Sind Sie sicher, dass Sie diese Party löschen möchten?")) {
      const { error } = await supabase.from("parties").delete().eq("id", party.id);
      if (error) {
        toast({ title: "Fehler", description: "Party konnte nicht gelöscht werden" });
      } else {
        toast({ title: "Erfolg", description: "Party wurde gelöscht" });
        if (onDelete) onDelete(party.id);
      }
    }
  };

  const copyPrivateLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const idToCopy = party.access_id;
    await navigator.clipboard.writeText(idToCopy);
    toast({ title: "ID kopiert", description: "Die Party-ID wurde in die Zwischenablage kopiert" });
  };

  return (
    <div
      className="border rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer bg-white"
      onClick={handlePartyClick}
    >
      <div className="flex flex-col md:flex-row items-start gap-4 p-6">
        <div className="flex flex-col items-center min-w-[100px]">
          <img
            src={host?.avatar_url || "/placeholder.svg"}
            alt="Host"
            className="w-16 h-16 rounded-full object-cover border"
          />
          <span className="text-center text-sm mt-2">{host?.name || "Host"}</span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-bold text-xl">{party.title}</span>
            {!party.is_public && (
              <span className="text-xs text-yellow-600 bg-yellow-200 rounded px-2 py-1">Privat</span>
            )}
          </div>
          
          {party.description && (
            <div className="mb-3 text-gray-600 line-clamp-2">{party.description}</div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>{new Date(party.datetime).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{party.location}</span>
            </div>
            {party.genre && (
              <div className="flex items-center gap-2">
                <Music className="w-4 h-4 text-purple-500" />
                <span>{party.genre}</span>
              </div>
            )}
            {party.entry_fee && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Eintritt: {party.entry_fee}€</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{attendeesCount} Teilnehmer</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                <span>{likesCount} Likes</span>
              </div>
            </div>

            {showActions && isOwner && (
              <div className="flex items-center gap-2">
                {!party.is_public && (
                  <Button
                    onClick={copyPrivateLink}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Link2 className="w-4 h-4" />
                    Link
                  </Button>
                )}
                <Button
                  onClick={handleEdit}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Edit className="w-4 h-4" />
                  Bearbeiten
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Löschen
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyCard;
