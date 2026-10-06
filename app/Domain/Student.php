<?php

namespace App\Domain;

class Student extends Person
{
    public function __construct(
        string $name,
        string $email,
        protected string $gradeLevel = ''
    ) {
        parent::__construct($name, $email);
    }

    public function getRole(): string
    {
        return 'parent';
    }

    public function getDashboardRoute(): string
    {
        return '/parent/dashboard';
    }

    public function getGradeLevel(): string
    {
        return $this->gradeLevel;
    }
}
