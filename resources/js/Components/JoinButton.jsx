import { Link } from '@inertiajs/react';

function clock(value) {
    return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export default function JoinButton({ session }) {
    if (!session || session.location_type !== 'online' || !session.room_code) return null;

    if (session.ended_at) {
        return <span className="text-xs text-gray-700">Ended {clock(session.ended_at)}</span>;
    }

    if (session.status !== 'confirmed') return null;

    const date = String(session.session_date).slice(0, 10);
    const start = new Date(date + 'T' + String(session.start_time).slice(0, 5) + ':00+08:00').getTime();
    const end = new Date(date + 'T' + String(session.end_time).slice(0, 5) + ':00+08:00').getTime();
    const now = Date.now();
    const open = now >= start - 15 * 60000 && now <= end + 30 * 60000;

    return (
        <span className="inline-flex items-center gap-2">
            {session.started_at && <span className="text-xs text-gray-700">Started {clock(session.started_at)}</span>}
            {open ? (
                <Link href={route('online.show', session.id)} className="rounded-full border-[1.5px] border-black bg-[#EAF1D1] px-4 py-1 text-sm hover:opacity-80">Join</Link>
            ) : (
                <span title="Opens 15 minutes before the class" className="cursor-not-allowed rounded-full border-[1.5px] border-black bg-gray-300 px-4 py-1 text-sm text-gray-600">Join</span>
            )}
        </span>
    );
}