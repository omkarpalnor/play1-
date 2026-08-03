import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import CreateRequirementModal from "../components/matchmaking/CreateRequirementModal";
import ManageTeamModal from "../components/matchmaking/ManageTeamModal";
import ViewRosterModal from "../components/matchmaking/ViewRosterModal";

const MatchmakingFeed = () => {
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Extract auth state from Redux
  const authState = useSelector((state) => state.auth || {});

  // Helper function to extract token from Redux OR persist:user OR localStorage
  const getAuthToken = () => {
    if (authState.token) return authState.token;

    try {
      const persistUser = localStorage.getItem("persist:user");
      if (persistUser) {
        const parsedPersist = JSON.parse(persistUser);
        if (parsedPersist.auth) {
          const parsedAuth = JSON.parse(parsedPersist.auth);
          if (parsedAuth.token) return parsedAuth.token;
        }
      }
    } catch (e) {
      console.error("Failed to parse token from persist:user", e);
    }

    return localStorage.getItem("token") || "";
  };

  const token = getAuthToken();

  const [selectedPostForManage, setSelectedPostForManage] = useState(null);
  const [selectedPostForRoster, setSelectedPostForRoster] = useState(null);

  // Helper function to decode user ID directly from JWT Token payload
  const getUserIdFromToken = (jwtToken) => {
    if (!jwtToken) return "";
    try {
      const payloadBase64 = jwtToken.split(".")[1];
      if (!payloadBase64) return "";
      const decodedPayload = JSON.parse(atob(payloadBase64));
      return (
        decodedPayload?.user?._id ||
        decodedPayload?.user?.id ||
        decodedPayload?.user ||
        decodedPayload?.id ||
        ""
      );
    } catch (e) {
      console.error("❌ Failed to decode JWT token:", e);
      return "";
    }
  };

  // Fallback chain: JWT token payload -> Redux state user object -> localStorage
  const currentUserId =
    getUserIdFromToken(token) ||
    authState.user?._id ||
    authState.user?.id ||
    localStorage.getItem("userId") ||
    "";

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/api/user/matchmaking/feed", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const postsData = res.data?.posts || (Array.isArray(res.data) ? res.data : []);
      setPosts(postsData);
    } catch (err) {
      console.error("❌ Error fetching feed:", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleJoin = async (postId) => {
    try {
      if (!token) {
        alert("Please log in to join a team!");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/user/matchmaking/join/${postId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Clear local notification cache so updated notifications generate freshly
      localStorage.removeItem("PlayRizon-user-notifications-v1");

      alert("Successfully joined the team!");
      fetchPosts();
    } catch (err) {
      alert(err.response?.data?.message || "Could not join team.");
    }
  };

  return (
    <div className="min-h-screen bg-base-100 text-base-content pt-20 px-4 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b pb-4 border-base-300">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Find Teams & Players</h1>
          <p className="text-sm opacity-70 mt-1">
            Join an existing team looking for players or post a requirement for your own match!
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary font-semibold shadow-md"
        >
          + Need Players for My Team
        </button>
      </div>

      {/* Feed List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 bg-base-200 rounded-xl shadow-inner">
          <p className="text-lg font-medium opacity-70">No open team requirements right now.</p>
          <p className="text-sm opacity-50 mt-1">Be the first to post a request for your match!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => {
            const spotsRemaining = (post.playersNeeded || 0) - (post.joinedPlayers?.length || 0);

            // 1. Safely extract Host ID and Host Name
            const hostId = typeof post.hostUser === "object" ? post.hostUser?._id : post.hostUser;
            const hostName = typeof post.hostUser === "object" ? post.hostUser?.name : "";

            // 2. Extract logged-in user details
            const loggedInId = String(currentUserId || "").trim();
            const loggedInUserObj = authState.user || {};
            const loggedInName = loggedInUserObj.name || "";

            // 3. Robust Host Check (checks ID match OR name match)
            const isHost = Boolean(
              (hostId && loggedInId && String(hostId).trim() === loggedInId) ||
              (hostName && loggedInName && hostName.toLowerCase() === loggedInName.toLowerCase())
            );

            // 4. Joined Check (Strictly MUST NOT be the host)
            const hasJoined = Boolean(
              !isHost &&
              loggedInId &&
              post.joinedPlayers?.some((p) => {
                const playerUserId = typeof p.user === "object" ? p.user?._id : (p.user || p);
                return String(playerUserId).trim() === loggedInId;
              })
            );

            return (
              <div
                key={post._id}
                className="card bg-base-100 border border-base-300 shadow-sm hover:shadow-md transition p-5"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="badge badge-secondary badge-sm font-bold uppercase mb-1">
                      {post.sport || "Sport"}
                    </span>
                    <h3 className="font-bold text-xl">
                      {typeof post.turf === "object" ? post.turf?.name : post.turf || "Turf Match"}
                    </h3>
                  </div>
                  <span className="badge badge-outline badge-primary font-semibold">
                    Need: {spotsRemaining} Spot(s)
                  </span>
                </div>

                <div className="text-sm space-y-1.5 mb-4 opacity-80">
                  <p>📅 <strong>Date:</strong> {post.matchDate ? new Date(post.matchDate).toLocaleDateString() : "N/A"}</p>
                  <p>⏰ <strong>Time:</strong> {post.timeSlot || "N/A"}</p>
                  <p>👤 <strong>Host:</strong> {post.hostUser?.name || "Anonymous User"}</p>
                  <p>👥 <strong>Squad Size:</strong> {post.currentMembersCount || 1} initial + {post.joinedPlayers?.length || 0} joined</p>
                  {post.description && (
                    <p className="italic text-xs opacity-75 mt-2 bg-base-200 p-2 rounded">
                      "{post.description}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-base-300 flex justify-between items-center">
                  <span className="text-xs opacity-60">
                    {post.joinedPlayers?.length || 0} / {post.playersNeeded || 0} Joined
                  </span>

                  {isHost ? (
                    <button
                      onClick={() => setSelectedPostForManage(post)}
                      className="btn btn-accent btn-sm font-semibold shadow-sm hover:opacity-90"
                    >
                      ⚙️ Manage Team
                    </button>
                  ) : hasJoined ? (
                    <div className="flex gap-2 items-center">
                      <span className="badge badge-success text-white font-semibold px-2.5 py-2">
                        ✓ Joined
                      </span>
                      <button
                        onClick={() => setSelectedPostForRoster(post)}
                        className="btn btn-outline btn-sm btn-accent"
                      >
                        👥 View Roster
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleJoin(post._id)}
                      disabled={spotsRemaining <= 0}
                      className="btn btn-primary btn-sm"
                    >
                      {spotsRemaining <= 0 ? "Match Full" : "Join Team"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Creation Modal */}
      {isModalOpen && (
        <CreateRequirementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onPostCreated={fetchPosts}
        />
      )}

      {/* Host Manage Team Modal */}
      {selectedPostForManage && (
        <ManageTeamModal
          isOpen={Boolean(selectedPostForManage)}
          onClose={() => setSelectedPostForManage(null)}
          post={selectedPostForManage}
          onUpdated={fetchPosts}
          token={token}
        />
      )}

      {/* View Teammates Roster Modal */}
      {selectedPostForRoster && (
        <ViewRosterModal
          isOpen={Boolean(selectedPostForRoster)}
          onClose={() => setSelectedPostForRoster(null)}
          post={selectedPostForRoster}
          currentUserId={currentUserId}
          onUpdated={fetchPosts}
          token={token}
        />
      )}
    </div>
  );
};

export default MatchmakingFeed;