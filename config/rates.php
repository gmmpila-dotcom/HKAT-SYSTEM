<?php

/*
 * Happy Kid Arts and Tutorials rate card (Philippine peso).
 * Single source of truth for the booking rate calculator.
 */
return [
    // Tutorial rate per hour by grade band.
    // regular = most subjects, core = Math / Science / English.
    'bands' => [
        ['min' => 1, 'max' => 3, 'regular' => 200, 'core' => 250],
        ['min' => 4, 'max' => 6, 'regular' => 250, 'core' => 300],
        ['min' => 7, 'max' => 10, 'regular' => 350, 'core' => 400],
    ],

    'core_subjects' => ['math', 'science', 'english'],

    // Special Teaching (children with special needs): flat price per session.
    'special_teaching_per_session' => 500,

    // Private / home-based teaching: minimum per hour. The transportation fare is
    // confirmed with the parent and is NOT charged by the system.
    'home_minimum_per_hour' => 350,

    // Arts: flat price per session (about 2 hours) and per head.
    // The same price applies to 1-on-1 and class.
    'arts' => [
        'drawing' => 1200,
        'painting' => 1500,
    ],
];