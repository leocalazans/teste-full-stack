<?php


use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;


class ClinicSpecialtyTableSeeder extends Seeder
{
    public function run()
    {
        $clinics = DB::table('clinics')->pluck('id', 'fantasy_name');
        $specialties = DB::table('specialties')->pluck('id', 'name');

        $relations = [
            ['clinic' => 'Saúde Total', 'specialties' => ['Cardiologia', 'Dermatologia']],
            ['clinic' => 'Bem Viver',   'specialties' => ['Pediatria', 'Ortopedia', 'Ginecologia']],
            [
                'clinic' => 'Vida Plena',  
                'specialties' => ['Neurologia', 'Psiquiatria', 'Oftalmologia', 'Endocrinologia', 'Gastroenterologia', 'Urologia', 'Alergista']
            ],

        ];

        foreach ($relations as $relation) {

            // Verifica se a clínica existe
            if (!isset($clinics[$relation['clinic']])) {
                echo "Clínica não encontrada: {$relation['clinic']}\n";
                continue;
            }

            $clinicId = $clinics[$relation['clinic']];

            foreach ($relation['specialties'] as $specName) {

                // Verifica se a especialidade existe
                if (!isset($specialties[$specName])) {
                    echo "Especialidade não encontrada: {$specName}\n";
                    continue;
                }

                DB::table('clinic_specialty')->insert([
                    'clinic_id' => $clinicId,
                    'specialty_id' => $specialties[$specName],
                ]);
            }
        }
    }
}
