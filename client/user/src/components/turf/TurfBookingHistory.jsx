import { useState } from "react";
import { Clock, MapPin, IndianRupee, Calendar } from "lucide-react";
import useBookingHistory from "../../hooks/useBookingHistory";
import useWriteReview from "../../hooks/useWriteReview";
import TurfBookingHistorySkeleton from "../../components/ui/TurfBookingHistorySkeleton";
import WriteReview from "../../components/reviews/WriteReview";

const formatRefundText = (refund) => {
  if (!refund || refund.type === "none" || refund.status === "not_applicable") {
    return "No refund";
  }

  const amount = Number(refund.amount || 0).toFixed(2);
  const prefix =
    refund.type === "full" ? "Full refund" : `${refund.percent || 0}% refund`;

  if (refund.status === "processed") {
    return `${prefix} processed (${amount})`;
  }

  if (refund.status === "pending") {
    return `${prefix} initiated (${amount})`;
  }

  if (refund.status === "failed") {
    return `${prefix} failed (${amount})`;
  }

  return `${prefix} (${amount})`;
};

const formatRescheduleSettlementText = (reschedule) => {
  const settlement = reschedule?.settlement;

  if (!settlement || reschedule?.status === "none") {
    return null;
  }

  const amount = Number(settlement.amount || 0).toFixed(2);

  if (settlement.kind === "payment") {
    if (settlement.status === "payment_completed") {
      return `Additional payment completed (${amount})`;
    }

    if (settlement.status === "awaiting_payment") {
      return `Additional payment pending (${amount})`;
    }

    return `Additional payment if approved (${amount})`;
  }

  if (settlement.kind === "refund") {
    if (settlement.status === "refund_processed") {
      return `Refund processed (${amount})`;
    }

    if (settlement.status === "refund_pending") {
      return `Refund initiated (${amount})`;
    }

    if (settlement.status === "refund_failed") {
      return `Refund failed (${amount})`;
    }

    return `Refund due if approved (${amount})`;
  }

  return "No price difference";
};

