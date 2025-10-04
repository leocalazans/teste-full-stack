<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $this->call(UserSeeder::class);
        $this->call(ClinicsTableSeeder::class);
        $this->call(ClinicSpecialtyTableSeeder::class);
        $this->call(SpecialtiesTableSeeder::class);
    }
}
