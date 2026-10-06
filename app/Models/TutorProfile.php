<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TutorProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'photo_path',
        'bio',
        'credential',
        'specializations',
        'categories',
        'experience',
        'years_experience',
        'is_verified',
        'rating',
    ];

    protected $casts = [
        'specializations' => 'array',
        'categories' => 'array',
        'experience' => 'array',
        'is_verified' => 'boolean',
        'rating' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TutoringSession::class, 'tutor_id', 'user_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'tutor_id', 'user_id');
    }
}
