import React from "react";
import axios from "axios";

const ManageTeamModal = ({ isOpen, onClose, post, onUpdated, token }) => {
  if (!isOpen || !post) return null;

  const authToken = token || localStorage.getItem("token");

  const handleRemovePlayer = async (playerId) => {
    if (!window.confirm("Are you sure you want to remove this player?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/user/matchmaking/remove-player/${post._id}/${playerId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      alert("Player removed!");
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Remove player error:", err);
      alert(err.response?.data?.message || "Failed to remove player.");
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this match post?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/user/matchmaking/delete/${post._id}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      alert("Match post deleted!");
      onUpdated();
      onClose();
    } catch (err) {
      console.error("Delete post error:", err);
      alert(err.response?.data?.message || "Failed to delete post.");
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-xl mb-1">
          Manage Team: {typeof post.turf === "object" ? post.turf?.name : post.turf || "Match"}
        </h3>
        <p className="text-xs opacity-60 mb-4">
          Sport: <span className="uppercase font-semibold">{post.sport}</span> | Spots:{" "}
          {post.joinedPlayers?.length || 0} / {post.playersNeeded} Joined
        </p>

        <div className="divider my-1">Joined Players</div>

        {/* Joined Players List */}
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 my-4">
          {post.joinedPlayers && post.joinedPlayers.length > 0 ? (
            post.joinedPlayers.map((p, index) => {
              const playerObj = typeof p.user === "object" ? p.user : null;
              const playerId = playerObj?._id || p.user || p;
              const playerName = playerObj?.name || playerObj?.username || `Player ${index + 1}`;

              // Contact fallback chain
              const playerContact =
                playerObj?.phone ||
                playerObj?.mobile ||
                playerObj?.email ||
                "No Contact Shared";

              const isEmail = playerContact.includes("@");

              return (
                <div
                  key={playerId + index}
                  className="flex justify-between items-center bg-base-200 p-3 rounded-lg"
                >
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-sm">{playerName}</p>
                    
                    {/* Clickable Contact Link */}
                    {playerContact !== "No Contact Shared" ? (
                      <a
                        href={isEmail ? `mailto:${playerContact}` : `tel:${playerContact}`}
                        className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
                      >
                        {isEmail ? `📧 ${playerContact}` : `📞 ${playerContact}`}
                      </a>
                    ) : (
                      <span className="text-xs opacity-50">📵 No Contact Shared</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemovePlayer(playerId)}
                    className="btn btn-error btn-xs text-white"
                  >
                    Remove
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-sm opacity-60 text-center py-4">No players have joined yet.</p>
          )}
        </div>

        <div className="modal-action flex justify-between items-center pt-2 border-t">
          <button onClick={handleDeletePost} className="btn btn-outline btn-error btn-sm">
            🗑️ Delete Post
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageTeamModal;