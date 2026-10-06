<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'parent_id',
        'student_name',
        'grade_level',
        'birthdate',
        'notes',
    ];

    protected $casts = [
        'birthdate' => 'date',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(TutoringSession::class);
    }

    public function progressNotes(): HasMany
    {
        return $this->hasMany(ProgressNote::class);
    }
}
