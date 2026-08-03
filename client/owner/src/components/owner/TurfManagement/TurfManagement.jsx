import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import useTurfManagement from "@hooks/owner/useTurfManagement";
import EditTurfForm from "./EditTurfForm";
import TurfCardSkeleton from "./TurfCardSkeleton";
import TurfCard from "./TurfCard";
import { getPrimaryCategoryConfig, TURF_CATEGORY_OPTIONS } from "@utils/turfCategories";

const TurfManagement = () => {
  const { turfs, isLoading, error, fetchTurfs, editTurf, updateTurfStatus } =
    useTurfManagement();
  const [editingTurf, setEditingTurf] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCategoryFilters, setShowCategoryFilters] = useState(false);

  useEffect(() => {
    fetchTurfs();
  }, [fetchTurfs]);

  const handleEdit = (turf) => {
    setEditingTurf(turf);
  };

  const handleSaveEdit = (updatedTurf, turfId) => {
    editTurf(updatedTurf, turfId);
    setEditingTurf(null);
  };

  const handleCancelEdit = () => {
    setEditingTurf(null);
  };

  const categoryCounts = useMemo(() => {
    const counts = { all: turfs.length };
    TURF_CATEGORY_OPTIONS.forEach((category) => {
      counts[category.value] = 0;
    });

    turfs.forEach((turf) => {
      const categoryValue = getPrimaryCategoryConfig(turf.primaryCategory, turf.sportTypes).value;
      counts[categoryValue] = (counts[categoryValue] || 0) + 1;
    });

    return counts;
  }, [turfs]);

  const visibleTurfs = turfs.filter((turf) => {
      const matchesStatus = statusFilter === "all" || turf.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" ||
        getPrimaryCategoryConfig(turf.primaryCategory, turf.sportTypes).value === categoryFilter;
      return matchesStatus && matchesCategory;
    });

  const selectedCategoryLabel =
    categoryFilter === "all"
      ? "all categories"
      : (TURF_CATEGORY_OPTIONS.find((category) => category.value === categoryFilter)?.label || "selected category").toLowerCase();

  const selectedCategoryMeta =
    categoryFilter === "all"
      ? {
          label: "All Categories",
          count: categoryCounts.all,
        }
      : {
          label:
            TURF_CATEGORY_OPTIONS.find((category) => category.value === categoryFilter)?.label ||
            "Selected Category",
          count: categoryCounts[categoryFilter] || 0,
        };

  if (error) {
    return <div className="text-error text-center mt-8">{error}</div>;
  }

  return (
    <div className="modern-shell">
      <div className="modern-container">
      <div className="modern-hero">
      <div className="flex flex-col gap-5">
        <div>
          <h1 className="modern-hero-title">Turf Management</h1>
          <p className="modern-hero-copy">
            Manage venue visibility, refresh details, and keep listings clean across published, unpublished, and archived states.
          </p>
          <p className="mt-3 text-sm font-medium text-base-content/60">
            Showing {visibleTurfs.length} {statusFilter === "all" ? "" : `${statusFilter} `}{selectedCategoryLabel} turf{visibleTurfs.length === 1 ? "" : "s"}.
          </p>
        </div>
        <div className="space-y-4">
          <div className="modern-chip-group">
            {[
              { value: "all", label: "All" },
              { value: "published", label: "Published" },
              { value: "unpublished", label: "Unpublished" },
              { value: "archived", label: "Archived" },
            ].map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`modern-chip ${statusFilter === filter.value ? "modern-chip-active" : ""}`}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="rounded-[24px] border border-base-300 bg-base-100/65 p-4 shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 text-left"
              onClick={() => setShowCategoryFilters((prev) => !prev)}
            >
              <div>
                <p className="modern-stat-label">Category View</p>
                <p className="mt-1 text-sm text-base-content/65">
                  {selectedCategoryMeta.label} selected • {selectedCategoryMeta.count} turf{selectedCategoryMeta.count === 1 ? "" : "s"}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-base-300 bg-base-100 px-3 py-1.5 text-sm font-medium text-base-content/75">
                {showCategoryFilters ? "Hide" : "Change"}
                {showCategoryFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </span>
            </button>

            {showCategoryFilters ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              <button
                type="button"
                className={`rounded-[18px] border px-3 py-3 text-left transition ${
                  categoryFilter === "all"
                    ? "border-primary bg-primary text-primary-content shadow-sm"
                    : "border-base-300 bg-base-100 hover:bg-base-200/70"
                }`}
                onClick={() => {
                  setCategoryFilter("all");
                  setShowCategoryFilters(false);
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">All Categories</div>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${categoryFilter === "all" ? "bg-primary-content/15 text-primary-content" : "bg-base-200 text-base-content/70"}`}>
                    {categoryCounts.all}
                  </span>
                </div>
              </button>
              {TURF_CATEGORY_OPTIONS.map((category) => {
                const Icon = category.icon;
                const active = categoryFilter === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    className={`rounded-[18px] border px-3 py-3 text-left transition ${
                      active
                        ? "border-primary bg-primary text-primary-content shadow-sm"
                        : "border-base-300 bg-base-100 hover:bg-base-200/70"
                    }`}
                    onClick={() => {
                      setCategoryFilter(category.value);
                      setShowCategoryFilters(false);
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`rounded-2xl p-2 ${active ? "bg-primary-content/15 text-primary-content" : "bg-primary/10 text-primary"}`}>
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold">{category.label}</div>
                        </div>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${active ? "bg-primary-content/15 text-primary-content" : "bg-base-200 text-base-content/70"}`}>
                        {categoryCounts[category.value] || 0}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
            ) : null}
          </div>
        </div>
      </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="w-full">
              <TurfCardSkeleton />
            </div>
          ))}
        </div>
      ) : visibleTurfs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleTurfs.map((turf) => (
            <div key={turf.id} className="w-full">
              {editingTurf && editingTurf.id === turf.id ? (
                <EditTurfForm
                  turf={editingTurf}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  turfId={turf.id}
                />
              ) : (
                <TurfCard
                  turf={turf}
                  onEdit={() => handleEdit(turf)}
                  onStatusChange={updateTurfStatus}
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-base-content/60 mt-8">
          No turfs available for this filter.
        </div>
      )}
      </div>
    </div>
  );
};

export default TurfManagement;
