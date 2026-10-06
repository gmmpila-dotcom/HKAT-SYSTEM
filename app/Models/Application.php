<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'full_name',
        'email',
        'phone',
        'specializations',
        'years_experience',
        'cover_letter',
        'resume_path',
        'portfolio_paths',
        'status',
    ];

    protected $casts = [
        'specializations' => 'array',
        'portfolio_paths' => 'array',
    ];
}
