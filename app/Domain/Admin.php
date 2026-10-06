<?php

namespace App\Domain;

class Admin extends Person
{
    public function getRole(): string
    {
        return 'admin';
    }

    public function getDashboardRoute(): string
    {
        return '/admin/dashboard';
    }
}
