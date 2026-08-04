import React, { useState, useEffect } from "react";
import axios from "axios";
import { X, Calendar, Clock, MapPin, Users, Award, FileText } from "lucide-react";

const generateSlots = (openTime, closeTime) => {
  if (!openTime || !closeTime) return [];
  const slots = [];
  let startHour = parseInt(openTime.split(":")[0], 10);
  let endHour = parseInt(closeTime.split(":")[0], 10);

  if (endHour <= startHour) endHour += 24;

  for (let hour = startHour; hour < endHour; hour++) {
    const fromH = hour % 24;
    const toH = (hour + 1) % 24;

    const formatHour = (h) => {
      const period = h >= 12 ? "PM" : "AM";
      const formatted = h % 12 === 0 ? 12 : h % 12;
      return `${formatted.toString().padStart(2, "0")}:00 ${period}`;
    };

    slots.push(`${formatHour(fromH)} - ${formatHour(toH)}`);
  }
  return slots;
};

export default function CreateRequirementModal({ isOpen, onClose, onPostCreated }) {
  const [turfs, setTurfs] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    turf: "",
    sport: "Football",
    matchDate: "",
    timeSlot: "",
    currentMembersCount: 1,
    playersNeeded: 1,
    description: "",
  });

  // Fetch Turfs on Modal Open
  useEffect(() => {
    if (isOpen) {
      const fetchTurfs = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get("/api/user/turf/all", {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = res.data;
          const list = Array.isArray(data) ? data : data?.turfs || data?.data || [];
          setTurfs(list);
        } catch (err) {
          console.error("Error fetching turfs:", err);
        }
      };
      fetchTurfs();
    }
  }, [isOpen]);

  // Auto-Fetch Time Slots when Turf or Date changes
  useEffect(() => {
    if (formData.turf && formData.matchDate) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(
            `/api/user/turf/timeSlot?turfId=${formData.turf}&date=${formData.matchDate}`,
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          );

          if (res.data?.timeSlots) {
            const { openTime, closeTime } = res.data.timeSlots;
            const slots = generateSlots(openTime, closeTime);
            setAvailableSlots(slots);
          } else {
            setAvailableSlots([]);
          }
        } catch (err) {
          console.error("Error fetching time slots:", err);
          setAvailableSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      };

      fetchSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [formData.turf, formData.matchDate]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Try fetching token directly or parse from redux persist:user
    let token = localStorage.getItem("token");

    if (!token) {
      const persistedUser = localStorage.getItem("persist:user");
      if (persistedUser) {
        try {
          const parsedPersist = JSON.parse(persistedUser);
          // If user object is double-stringified by Redux Persist
          const userState = JSON.parse(parsedPersist.user || parsedPersist.auth || "{}");
          token = userState.token || parsedPersist.token;
        } catch (err) {
          console.error("Error parsing persist:user", err);
        }
      }
    }

    if (!token) {
      alert("Session expired or token missing. Please log in again.");
      return;
    }

    try {
      await axios.post("/api/user/matchmaking/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Requirement posted successfully!");
      onPostCreated();
      onClose();
    } catch (err) {
      console.error("Error creating post:", err);
      alert(err.response?.data?.message || "Failed to create post.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Need Players for Your Team
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Turf Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Select Turf
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                name="turf"
                value={formData.turf}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose a Turf --</option>
                {turfs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sport & Match Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Sport
              </label>
              <div className="relative">
                <Award className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500"
                >
                  <option value="Football">Football</option>
                  <option value="Cricket">Cricket</option>
                  <option value="Badminton">Badminton</option>
                  <option value="Basketball">Basketball</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Match Date
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  name="matchDate"
                  value={formData.matchDate}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Time Slot Dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Time Slot
            </label>
            <div className="relative">
              <Clock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                required
                disabled={!formData.turf || !formData.matchDate || loadingSlots}
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.turf || !formData.matchDate
                    ? "Select Turf & Date first"
                    : loadingSlots
                    ? "Loading available slots..."
                    : availableSlots.length === 0
                    ? "No slots available"
                    : "-- Choose a Time Slot --"}
                </option>
                {availableSlots.map((slot, index) => (
                  <option key={index} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Players Breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Current Members
              </label>
              <input
                type="number"
                name="currentMembersCount"
                min="1"
                value={formData.currentMembersCount}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
                Players Needed
              </label>
              <input
                type="number"
                name="playersNeeded"
                min="1"
                value={formData.playersNeeded}
                onChange={handleChange}
                required
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">
              Description / Requirements
            </label>
            <div className="relative">
              <FileText className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Need 2 defenders. Casual 7-a-side game. Split turf fee equally."
                className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-emerald-500"
              ></textarea>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition text-sm font-medium shadow-lg shadow-emerald-500/25"
            >
              Post Requirement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}