import { Archive, Clock, Edit2, Eye, EyeOff, MapPin, RotateCcw, Star, Tag } from "lucide-react";
import { getPrimaryCategoryConfig } from "@utils/turfCategories";

const statusBadgeClass = {
  published: "badge-success",
  unpublished: "badge-warning",
  archived: "badge-neutral",
};

const TurfCard = ({ turf, onEdit, onStatusChange }) => {
  const status = turf.status || "published";
  const category = getPrimaryCategoryConfig(turf.primaryCategory, turf.sportTypes);
  const CategoryIcon = category.icon;

  return (
    <div className="modern-panel h-full overflow-hidden p-0">
      <figure className="px-4 pt-4">
        <img
          src={turf.image}
          alt={turf.name}
          className="h-52 w-full rounded-[22px] object-cover"
        />
      </figure>
      <div className="card-body gap-3 p-5">
        <div className="flex items-center justify-between">
          <h2 className="card-title text-lg">{turf.name}</h2>
          <div className="flex items-center">
            <Star size={16} className="mr-1 text-yellow-400" />
            <span className="text-sm font-semibold">
              {turf.avgRating ? turf.avgRating.toFixed(1) : "N/A"}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className={`badge capitalize ${statusBadgeClass[status] || "badge-ghost"}`}>
            {status}
          </div>
          <div className={`badge gap-1.5 ${category.badgeClass}`}>
            <CategoryIcon size={12} />
            {category.label}
          </div>
        </div>

        <p className="text-sm leading-6 text-base-content/72">{turf.description}</p>

        <div className="mt-2 flex items-center text-sm">
          <MapPin size={14} className="mr-2" />
          <span>{turf.location}</span>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <Tag size={14} className="mr-2" />
          <span>INR {turf.pricePerHour}/hour</span>
        </div>
        <div className="mt-2 flex items-center text-sm">
          <Clock size={14} className="mr-2" />
          <span>
            {turf.openTime} - {turf.closeTime}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {(turf.sportTypes || []).map((sport) => (
            <div key={sport} className="badge badge-accent mt-2">
              {sport}
            </div>
          ))}
        </div>

        <div className="card-actions mt-4 flex-wrap justify-end">
          <button className="btn btn-primary btn-sm" onClick={() => onEdit(turf)}>
            <Edit2 size={14} className="mr-1" /> Edit
          </button>
          {status !== "published" ? (
            <button className="btn btn-outline btn-success btn-sm" onClick={() => onStatusChange(turf.id, "publish")}>
              <Eye size={14} className="mr-1" /> Publish
            </button>
          ) : (
            <button className="btn btn-outline btn-warning btn-sm" onClick={() => onStatusChange(turf.id, "unpublish")}>
              <EyeOff size={14} className="mr-1" /> Unpublish
            </button>
          )}
          {status !== "archived" ? (
            <button className="btn btn-outline btn-error btn-sm" onClick={() => onStatusChange(turf.id, "archive")}>
              <Archive size={14} className="mr-1" /> Archive
            </button>
          ) : (
            <button className="btn btn-outline btn-info btn-sm" onClick={() => onStatusChange(turf.id, "unarchive")}>
              <RotateCcw size={14} className="mr-1" /> Restore
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TurfCard;
