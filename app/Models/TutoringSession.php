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
    ];

    protected $casts = [
        'session_date' => 'date',
        'rate_applied' => 'decimal:2',
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
