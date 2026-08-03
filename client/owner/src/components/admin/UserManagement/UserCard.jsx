import { Mail, Phone, Shield, Calendar, CheckCircle, XCircle } from "lucide-react";
import Avatar from "react-avatar";
import { format } from "date-fns";

const UserCard = ({ user }) => {
  return (
    <div className="card bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">

        <div className="flex items-center gap-4">
          <Avatar
            name={user.name}
            size="55"
            round={true}
          />

          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-gray-500">{user.role}</p>
          </div>
        </div>

        <div className="divider"></div>

        <div className="space-y-3">

          <div className="flex items-center gap-2">
            <Mail size={18} className="text-primary" />
            <span>{user.email}</span>
          </div>

          <div className="flex items-center gap-2">
            <Phone size={18} className="text-primary" />
            <span>{user.phone || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            <span>{user.role}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-primary" />
            <span>
              {user.createdAt
                ? format(new Date(user.createdAt), "dd MMM yyyy")
                : "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {user.emailVerified ? (
              <>
                <CheckCircle size={18} className="text-success" />
                <span className="text-success">Verified</span>
              </>
            ) : (
              <>
                <XCircle size={18} className="text-error" />
                <span className="text-error">Not Verified</span>
              </>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default UserCard;