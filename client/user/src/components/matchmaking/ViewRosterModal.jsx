import React from "react";
import axios from "axios";

const ViewRosterModal = ({ isOpen, onClose, post, currentUserId, onUpdated, token }) => {
  if (!isOpen || !post) return null;

  const authToken = token || localStorage.getItem("token");

  // Host contact fallback
  const hostObj = typeof post.hostUser === "object" ? post.hostUser : null;
  const hostName = hostObj?.name || "Host";
  const hostContact =
    hostObj?.phone ||
    hostObj?.mobile ||
    hostObj?.email ||
    "Contact not provided";

  const isHostEmail = hostContact.includes("@");

  // Filter teammates to exclude the current logged-in user
  const otherTeammates = (post.joinedPlayers || []).filter((p) => {
    const playerObj = typeof p.user === "object" ? p.user : null;
    const playerId = playerObj?.id || p.user || p;
    return String(playerId).trim() !== String(currentUserId).trim();
  });

  // Handle Leave Team action
  const handleLeaveTeam = async () => {
    if (!window.confirm("Are you sure you want to leave this team?")) return;

    try {
      await axios.post(
        `http://localhost:5000/api/user/matchmaking/leave/${post.id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      alert("You have left the team.");
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Error leaving team:", err);
      alert(err.response?.data?.message || "Failed to leave team.");
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-xl mb-1">
          Team Roster: {typeof post.turf === "object" ? post.turf?.name : post.turf || "Match"}
        </h3>
        <p className="text-xs opacity-60 mb-4">
          Sport: <span className="uppercase font-semibold">{post.sport}</span> | Date:{" "}
          {post.matchDate ? new Date(post.matchDate).toLocaleDateString() : "N/A"} ({post.timeSlot})
        </p>

        {/* Host Details */}
        <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg mb-4">
          <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
            👑 Match Host
          </p>
          <div className="flex justify-between items-center">
            <span className="font-bold text-base">{hostName}</span>
            {hostContact !== "Contact not provided" ? (
              <a
                href={isHostEmail ? `mailto:${hostContact}` : `tel:${hostContact}`}
                className="btn btn-xs btn-primary text-white"
              >
                {isHostEmail ? `📧 ${hostContact}` : `📞 ${hostContact}`}
              </a>
            ) : (
              <span className="text-xs opacity-50">No Contact</span>
            )}
          </div>
        </div>

        <div className="divider my-1">Your Teammates</div>

        {/* Teammates List (Excludes Logged-In User) */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 my-4">
          {otherTeammates.length > 0 ? (
            otherTeammates.map((p, index) => {
              const playerObj = typeof p.user === "object" ? p.user : null;
              const playerName = playerObj?.name || playerObj?.username || `Player ${index + 1}`;

              const playerContact =
                playerObj?.phone ||
                playerObj?.mobile ||
                playerObj?.email ||
                "No Contact Shared";

              const isPlayerEmail = playerContact.includes("@");

              return (
                <div
                  key={index}
                  className="flex justify-between items-center bg-base-200 p-3 rounded-lg"
                >
                  <div>
                    <p className="font-bold text-sm">{playerName}</p>
                    <p className="text-xs opacity-70">Teammate</p>
                  </div>
                  {playerContact !== "No Contact Shared" ? (
                    <a
                      href={isPlayerEmail ? `mailto:${playerContact}` : `tel:${playerContact}`}
                      className="btn btn-outline btn-xs btn-secondary"
                    >
                      {isPlayerEmail ? `📧 ${playerContact}` : `📞 ${playerContact}`}
                    </a>
                  ) : (
                    <span className="text-xs opacity-50">No Contact</span>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm opacity-60 text-center py-4">
              You are the first player to join! Other teammates will appear here when they join.
            </p>
          )}
        </div>

        <div className="modal-action flex justify-between items-center pt-2 border-t">
          <button onClick={handleLeaveTeam} className="btn btn-outline btn-warning btn-sm">
            🚪 Leave Team
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewRosterModal;