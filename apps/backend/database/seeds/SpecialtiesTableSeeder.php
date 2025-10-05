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
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Alergista',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Ginecologia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Psiquiatria',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Oftalmologia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Endocrinologia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Gastroenterologia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Urologia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Oncologia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Reumatologia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Hematologia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Nefrologia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Infectologia',
            ],          
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Otorrinolaringologia',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Cirurgia Geral',
            ],
            [
                'id' => Uuid::uuid4()->toString(),
                'name' => 'Medicina do Trabalho',
            ],
        ]);
    }
}
