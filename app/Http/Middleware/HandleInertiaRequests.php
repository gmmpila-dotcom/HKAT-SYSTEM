<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'notifications' => $user ? [
                    'unreadCount' => $user->unreadNotifications()->count(),
                    'items' => $user->notifications()->latest()->limit(5)->get()->map(function ($notification) {
                        return [
                            'id' => $notification->id,
                            'title' => $notification->data['title'] ?? 'Notification',
                            'message' => $notification->data['message'] ?? '',
                            'url' => $notification->data['url'] ?? route('dashboard'),
                            'readAt' => $notification->read_at,
                            'createdAt' => $notification->created_at?->diffForHumans(),
                        ];
                    }),
                ] : [
                    'unreadCount' => 0,
                    'items' => [],
                ],
            ],
        ];
    }
}
