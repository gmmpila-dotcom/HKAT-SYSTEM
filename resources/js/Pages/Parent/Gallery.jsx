import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const FONT_HEAD = { fontFamily: "'Playfair Display', Georgia, serif" };

export default function Gallery({ items = [] }) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-3xl font-bold text-gray-900" style={FONT_HEAD}>Artwork gallery</h1>
                    <p className="text-lg text-gray-800">Photos uploaded by your child&rsquo;s tutors</p>
                </div>
            }
        >
            <Head title="Artwork gallery" />
            <div className="px-6 pb-12 pt-6 sm:px-8">
                <section className="overflow-hidden rounded-3xl border-[1.5px] border-black bg-[#B3DFDF] p-6">
                    {items.length === 0 ? (
                        <p className="text-lg">No artwork yet. It appears here when your child&rsquo;s tutors upload photos. <Link href={route('parent.dashboard')} className="underline">Back to dashboard</Link></p>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2">
                            {items.map((item, i) => (
                                <figure key={item.path + i} className="overflow-hidden rounded-2xl border border-black bg-[#EAF1D1]">
                                    <img src={item.path} alt={item.title || 'Artwork'} className="h-64 w-full object-cover" />
                                    <figcaption className="p-4">
                                        <div className="text-xl">{item.title || 'Untitled'}</div>
                                        <div className="text-gray-700">{item.tag ? item.tag + ' \u00B7 ' : ''}{item.tutor}</div>
                                    </figcaption>
                                </figure>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}