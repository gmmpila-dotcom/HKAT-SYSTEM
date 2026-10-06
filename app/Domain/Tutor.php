<?php

namespace App\Domain;

// INHERITANCE: Tutor extends (inherits from) Person.
class Tutor extends Person
{
    public function __construct(
        string $name,
        string $email,
        protected array $specializations = []
    ) {
        parent::__construct($name, $email);
    }

    // POLYMORPHISM: same method name as in Admin/Student, different result.
    public function getRole(): string
    {
        return 'tutor';
    }

    public function getDashboardRoute(): string
    {
        return '/tutor/dashboard';
    }

    public function getSpecializations(): array
    {
        return $this->specializations;
    }
}
