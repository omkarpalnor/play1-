import React, { useEffect, useMemo, useState } from "react";
import {
  GoogleMap,
  MarkerF,
  InfoWindow,
  useJsApiLoader,
} from "@react-google-maps/api";


import useTurfData from "../hooks/useTurfData";

const containerStyle = {
  width: "100%",
  height: "75vh",
};

const defaultCenter = {
  lat: 18.5204,
  lng: 73.8567,
};



export default function NearbyTurfs() {
    const { turfs, loading } = useTurfData();
    console.log("Turfs:", turfs);
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const [selectedTurf, setSelectedTurf] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");
  const [maxPrice, setMaxPrice] = useState(3000);
  const [maxDistance, setMaxDistance] = useState(20);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("nearest");

const { isLoaded } = useJsApiLoader({
  googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_KEY,
});
  useEffect(() => {
  if (!navigator.geolocation) return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
    },
    () => {}
  );
}, []);

const filteredTurfs = useMemo(() => {
  return turfs;
}, [turfs]);
console.log("Selected Turf:", selectedTurf);
//   const filteredTurfs = useMemo(() => {
//     let list = [...turfs];

//     if (search.trim() !== "") {
//       list = list.filter((turf) =>
//         turf.name.toLowerCase().includes(search.toLowerCase())
//       );
//     }

//     if (selectedSport !== "All") {
//      list = list.filter((turf) =>
//   turf.sportTypes.includes(selectedSport)
// );
// console.log("Filtered Turfs:", filteredTurfs);
//     }

//     //list = list.filter((turf) => turf.pricePerHour <= maxPrice);

//     //list = list.filter((turf) => turf.rating >= minRating);

//    // list = list.filter((turf) => turf.distance <= maxDistance);

//     switch (sortBy) {
//       case "rating":
//         list.sort((a, b) => b.rating - a.rating);
//         break;

//       case "lowprice":
//         list.sort((a, b) => a.pricePerHour - b.pricePerHour);
//         break;

//       case "highprice":
//         list.sort((a, b) => b.pricePerHour - a.pricePerHour);
//         break;

//       default:
//         list.sort((a, b) => a.name.localeCompare(b.name));
//     }

//     return list;
//   }, [
//     search,
//     selectedSport,
//     maxPrice,
//     maxDistance,
//     minRating,
//     sortBy,
//   ]);

  
  if (loading) {
  return <div>Loading turfs...</div>;
}
  if (!isLoaded) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: 24,
          fontWeight: "bold",
        }}
      >
        Loading Google Maps...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        background: "#f4f6f9",
        minHeight: "100vh",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Nearby Turfs
      </h1>
            {/* ================= SEARCH & FILTERS ================= */}

      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "12px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
            gap: "15px",
          }}
        >
          {/* Search */}

          <div>
            <label
              style={{
                fontWeight: "bold",
              }}
            >
              Search Turf
            </label>

            <input
              type="text"
              placeholder="Search by turf name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          {/* Sport */}

          <div>
            <label
              style={{
                fontWeight: "bold",
              }}
            >
              Sport
            </label>

            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "8px",
              }}
            >
              <option value="All">All Sports</option>
              <option value="Football">Football</option>
              <option value="Cricket">Cricket</option>
              <option value="Badminton">Badminton</option>
            </select>
          </div>

          {/* Price */}

          <div>
            <label
              style={{
                fontWeight: "bold",
              }}
            >
              Maximum Price

              <br />

              ₹ {maxPrice}
            </label>

            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              style={{
                width: "100%",
              }}
            />
          </div>

          {/* Distance */}

          <div>
            <label
              style={{
                fontWeight: "bold",
              }}
            >
              Distance
            </label>

            <select
              value={maxDistance}
              onChange={(e) =>
                setMaxDistance(Number(e.target.value))
              }
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "8px",
              }}
            >
              <option value={5}>Within 5 KM</option>
              <option value={10}>Within 10 KM</option>
              <option value={20}>Within 20 KM</option>
            </select>
          </div>

          {/* Rating */}

          <div>
            <label
              style={{
                fontWeight: "bold",
              }}
            >
              Rating
            </label>

            <select
              value={minRating}
              onChange={(e) =>
                setMinRating(Number(e.target.value))
              }
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "8px",
              }}
            >
              <option value={0}>All Ratings</option>
              <option value={4}>4★ & Above</option>
              <option value={4.5}>4.5★ & Above</option>
            </select>
          </div>

          {/* Sort */}

          <div>
            <label
              style={{
                fontWeight: "bold",
              }}
            >
              Sort By
            </label>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "5px",
                borderRadius: "8px",
              }}
            >
              <option value="nearest">Nearest</option>
              <option value="rating">Highest Rating</option>
              <option value="lowprice">Lowest Price</option>
              <option value="highprice">Highest Price</option>
            </select>
          </div>
        </div>

        <div
          style={{
            marginTop: "20px",
          }}
        >
          <button
            onClick={() => {
              setSearch("");
              setSelectedSport("All");
              setMaxPrice(3000);
              setMaxDistance(20);
              setMinRating(0);
              setSortBy("nearest");
            }}
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* ================= GOOGLE MAP ================= */}

     <GoogleMap
  mapContainerStyle={containerStyle}
  center={currentLocation}
  zoom={16}
