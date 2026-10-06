<?php

namespace Database\Seeders;

use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds the 7 real Happy Kid Arts tutors as actual User + TutorProfile
 * records, so they show up on /tutors through the database instead of
 * the old static tutorsData.js file.
 *
 * Run with: php artisan db:seed --class=RealTutorsSeeder
 *
 * Login password for all seeded tutor accounts: testpass123
 * (same convention as your other test accounts — change before real launch)
 *
 * Lily Roma's email should be verified with her before production launch.
 */
class RealTutorsSeeder extends Seeder
{
    public function run(): void
    {
        $tutors = [
            [
                'name' => 'Michelle Pila',
                'email' => 'michellemendenillapila05@yahoo.com',
                'credential' => 'Freelance art & academic tutor since 2018',
                'bio' => "Michelle has been Happy Kid Arts and Tutorials' main freelance tutor and art teacher since 2018, teaching Pre-Kindergarten through High School students across all academic subjects as well as drawing and painting — including lessons adapted for children with mental challenges.",
                'photo_path' => '/images/tutors/michelle-pila.jpg',
                'specializations' => ['Reading', 'Writing', 'Math', 'English', 'Science', 'Filipino', 'Mapeh', 'AP', 'Drawing & Painting'],
                'categories' => ['academic', 'arts'],
                'experience' => [
                    [
                        'type' => 'work',
                        'title' => 'Freelance Art Teacher & Tutor',
                        'subtitle' => 'Happy Kid Arts (Main Account) · 2018 – Present',
                        'detail' => 'Teaches Preschool, Elementary, and High School students in all subjects, plus basic drawing and painting — including lessons adapted for children with mental challenges.',
                    ],
                    [
                        'type' => 'education',
                        'title' => 'BS in Computer Science',
                        'subtitle' => 'STI (Systems Technology Institute), Bacoor Cavite · 2005',
                    ],
                ],
            ],
            [
                'name' => 'Adrique Aldana',
                'email' => 'adriqueaaldana@gmail.com',
                'credential' => 'BS Psychology · Clinical & HR intern · Shadow teacher experience',
                'bio' => 'Adrique is a BS Psychology graduate with hands-on experience as a clinic assistant and shadow teacher, plus training in psychological first aid and disability sensitivity — bringing extra care and awareness to how he works with children.',
                'photo_path' => '/images/tutors/adrique-aldana.jpg',
                'specializations' => ['Reading', 'Writing', 'Math', 'English', 'Science', 'Filipino', 'Mapeh', 'AP'],
                'categories' => ['academic', 'special'],
                'experience' => [
                    ['type' => 'certification', 'title' => 'Certified Human Resource Associate (CHRA)'],
                    ['type' => 'work', 'title' => 'Shadow Teacher (Part-Time)', 'subtitle' => 'Holy Child Jesus of Montessori, Dasmariñas · Dec 2025 – Aug 2026'],
                    ['type' => 'work', 'title' => 'Clinic Assistant (Internship)', 'subtitle' => "LJ's Talkspace Psychological Clinic, Silang · Aug – Oct 2025", 'detail' => 'Administered and interpreted standardized psychological tests and conducted admission interviews for clinical presenting clients.'],
                    ['type' => 'work', 'title' => 'HR Generalist (Internship)', 'subtitle' => 'National University, Dasmariñas · Jan – Mar 2026'],
                    ['type' => 'certification', 'title' => 'Psychological First Aid, Suicide & Grief, and Disability Sensitivity Trainings'],
                ],
            ],
            [
                'name' => 'Sandara Maye Cristin',
                'email' => 'cristinsandaramayee@gmail.com',
                'credential' => 'BS Psychology, CHRA · Clinical intern · Disability sensitivity trained',
                'bio' => 'Sandara is a BS Psychology graduate and Certified Human Resource Associate with clinical internship experience and multiple disability-sensitivity trainings — background that translates into patient, aware teaching with children of all needs.',
                'photo_path' => '/images/tutors/sandara-cristin.jpg',
                'specializations' => ['Reading', 'Writing', 'Math', 'English', 'Science', 'Filipino', 'Mapeh', 'AP'],
                'categories' => ['academic', 'special'],
                'experience' => [
                    ['type' => 'certification', 'title' => 'Certified Human Resource Associate (CHRA)'],
                    ['type' => 'work', 'title' => 'Clinic Assistant (Internship)', 'subtitle' => "LJ's Talk Space, Silang · Aug – Oct 2025", 'detail' => 'Conducted structured admission interviews and assisted in preparing psychological reports with diagnostic impressions.'],
                    ['type' => 'work', 'title' => 'HR Generalist (Internship)', 'subtitle' => 'National University, Dasmariñas · Jan – Mar 2026'],
                    ['type' => 'certification', 'title' => 'Suicide Prevention Month Co-Speaker (2025)'],
                    ['type' => 'certification', 'title' => 'Visual, Deaf, and Physical Disability Sensitivity Trainings'],
                ],
            ],
            [
                'name' => 'Angelique Aldana',
                'email' => 'aaldanajlk17@gmail.com',
                'credential' => 'BS Occupational Therapy student · Assistant private tutor',
                'bio' => 'Angelique is a college student pursuing Occupational Therapy who has already worked as an assistant private tutor and photographer/editor for Happy Kid Arts, bringing organization and patience to her sessions with students.',
                'photo_path' => '/images/tutors/angelique-aldana.jpg',
                'specializations' => ['Reading', 'Writing', 'Math', 'English', 'Science', 'Filipino', 'Mapeh', 'AP'],
                'categories' => ['academic'],
                'experience' => [
                    ['type' => 'education', 'title' => 'BS in Occupational Therapy (In Progress)', 'subtitle' => 'University of Perpetual Help System DALTA, Las Piñas · 2025 – Present'],
                    ['type' => 'work', 'title' => 'Assistant Private Tutor', 'subtitle' => 'Happy Kids Art Tutorial · May 2025'],
                    ['type' => 'work', 'title' => 'Photographer / Editor', 'subtitle' => 'Happy Kids Art Tutorial · 2025'],
                ],
            ],
            [
                'name' => 'Glenn Michael Pila',
                'email' => 'glennmichaelpila5@gmail.com',
                'credential' => 'Art teacher & video editor since 2021 · Award-winning illustrator',
                'bio' => "Glenn has taught art and edited video content for Happy Kid Arts since 2021. His drawing and painting have been featured in several exhibits, including Luna Galleria and Neoma Gallery's international virtual showcases.",
                'photo_path' => '/images/tutors/glenn-pila.jpg',
                'specializations' => ['Drawing & Painting', 'Reading', 'Writing', 'Math', 'English', 'Science', 'Filipino', 'Mapeh', 'AP'],
                'categories' => ['arts', 'academic'],
                'experience' => [
                    ['type' => 'work', 'title' => 'Art Teacher & Video Editor', 'subtitle' => 'Happy Kid Arts and Tutorial · 2021 – 2026'],
                    ['type' => 'award', 'title' => 'Champion — Got Talent Showcase for Art Appreciation', 'subtitle' => '2026'],
                    ['type' => 'award', 'title' => 'Luna Galleria & Neoma Gallery International Virtual Art Exhibits', 'subtitle' => '2022 – 2023'],
                    ['type' => 'award', 'title' => '"ARTBEAT: MUSEUM" Student Showcase', 'subtitle' => 'Philippine Christian University-Dasmariñas · 2025'],
                ],
            ],
            [
                'name' => 'Maria Victoria Roaquin-De Leon',
                'email' => 'meanne3363@gmail.com',
                'credential' => 'TEFL/TESOL/TEYL certified · English instructor since 2007',
                'bio' => "Maria Victoria has taught English for nearly two decades, from junior high classrooms to online ESL lessons for adult learners abroad. She's TEFL, TESOL, and TEYL certified and currently runs her own tutorial center.",
                'photo_path' => '/images/tutors/maria-victoria.jpg',
                'specializations' => ['English', 'Reading', 'Writing', 'Math', 'Science', 'Filipino', 'Mapeh', 'AP'],
                'categories' => ['academic'],
                'experience' => [
                    ['type' => 'certification', 'title' => 'TEFL, TESOL & TEYL Certified'],
                    ['type' => 'work', 'title' => 'Academic Private Tutor & Owner', 'subtitle' => "Learn 'n Lead Tutorial Center · Sept 2022 – Present", 'detail' => 'Curates curriculum-based reviewers, monitors student progress, and teaches non-readers basic reading skills.'],
                    ['type' => 'work', 'title' => 'Senior High School Teacher, Practical Research', 'subtitle' => 'St. Jude Parish School · Sept 2021 – Mar 2022'],
                    ['type' => 'work', 'title' => 'Online ESL Teacher', 'subtitle' => 'Native Camp · Jan – Aug 2021', 'detail' => 'Delivered English lessons to adult Japanese learners.'],
                ],
            ],
            [
                'name' => 'Lily Roma',
                'email' => 'lily.roma@happykidarts.com',
                'credential' => 'Certified in Beginner Chinese (Mandarin & Hokkien) · Conversational fluency & practical vocabulary training',
                'bio' => 'Lily completed a beginner-level Mandarin and Hokkien language training program, developing conversational fluency and practical vocabulary for everyday communication — a great fit for students starting their Chinese language journey.',
                'photo_path' => '/images/tutors/lily-roma.jpg',
                'specializations' => ['Mandarin Chinese', 'Hokkien'],
                'categories' => ['academic'],
                'experience' => [
                    ['type' => 'certification', 'title' => 'Certificate in Beginner Chinese (Mandarin & Hokkien)', 'subtitle' => 'Language Training Program', 'detail' => 'Developed fundamental conversational fluency and listening comprehension in Mandarin Chinese and Hokkien, with practical vocabulary for professional and personal use.'],
                ],
            ],
        ];

        foreach ($tutors as $t) {
            $user = User::firstOrCreate(
                ['email' => $t['email']],
                [
                    'name' => $t['name'],
                    'password' => Hash::make('testpass123'),
                    'role' => 'tutor',
                    'email_verified_at' => now(),
                ]
            );

            TutorProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'credential' => $t['credential'],
                    'bio' => $t['bio'],
                    'photo_path' => $t['photo_path'],
                    'specializations' => $t['specializations'],
                    'categories' => $t['categories'],
                    'experience' => $t['experience'],
                    'is_verified' => true,
                ]
            );
        }
    }
}
