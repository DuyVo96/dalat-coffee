import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Link } from 'react-router-dom'
import L from 'leaflet'
import './Map.css'

// Fix default marker icon issue with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Da Lat center coordinates
const DALAT_CENTER = [11.9404, 108.4583]

function Map({ cafes, selectedCafe, onMarkerClick }) {
  return (
    <div className="map-container">
      <MapContainer
        center={DALAT_CENTER}
        zoom={14}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {cafes.map(cafe => (
          <Marker
            key={cafe._id}
            position={[cafe.location.coordinates[1], cafe.location.coordinates[0]]}
            eventHandlers={{
              click: () => onMarkerClick && onMarkerClick(cafe)
            }}
          >
            <Popup>
              <div className="map-popup">
                <h4>{cafe.name}</h4>
                <div className="popup-rating">
                  {'★'.repeat(Math.round(cafe.averageRating))}
                  {'☆'.repeat(5 - Math.round(cafe.averageRating))}
                  <span>{cafe.averageRating.toFixed(1)}</span>
                </div>
                <p>{cafe.priceRange}</p>
                <Link to={`/cafe/${cafe.slug}`}>View details</Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default Map
