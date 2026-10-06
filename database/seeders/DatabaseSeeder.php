<?php

namespace Database\Seeders;

use App\Models\TutorProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $pw = 'testpass123';

        User::create(['name' => 'Test Admin', 'email' => 'admin@test.com', 'password' => $pw, 'role' => 'admin']);

        $tutors = [
            ['Ana Reyes',    ['Math', 'Algebra'],     '5'],
            ['Ben Cruz',     ['English', 'Filipino'], '3'],
            ['Carla Santos', ['Science', 'Art'],      '4'],
        ];

        foreach ($tutors as $i => [$name, $specs, $years]) {
            $tutor = User::create([
                'name' => $name,
                'email' => 'tutor'.($i + 1).'@test.com',
                'password' => $pw,
                'role' => 'tutor',
            ]);

            TutorProfile::create([
                'user_id' => $tutor->id,
                'bio' => 'Experienced tutor in '.implode(', ', $specs).'.',
                'specializations' => $specs,
                'years_experience' => $years,
                'is_verified' => true,
                'rating' => 4.5,
            ]);
        }

        $parent1 = User::create(['name' => 'Peachy Teacher', 'email' => 'teacherpeachy871@gmail.com', 'password' => $pw, 'role' => 'parent']);
        $parent2 = User::create(['name' => 'Second Parent', 'email' => 'parent2@test.com', 'password' => $pw, 'role' => 'parent']);

        $now = now();
        DB::table('student_profiles')->insert([
            ['parent_id' => $parent1->id, 'student_name' => 'Mika', 'grade_level' => 'Grade 4', 'created_at' => $now, 'updated_at' => $now],
            ['parent_id' => $parent1->id, 'student_name' => 'Leo',  'grade_level' => 'Grade 7', 'created_at' => $now, 'updated_at' => $now],
            ['parent_id' => $parent2->id, 'student_name' => 'Nina', 'grade_level' => 'Grade 2', 'created_at' => $now, 'updated_at' => $now],
        ]);

        DB::table('applications')->insert([
            [
                'full_name' => 'Dina Lopez', 'email' => 'applicant1@test.com', 'phone' => '09171234567',
                'specializations' => json_encode(['Math']), 'years_experience' => '2',
                'cover_letter' => 'I would like to teach.', 'status' => 'new',
                'created_at' => $now, 'updated_at' => $now,
            ],
            [
                'full_name' => 'Eric Tan', 'email' => 'applicant2@test.com', 'phone' => '09179876543',
                'specializations' => json_encode(['Science']), 'years_experience' => '1',
                'cover_letter' => 'Applying as a tutor.', 'status' => 'new',
                'created_at' => $now, 'updated_at' => $now,
            ],
        ]);

        $this->call(RealTutorsSeeder::class);
    }
}
