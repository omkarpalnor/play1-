import { ChevronDown, ChevronUp, PackageOpen } from "lucide-react";
import useTurfData from "@hooks/admin/useTurf";
import Turf from "./Turf";
import TurfSkeleton from "./TurfSkeleton";
import { useMemo, useState } from "react";
import { getPrimaryCategoryConfig, TURF_CATEGORY_OPTIONS } from "@utils/turfCategories";

export const AllTurf = () => {
  const { turfData, loading, updateTurfStatus } = useTurfData();
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showCategoryFilters, setShowCategoryFilters] = useState(false);

  const categoryCounts = useMemo(() => {
    const counts = { all: Array.isArray(turfData) ? turfData.length : 0 };
    TURF_CATEGORY_OPTIONS.forEach((category) => {
      counts[category.value] = 0;
    });

    (turfData || []).forEach((turf) => {
      const categoryValue = getPrimaryCategoryConfig(turf.primaryCategory, turf.sportTypes).value;
      counts[categoryValue] = (counts[categoryValue] || 0) + 1;
    });

    return counts;
  }, [turfData]);

  const visibleTurfs = useMemo(() => {
    if (!Array.isArray(turfData)) {
      return [];
    }
    return turfData.filter((turf) => {
      const matchesStatus = statusFilter === "all" || turf.status === statusFilter;
      const matchesCategory =
        categoryFilter === "all" ||
        getPrimaryCategoryConfig(turf.primaryCategory, turf.sportTypes).value === categoryFilter;
      return matchesStatus && matchesCategory;
    });
  }, [categoryFilter, statusFilter, turfData]);

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

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {[...Array(6)].map((_, index) => (
          <TurfSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!visibleTurfs || visibleTurfs.length === 0) {
    return (
      <>
        <div className="mb-6 space-y-3">
          <div className="flex flex-wrap gap-2">
          {["all", "published", "unpublished", "archived"].map((filter) => (
            <button
              key={filter}
              type="button"
              className={`btn btn-sm capitalize ${statusFilter === filter ? "btn-primary" : "btn-outline"}`}
              onClick={() => setStatusFilter(filter)}
            >
              {filter}
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/48">
                  Category View
                </p>
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
                  className={`rounded-[18px] border px-3 py-3 text-left transition ${categoryFilter === "all" ? "border-primary bg-primary text-primary-content shadow-sm" : "border-base-300 bg-base-100 hover:bg-base-200/70"}`}
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
                      className={`rounded-[18px] border px-3 py-3 text-left transition ${active ? "border-primary bg-primary text-primary-content shadow-sm" : "border-base-300 bg-base-100 hover:bg-base-200/70"}`}
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
        <div className="flex flex-col items-center justify-center h-64 bg-base-200 rounded-lg">
          <PackageOpen size={64} className="text-base-content/40 mb-4" />
          <p className="text-xl font-semibold text-base-content/65">
            No turfs available
          </p>
          <p className="text-base-content/60 mt-2">Try a different lifecycle filter.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
        {["all", "published", "unpublished", "archived"].map((filter) => (
          <button
            key={filter}
            type="button"
            className={`btn btn-sm capitalize ${statusFilter === filter ? "btn-primary" : "btn-outline"}`}
            onClick={() => setStatusFilter(filter)}
          >
            {filter}
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-base-content/48">
                Category View
              </p>
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
                className={`rounded-[18px] border px-3 py-3 text-left transition ${categoryFilter === "all" ? "border-primary bg-primary text-primary-content shadow-sm" : "border-base-300 bg-base-100 hover:bg-base-200/70"}`}
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
                    className={`rounded-[18px] border px-3 py-3 text-left transition ${active ? "border-primary bg-primary text-primary-content shadow-sm" : "border-base-300 bg-base-100 hover:bg-base-200/70"}`}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {visibleTurfs.map((turf) => (
          <Turf key={turf.id} turf={turf} onStatusChange={updateTurfStatus} />
        ))}
      </div>
    </>
  );
};

export default AllTurf;
