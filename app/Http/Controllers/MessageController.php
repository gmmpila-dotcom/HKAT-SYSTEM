<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\TutoringSession;
use App\Notifications\SessionStatusNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MessageController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $conversations = Conversation::where(function ($query) use ($user) {
            $query->where('parent_id', $user->id)->orWhere('tutor_id', $user->id);
        })
            ->with(['parent:id,name', 'tutor:id,name', 'session:id,subject', 'latestMessage.sender:id,name'])
            ->latest()
            ->get();

        return Inertia::render('Messages/Index', [
            'conversations' => $conversations,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->role !== 'parent') {
            abort(403);
        }

        $validated = $request->validate([
            'session_id' => ['required', 'exists:tutoring_sessions,id'],
        ]);

        $session = TutoringSession::whereKey($validated['session_id'])
            ->whereHas('studentProfile', function ($query) use ($user) {
                $query->where('parent_id', $user->id);
            })
            ->firstOrFail();

        $conversation = Conversation::firstOrCreate([
            'session_id' => $session->id,
        ], [
            'parent_id' => $user->id,
            'tutor_id' => $session->tutor_id,
        ]);

        return redirect()->route('messages.show', $conversation);
    }

    public function show(Request $request, Conversation $conversation): Response
    {
        $this->authorizeParticipant($request, $conversation);

        $conversation->load(['parent:id,name', 'tutor:id,name', 'session:id,subject,session_date', 'messages.sender:id,name']);
        $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return Inertia::render('Messages/Show', [
            'conversation' => $conversation,
        ]);
    }

    public function send(Request $request, Conversation $conversation): RedirectResponse
    {
        $this->authorizeParticipant($request, $conversation);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $message = $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $validated['body'],
        ]);

        $recipient = $request->user()->id === $conversation->parent_id
            ? $conversation->tutor
            : $conversation->parent;

        $recipient?->notify(new SessionStatusNotification(
            'New message',
            'You have a new message about a tutoring session.',
            route('messages.show', $conversation),
        ));

        return redirect()->back();
    }

    private function authorizeParticipant(Request $request, Conversation $conversation): void
    {
        if (! in_array($request->user()->id, [$conversation->parent_id, $conversation->tutor_id], true)) {
            abort(403);
        }
    }
}
