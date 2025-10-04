<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Ramsey\Uuid\Uuid;

class SpecialtiesTableSeeder extends Seeder
{
    public function run()
    {
        DB::table('specialties')->insert([
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Cardiologia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Pediatria',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Dermatologia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Ortopedia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Neurologia',
            ],
        ]);
    }
}
