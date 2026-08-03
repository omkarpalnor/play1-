import { useEffect, useMemo, useState } from "react";
import useTurfManagement from "@hooks/owner/useTurfManagement";
import useOwnerCoupons from "@hooks/owner/useOwnerCoupons";

const OwnerCoupons = () => {
  const { turfs, fetchTurfs } = useTurfManagement();
  const { coupons, fetchCoupons, createCoupon, toggleCoupon, deleteCoupon, loading } =
    useOwnerCoupons();

  const [form, setForm] = useState({
    turfId: "",
    code: "",
    discountType: "PERCENT",
    value: 10,
    maxDiscount: "",
    minOrderAmount: "",
    startAt: "",
    endAt: "",
    usageLimit: "",
    perUserLimit: 1,
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchTurfs();
    fetchCoupons();
  }, [fetchCoupons, fetchTurfs]);

  const turfOptions = useMemo(() => turfs || [], [turfs]);

  const onChange = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      turfId: form.turfId || undefined,
      code: form.code,
      discountType: form.discountType,
      value: Number(form.value),
      maxDiscount:
        form.discountType === "PERCENT" && form.maxDiscount !== ""
          ? Number(form.maxDiscount)
          : undefined,
      minOrderAmount: form.minOrderAmount !== "" ? Number(form.minOrderAmount) : undefined,
      startAt: form.startAt || undefined,
      endAt: form.endAt || undefined,
      usageLimit: form.usageLimit !== "" ? Number(form.usageLimit) : undefined,
      perUserLimit: form.perUserLimit !== "" ? Number(form.perUserLimit) : 1,
      title: form.title || undefined,
      description: form.description || undefined,
    };

    await createCoupon(payload);
    setForm((prev) => ({
      ...prev,
      code: "",
      title: "",
      description: "",
      usageLimit: "",
    }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Coupons / Offers</h1>

      <div className="card bg-base-100 shadow-xl border">
        <div className="card-body">
          <h2 className="card-title">Create Coupon</h2>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Turf (optional)</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={form.turfId}
                onChange={onChange("turfId")}
              >
                <option value="">All my turfs</option>
                {turfOptions.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Code</span>
              </label>
              <input
                className="input input-bordered w-full"
                value={form.code}
                onChange={onChange("code")}
                placeholder="e.g. TURF10"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Discount type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={form.discountType}
                onChange={onChange("discountType")}
              >
                <option value="PERCENT">Percent (%)</option>
                <option value="FIXED">Fixed (₹)</option>
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Value</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={form.value}
                onChange={onChange("value")}
                min={1}
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Max discount (for % only)</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={form.maxDiscount}
                onChange={onChange("maxDiscount")}
                min={0}
                disabled={form.discountType !== "PERCENT"}
                placeholder="e.g. 200"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Min order amount</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={form.minOrderAmount}
                onChange={onChange("minOrderAmount")}
                min={0}
                placeholder="e.g. 500"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Start at</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={form.startAt}
                onChange={onChange("startAt")}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">End at</span>
              </label>
              <input
                type="datetime-local"
                className="input input-bordered w-full"
                value={form.endAt}
                onChange={onChange("endAt")}
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Usage limit (total)</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={form.usageLimit}
                onChange={onChange("usageLimit")}
                min={0}
                placeholder="leave empty for unlimited"
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text">Per user limit</span>
              </label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={form.perUserLimit}
                onChange={onChange("perUserLimit")}
                min={1}
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">
                <span className="label-text">Title (optional)</span>
              </label>
              <input
                className="input input-bordered w-full"
                value={form.title}
                onChange={onChange("title")}
                placeholder="e.g. Weekend Offer"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">
                <span className="label-text">Description (optional)</span>
              </label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={form.description}
                onChange={onChange("description")}
                placeholder="Shown to users (if you use it later)"
              />
            </div>

            <div className="md:col-span-2">
              <button className={`btn btn-primary w-full ${loading ? "loading" : ""}`}>
                Create Coupon
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="mt-8 card bg-base-100 shadow-xl border">
        <div className="card-body">
          <h2 className="card-title">My Coupons</h2>

          {coupons.length === 0 ? (
            <p className="opacity-70">No coupons yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Min</th>
                    <th>Used</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c._id}>
                      <td className="font-semibold">{c.code}</td>
                      <td>{c.discountType}</td>
                      <td>
                        {c.discountType === "PERCENT" ? `${c.value}%` : `₹${c.value}`}
                      </td>
                      <td>₹{c.minOrderAmount || 0}</td>
                      <td>
                        {c.usageCount || 0}
                        {c.usageLimit != null ? ` / ${c.usageLimit}` : ""}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle toggle-success"
                          checked={!!c.isActive}
                          onChange={(e) => toggleCoupon(c._id, e.target.checked)}
                        />
                      </td>
                      <td className="text-right">
                        <button
                          className="btn btn-ghost btn-sm text-error"
                          onClick={() => deleteCoupon(c._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerCoupons;
