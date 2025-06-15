import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Link } from 'react-router-dom';
import { Party } from '../lib/supabase';

import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  parties: Party[];
  userLocation?: [number, number];
}

const MapView: React.FC<MapViewProps> = ({ parties, userLocation }) => {
  const [center, setCenter] = useState<[number, number]>([51.165691, 10.451526]); // Default to Germany center
  
  useEffect(() => {
    if (userLocation) {
      setCenter(userLocation);
    }
  }, [userLocation]);

  const partyIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const userIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  return (
    <MapContainer 
      center={center} 
      zoom={13} 
      style={{ width: '100%', height: '100%', zIndex: 1 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* User location marker */}
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <strong>Your location</strong>
            </div>
          </Popup>
        </Marker>
      )}
      
      {/* Party markers */}
      {parties.map(party => {
        if (party.latitude && party.longitude) {
          return (
            <Marker 
              key={party.id} 
              position={[party.latitude, party.longitude]} 
              icon={partyIcon}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-lg">{party.title}</h3>
                  <p className="text-sm text-neutral-600">{party.location}</p>
                  <Link 
                    to={`/party/${party.id}`}
                    className="inline-block mt-2 px-4 py-1 bg-primary-500 text-white text-sm rounded-full hover:bg-primary-600"
                  >
                    View Party
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null;
      })}
    </MapContainer>
  );
};

export default MapView;