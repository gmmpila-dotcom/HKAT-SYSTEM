import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };

function fmtTime(value) {
    const [h, m] = String(value).split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 === 0 ? 12 : h % 12;
    return hour + ':' + String(m).padStart(2, '0') + ' ' + suffix;
}

export default function Room({ room }) {
    const url = 'https://meet.jit.si/' + room.code;
    const name = encodeURIComponent(JSON.stringify(room.me));
    const embed = url + '#userInfo.displayName=' + name + '&config.prejoinPageEnabled=false';
    const started = room.started_at ? new Date(room.started_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '-';

    const end = () => {
        if (!window.confirm('End this online class for everyone?')) return;
        router.post(route('online.end', room.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold text-gray-900" style={FONT_HEAD}>Online class</h1>
                    <p className="text-lg text-gray-800">{room.subject} &middot; {room.student} with {room.tutor}</p>
                </div>
            }
        >
            <Head title="Online class" />
            <div className="space-y-4 px-6 pb-12 pt-6 sm:px-8">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-[1.5px] border-black bg-[#EAF1D1] px-6 py-4">
                    <div className="text-lg">
                        Scheduled {fmtTime(room.start)} to {fmtTime(room.end)} &middot; Started at {started}
                    </div>
                    <div className="flex gap-3">
                        <a href={url} target="_blank" rel="noreferrer" className="rounded-xl border-[1.5px] border-black bg-white px-4 py-2 hover:opacity-80">Open in new window</a>
                        {room.can_end && (
                            <button type="button" onClick={end} className="rounded-xl border-[1.5px] border-red-700 bg-white px-4 py-2 text-red-700 hover:opacity-80">End session</button>
                        )}
                    </div>
                </div>
                <div className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-black">
                    <iframe title="Online class" src={embed} allow="camera; microphone; fullscreen; display-capture; autoplay" className="h-[70vh] w-full" />
                </div>
                <p className="text-sm text-gray-700">If the video stops or does not load, press Open in new window. Allow the camera and microphone when your browser asks.</p>
            </div>
        </AuthenticatedLayout>
    );
}