>
  {/* Your Current Location */}
  <MarkerF
    position={currentLocation}
    label="You"
  />

  {/* Turf Markers */}
  {filteredTurfs
  .filter(
      (turf) =>
        turf.latitude &&
        turf.longitude &&
        turf.latitude !== 0 &&
        turf.longitude !== 0
    )
  .map((turf) => {

    console.log("Rendering Marker:", turf.name);

    return (
      <MarkerF
        key={turf.id}
        position={{
          lat: Number(turf.latitude),
          lng: Number(turf.longitude),
        }}
        title={turf.name}
        onClick={() => setSelectedTurf(turf)}
      />
    );
  })}
  {/* {filteredTurfs
    .filter(
      (turf) =>
        turf.latitude &&
        turf.longitude &&
        turf.latitude !== 0 &&
        turf.longitude !== 0
    )
    .map((turf) => (
      console.log("Rendering Marker:", turf.name);
      <MarkerF
        key={turf.id}
       position={{
  lat: Number(turf.latitude),
  lng: Number(turf.longitude),
}}
        title={turf.name}
        onClick={() => setSelectedTurf(turf)}
      />
    ))} */}

  {/* Selected Turf Info */}
  {selectedTurf && (
    <InfoWindow
      position={{
        lat: Number(selectedTurf.latitude),
        lng: Number(selectedTurf.longitude),
      }}
      onCloseClick={() => setSelectedTurf(null)}
    >
      <div style={{ width: 220 }}>
        <h3>{selectedTurf.name}</h3>

        <p>
          <b>📍 Address:</b> {selectedTurf.location}
        </p>

        <p>
          <b>⚽ Sport:</b> {selectedTurf.sport}
        </p>

        <p>
          <b>💰 Price:</b> ₹{selectedTurf.pricePerHour}/hr
        </p>

        <button
          style={{
            width: "100%",
            padding: "10px",
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() =>
            window.open(
              `https://www.google.com/maps/dir/?api=1&destination=${selectedTurf.latitude},${selectedTurf.longitude}`,
              "_blank"
            )
          }
        >
          Directions
        </button>
      </div>
    </InfoWindow>
  )}
</GoogleMap>

      {/* ================= TURF LIST ================= */}

      <div
        style={{
          marginTop: "30px",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            color: "#333",
          }}
        >
          Available Turfs ({filteredTurfs.length})
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(320px,1fr))",
            gap: "20px",
          }}
        >
          {console.log(filteredTurfs)}
          {filteredTurfs
  .filter(
    (turf) =>
      turf.latitude &&
      turf.longitude
  )
  .map((turf) => (
            <div
              key={turf.id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                boxShadow:
                  "0 2px 10px rgba(0,0,0,0.1)",
                overflow: "hidden",
              }}
            >
              <img
                src={`https://picsum.photos/600/300?random=${turf.id}`}
                alt={turf.name}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                }}
              />

              <div
                style={{
                  padding: "15px",
                }}
              >
                <h3
                  style={{
                    marginBottom: "10px",
                  }}
                >
                  {turf.name}
                </h3>

                <p>
                  📍 {turf.location}
                </p>

                <p>
                 ⚽ {turf.sportTypes.join(", ")}
                </p>

                <p>
                  ⭐ {turf.rating}
                </p>

                <p>
                  📏 {turf.distance} KM Away
                </p>

                <p
                  style={{
                    fontSize: "20px",
                    color: "#1976d2",
                    fontWeight: "bold",
                  }}
                >
                  ₹{turf.pricePerHour}/hr
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "15px",
                  }}
                >
                  <button
                    style={{
                      flex: 1,
                      background: "#1976d2",
                      color: "#fff",
                      border: "none",
                      padding: "12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Book Now
                  </button>

                  <button
                    style={{
                      flex: 1,
                      background: "#4CAF50",
                      color: "#fff",
                      border: "none",
                      padding: "12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&destination=${turf.latitude},${turf.longitude}`,
                        "_blank"
                      )
                    }
                  >
                    Directions
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}