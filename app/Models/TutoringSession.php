<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use LogicException;

class TutoringSession extends Model
{
    use HasFactory;

    protected static function booted(): void
    {
        static::creating(function (TutoringSession $session): void {
            if ($session->location_type === 'online' && empty($session->room_code)) {
                $session->room_code = 'hkat-'.strtolower(\Illuminate\Support\Str::random(14));
            }
        });

        static::saving(function (TutoringSession $session): void {
            if ($session->status === 'confirmed' && ! $session->payment()->where('status', 'paid')->exists()) {
                throw new LogicException('A tutoring session cannot be confirmed until its payment is paid.');
            }
        });
    }

    protected $table = 'tutoring_sessions';

    protected $fillable = [
        'student_profile_id',
        'tutor_id',
        'subject',
        'session_type',
        'location_type',
        'session_date',
        'start_time',
        'end_time',
        'rate_applied',
        'status',
        'room_code',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'session_date' => 'date',
        'rate_applied' => 'decimal:2',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    public function studentProfile(): BelongsTo
    {
        return $this->belongsTo(StudentProfile::class);
    }

    public function tutor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class, 'session_id');
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class, 'session_id');
    }
}
