import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { fetchDestinationReviews, timeAgo } from '../services/tourismService';
import type { PublicReview } from '../services/tourismService';

const Stars: React.FC<{ value: number }> = ({ value }) => (
  <span className="inline-flex">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} className={`w-3.5 h-3.5 ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
    ))}
  </span>
);

/** Ulasan wisatawan sungguhan untuk satu destinasi (hanya nama depan penulis yang tampil). */
export const DestinationReviews: React.FC<{ destinationDbId?: string; ratingAvg?: number; reviewsCount?: number }> = ({
  destinationDbId, ratingAvg = 0, reviewsCount = 0
}) => {
  const [reviews, setReviews] = useState<PublicReview[] | null>(null);

  useEffect(() => {
    if (!destinationDbId) { setReviews([]); return; }
    let cancelled = false;
    fetchDestinationReviews(destinationDbId, 5)
      .then((r) => { if (!cancelled) setReviews(r); })
      .catch(() => { if (!cancelled) setReviews([]); });
    return () => { cancelled = true; };
  }, [destinationDbId]);

  return (
    <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#19324d]">Ulasan Wisatawan</h3>
        {reviewsCount > 0 && (
          <span className="text-xs font-bold text-amber-600">⭐ {ratingAvg.toFixed(1)} · {reviewsCount} ulasan</span>
        )}
      </div>

      {reviews === null ? (
        <p className="text-xs text-slate-400">Memuat ulasan…</p>
      ) : reviews.length === 0 ? (
        <p className="text-xs text-slate-500">Belum ada ulasan. Jadilah yang pertama setelah menyelesaikan tur ini.</p>
      ) : (
        reviews.map((r) => (
          <div key={r.id} className="flex items-start gap-3 py-2 border-t border-slate-100 first:border-t-0">
            <div className="w-9 h-9 rounded-full bg-[#19324d] text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
              {r.reviewerAvatar ? <img src={r.reviewerAvatar} alt={r.reviewerName} className="w-full h-full object-cover" /> : r.reviewerName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-slate-800">{r.reviewerName}</span>
                <Stars value={r.rating} />
                <span className="text-[10px] text-slate-400">{timeAgo(r.createdAt)}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{r.comment}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