const TurfBookingHistory = () => {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [selectedRescheduleBooking, setSelectedRescheduleBooking] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const {
    loading,
    bookings,
    cancelBookingWithReason,
    cancellingBookingId,
    summary,
    previewLoading,
    cancellationPreview,
    loadCancellationPreview,
    clearCancellationPreview,
    requestReschedule,
    reschedulingBookingId,
    payRescheduleDifference,
    payingRescheduleBookingId,
    fetchBookings,
  } = useBookingHistory();
  const {
    isReviewModalOpen,
    rating,
    review,
    reviewTarget,
    isSubmitting,
    openReviewModal,
    closeReviewModal,
    handleRatingChange,
    handleReviewChange,
    submitReview,
  } = useWriteReview({ onReviewSubmitted: fetchBookings });

  if (loading) {
    return <TurfBookingHistorySkeleton />;
  }

  const getStatusBadgeClass = (status) => {
    if (status === "cancelled") {
      return "badge badge-error badge-outline";
    }

    return "badge badge-success badge-outline";
  };

  const openCancelModal = async (booking) => {
    const preview = await loadCancellationPreview(booking._id);
    if (!preview) return;
    setSelectedBooking(booking);
    setCancellationReason("");
  };

  const closeCancelModal = () => {
    setSelectedBooking(null);
    setCancellationReason("");
    clearCancellationPreview();
  };

  const handleConfirmCancellation = async () => {
    if (!selectedBooking) return;
    await cancelBookingWithReason(selectedBooking._id, cancellationReason);
    closeCancelModal();
  };

  const openRescheduleModal = (booking) => {
    setSelectedRescheduleBooking(booking);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleReason("");
  };

  const closeRescheduleModal = () => {
    setSelectedRescheduleBooking(null);
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleReason("");
  };

  const handleSubmitReschedule = async () => {
    if (!selectedRescheduleBooking || !rescheduleDate || !rescheduleTime) return;

    const start = new Date(`${rescheduleDate}T${rescheduleTime}`);
    const originalStart = new Date(selectedRescheduleBooking.timeSlot.startTime);
    const originalEnd = new Date(selectedRescheduleBooking.timeSlot.endTime);
    const durationMs = originalEnd.getTime() - originalStart.getTime();
    const end = new Date(start.getTime() + durationMs);

    await requestReschedule(
      selectedRescheduleBooking._id,
      start.toISOString(),
      end.toISOString(),
      rescheduleReason
    );
    closeRescheduleModal();
  };

  const refundSummary = cancellationPreview?.preview?.refund;

  return (
    <div className="container mx-auto p-4 bg-base-200 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">
        Your Turf Booking History
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 max-w-3xl mx-auto">
        <div className="card bg-base-100 shadow-lg border">
          <div className="card-body">
            <p className="text-sm opacity-70">Points From All Bookings</p>
            <p className="text-3xl font-bold text-success">
              {summary.totalPointsEarned}
            </p>
          </div>
        </div>
        <div className="card bg-base-100 shadow-lg border">
          <div className="card-body">
            <p className="text-sm opacity-70">Active Loyalty Balance From Confirmed Bookings</p>
            <p className="text-3xl font-bold text-primary">
              {summary.activePoints}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-6 mx-auto lg:w-1/2">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="card bg-base-100 shadow-xl animate-bounce-fade-in"
          >
            <div className="card-body ">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="card-title text-2xl">{booking.turf.name}</h2>
                <span className={getStatusBadgeClass(booking.status)}>
                  {booking.status}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="flex items-center">
                    <MapPin className="mr-2" /> {booking.turf.location}
                  </p>
                  <p className="flex items-center">
                    <Calendar className="mr-2" /> {booking.timeSlot.date}
                  </p>
                  <p className="flex items-center">
                    <Clock className="mr-2" />{" "}
                    {booking.timeSlot.formattedStartTime} -{" "}
                    {booking.timeSlot.formattedEndTime}
                  </p>
                  <p className="flex items-center">
                    <IndianRupee className="mr-2" />
                    {booking.totalPrice}
                  </p>
                  <p className="font-semibold text-success">
                    Loyalty Points: +{booking.loyaltyPointsEarned || 0}
                  </p>
                  {booking.status === "cancelled" && booking.cancelledAt && (
                    <div className="space-y-1">
                      <p className="text-sm text-error">
                        Cancelled on {new Date(booking.cancelledAt).toLocaleString()}
                      </p>
                      {booking.cancellationReason ? (
                        <p className="text-sm text-base-content/70">
                          Reason: {booking.cancellationReason}
                        </p>
                      ) : null}
                      {booking.refund ? (
                        <p className="text-sm text-base-content/70">
                          Refund:{" "}
                          {formatRefundText(booking.refund)}
                        </p>
                      ) : null}
                    </div>
                  )}
                  {booking.reschedule && booking.reschedule.status !== "none" ? (
                    <div className="mt-2 rounded-2xl bg-base-200/70 px-3 py-2 text-sm">
                      <p className="font-medium">
                        Reschedule: {booking.reschedule.status}
                      </p>
                      {booking.reschedule.requestedStartTime ? (
                        <p className="text-base-content/70">
                          Requested slot:{" "}
                          {new Date(booking.reschedule.requestedStartTime).toLocaleString()}
                        </p>
                      ) : null}
                      {booking.reschedule.reason ? (
                        <p className="text-base-content/70">
                          Reason: {booking.reschedule.reason}
                        </p>
                      ) : null}
                      {booking.reschedule.ownerNotes ? (
                        <p className="text-base-content/70">
                          Owner note: {booking.reschedule.ownerNotes}
                        </p>
                      ) : null}
                      {formatRescheduleSettlementText(booking.reschedule) ? (
                        <p className="text-base-content/70">
                          Settlement: {formatRescheduleSettlementText(booking.reschedule)}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {booking.reviewEligibility?.hasReview ? (
                    <p className="text-sm font-medium text-success">
                      Review: submitted for this booking
                    </p>
                  ) : booking.status === "confirmed" &&
                    booking.reviewEligibility?.reason ? (
                    <p className="text-sm text-base-content/70">
                      Review: {booking.reviewEligibility.reason}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-col justify-center items-center">
                  <img
                    src={booking.qrCode}
                    alt="Booking QR Code"
                    className="w-32 h-32 mb-2"
                  />
                  <p className="text-sm text-base-content/60">Scan for details</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-4">
                {booking.reviewEligibility?.canReview ? (
                  <button
                    className="btn btn-primary"
                    onClick={() => openReviewModal(booking)}
                  >
                    Write a Review
                  </button>
                ) : null}
                {booking.status === "confirmed" && booking.isUpcoming && (
                  <button
                    className="btn btn-outline btn-error"
                    onClick={() => openCancelModal(booking)}
                    disabled={cancellingBookingId === booking._id}
                  >
                    Cancel Booking
                  </button>
                )}
                {booking.status === "confirmed" &&
                booking.isUpcoming &&
                !["requested", "approved"].includes(booking.reschedule?.status) ? (
                  <button
                    className="btn btn-outline"
                    onClick={() => openRescheduleModal(booking)}
                    disabled={reschedulingBookingId === booking._id}
                  >
                    Request Reschedule
                  </button>
                ) : null}
                {booking.reschedule?.status === "approved" &&
                booking.reschedule?.settlement?.kind === "payment" &&
                booking.reschedule?.settlement?.status === "awaiting_payment" ? (
                  <button
                    className="btn btn-secondary"
                    onClick={() => payRescheduleDifference(booking._id)}
                    disabled={payingRescheduleBookingId === booking._id}
                  >
                    {payingRescheduleBookingId === booking._id
                      ? "Opening Payment..."
                      : `Pay Rs ${Number(
                          booking.reschedule?.settlement?.amount || 0
                        ).toFixed(2)}`}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedBooking ? (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="text-2xl font-bold">Cancel Booking</h3>
            <p className="mt-2 text-base-content/70">
              Review the policy outcome before cancelling this slot.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-base-300 bg-base-200/70 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-base-content/50">
                  Booking
                </p>
                <p className="mt-3 text-lg font-bold">{selectedBooking.turf.name}</p>
                <p className="mt-2 text-sm text-base-content/70">
                  {selectedBooking.timeSlot.date}
                </p>
                <p className="text-sm text-base-content/70">
                  {selectedBooking.timeSlot.formattedStartTime} - {selectedBooking.timeSlot.formattedEndTime}
                </p>
              </div>

              <div className="rounded-2xl border border-base-300 bg-base-200/70 p-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-base-content/50">
                  Refund Preview
                </p>
                {previewLoading ? (
                  <p className="mt-3">Loading preview...</p>
                ) : (
                  <>
                    <p className="mt-3 text-lg font-bold text-primary">
                      {refundSummary?.type === "full"
                        ? "Full Refund"
                        : refundSummary?.type === "partial"
                          ? `${refundSummary?.percent || 0}% Refund`
                          : "No Refund"}
                    </p>
                    <p className="mt-2 text-sm text-base-content/70">
                      Amount: Rs {Number(refundSummary?.amount || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-base-content/70">
                      Hours before slot: {refundSummary?.hoursBeforeStart ?? "-"}
                    </p>
                    <p className="mt-2 text-sm text-base-content/70">
                      {cancellationPreview?.preview?.message}
                    </p>
                  </>
                )}
              </div>
            </div>

            <label className="form-control mt-5">
              <span className="label-text mb-2 font-medium">Cancellation reason</span>
              <textarea
                className="textarea textarea-bordered min-h-28"
                placeholder="Tell us why you are cancelling this booking"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            </label>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={closeCancelModal}>
                Keep Booking
              </button>
              <button
                className="btn btn-error"
                onClick={handleConfirmCancellation}
                disabled={cancellingBookingId === selectedBooking._id}
              >
                {cancellingBookingId === selectedBooking._id
                  ? "Cancelling..."
                  : "Confirm Cancellation"}
              </button>
            </div>
          </div>
          <button className="modal-backdrop" onClick={closeCancelModal}>
            close
          </button>
        </div>
      ) : null}
      {selectedRescheduleBooking ? (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="text-2xl font-bold">Request Reschedule</h3>
            <p className="mt-2 text-base-content/70">
              Choose a new start slot with the same booking duration. The owner will review this request.
            </p>
            <div className="mt-4 rounded-2xl border border-info/30 bg-info/10 px-4 py-3 text-sm text-base-content/80">
              Pricing rule: your current discount or coupon benefit stays applied. If the new slot costs more, you will pay only the net difference after approval. If it costs less, we will refund only the net difference.
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="form-control">
                <span className="label-text mb-2 font-medium">New date</span>
                <input
                  type="date"
                  className="input input-bordered"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </label>
              <label className="form-control">
                <span className="label-text mb-2 font-medium">New start time</span>
                <input
                  type="time"
                  className="input input-bordered"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </label>
            </div>

            <label className="form-control mt-5">
              <span className="label-text mb-2 font-medium">Reason</span>
              <textarea
                className="textarea textarea-bordered min-h-28"
                placeholder="Why do you need to move this booking?"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
              />
            </label>

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={closeRescheduleModal}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmitReschedule}
                disabled={reschedulingBookingId === selectedRescheduleBooking._id}
              >
                {reschedulingBookingId === selectedRescheduleBooking._id
                  ? "Submitting..."
                  : "Send Request"}
              </button>
            </div>
          </div>
          <button className="modal-backdrop" onClick={closeRescheduleModal}>
            close
          </button>
        </div>
      ) : null}
      {isReviewModalOpen && (
        <WriteReview
          bookingName={reviewTarget?.turfName}
          rating={rating}
          review={review}
          isSubmitting={isSubmitting}
          onClose={closeReviewModal}
          onRatingChange={handleRatingChange}
          onReviewChange={handleReviewChange}
          onSubmit={submitReview}
        />
      )}
    </div>
  );
};

export default TurfBookingHistory;
