<?php

namespace App\Domain;

// ABSTRACTION: this abstract class defines a common blueprint
// for Tutor, Student, and Admin, without saying HOW each one works.
abstract class Person
{
    public function __construct(
        protected string $name,
        protected string $email
    ) {}

    public function getName(): string
    {
        return $this->name;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    // Every subclass MUST provide its own version of these two methods.
    abstract public function getRole(): string;

    abstract public function getDashboardRoute(): string;
}
