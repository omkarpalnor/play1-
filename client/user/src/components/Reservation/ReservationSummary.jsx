import { format } from "date-fns";
import { getEndTime } from "../../utils/dateUtils";

const ReservationSummary = ({
  selectedDate,
  selectedStartTime,
  duration,
  pricePerHour,
  couponCode,
  setCouponCode,
  couponBreakdown,
  applyCoupon,
  clearCoupon,
  availableCoupons,
  couponsLoading,
}) => {
  const baseAmount = pricePerHour * duration;

  return (
    <div className="mt-6 p-4 bg-base-200 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Your Reservation</h3>
      <p>Date: {format(selectedDate, "dd-MM-yyyy")}</p>
      <p>
        Time: {selectedStartTime} to {getEndTime(selectedStartTime, duration)}
      </p>
      <p>
        Duration: {duration} hour{duration > 1 ? "s" : ""}
      </p>
      <div className="mt-3">
        <div className="flex gap-2">
          <input
            className="input input-bordered w-full"
            placeholder="Coupon code (optional)"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
          />
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => applyCoupon()}
          >
            Apply
          </button>
          <button className="btn btn-ghost" type="button" onClick={clearCoupon}>
            Clear
          </button>
        </div>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Available Coupons</h4>
        {couponsLoading ? (
          <div className="flex items-center gap-2 text-sm opacity-70">
            <span className="loading loading-spinner loading-sm"></span>
            Loading coupons...
          </div>
        ) : availableCoupons?.length ? (
          <div className="space-y-3">
            {availableCoupons.map((coupon) => {
              const isApplied = couponBreakdown?.code === coupon.code;
              const canApply = coupon.isEligible;

              return (
                <div
                  key={coupon._id}
                  className="rounded-lg border border-base-300 bg-base-100 p-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="badge badge-primary badge-outline">
                          {coupon.code}
                        </span>
                        <span className="font-medium">
                          {coupon.title || "Special offer"}
                        </span>
                      </div>
                      {coupon.description ? (
                        <p className="mt-1 text-sm opacity-80">{coupon.description}</p>
                      ) : null}
                      <div className="mt-2 text-sm opacity-80 space-y-1">
                        <p>
                          Save {coupon.discountAmount} INR on this booking
                        </p>
                        <p>
                          Min order: {coupon.minOrderAmount || 0} INR
                        </p>
                        {coupon.reason ? (
                          <p className="text-warning">{coupon.reason}</p>
                        ) : null}
                      </div>
                    </div>
                    <button
                      className={`btn btn-sm ${isApplied ? "btn-success" : "btn-primary"}`}
                      type="button"
                      disabled={!canApply}
                      onClick={() => applyCoupon(coupon.code)}
                    >
                      {isApplied ? "Applied" : canApply ? "Apply" : "Unavailable"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm opacity-70">
            No coupons are available for this slot right now.
          </p>
        )}
      </div>

      <div className="mt-4 space-y-1">
        <p className="font-semibold">
          Base: {baseAmount} INR
        </p>
        {couponBreakdown?.discountAmount ? (
          <>
            <p className="text-success">
              Discount ({couponBreakdown.code}): -{couponBreakdown.discountAmount} INR
            </p>
            <p className="font-bold">
              Total: {couponBreakdown.finalAmount} INR
            </p>
          </>
        ) : (
          <p className="font-bold">Total: {baseAmount} INR</p>
        )}
      </div>
    </div>
  );
};

export default ReservationSummary;
