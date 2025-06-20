import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface PartyFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  selectedGenre: string;
  onGenreChange: (genre: string) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  dateFilter: string;
  onDateFilterChange: (date: string) => void;
  onClearFilters: () => void;
  genres: string[];
  locations: string[];
}

const PartyFilters: React.FC<PartyFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedGenre,
  onGenreChange,
  selectedLocation,
  onLocationChange,
  dateFilter,
  onDateFilterChange,
  onClearFilters,
  genres,
  locations,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Nach Parties suchen..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 lg:gap-4 w-full lg:w-auto">
          <Select value={selectedGenre} onValueChange={onGenreChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Genres</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLocation} onValueChange={onLocationChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Ort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Orte</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={onDateFilterChange}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Datum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Termine</SelectItem>
              <SelectItem value="today">Heute</SelectItem>
              <SelectItem value="tomorrow">Morgen</SelectItem>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={onClearFilters}
            variant="outline"
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Filter zurücksetzen
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PartyFilters;
