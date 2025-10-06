<?php

/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| Here you may define all of your model factories. Model factories give
| you a convenient way to create models for testing and seeding your
| database. Just tell the factory how a default model should look.
|
*/
use Faker\Generator as Faker;
use Ramsey\Uuid\Uuid;

/** @var \Illuminate\Database\Eloquent\Factory $factory */
$factory->define(App\User::class, function (Faker\Generator $faker) {
    static $password;

    return [
        'name' => $faker->name,
        'email' => $faker->unique()->safeEmail,
        'password' => $password ?: $password = bcrypt('secret'),
        'remember_token' => str_random(10),
    ];
});

$factory->define(App\Clinic::class, function (Faker $faker) {
    // Supondo que você tenha a tabela regions
    $regionIds = DB::table('regions')->pluck('id')->toArray();

    return [
        'id'                => Uuid::uuid4()->toString(),
        'corporate_name'    => $faker->company . ' LTDA',
        'fantasy_name'      => $faker->company,
        'cnpj'              => $faker->unique()->numerify('########0001##'), // CNPJ fake
        'regional'          => $faker->randomElement($regionIds),
        'inauguration_date' => $faker->date('Y-m-d', 'now'),
        'is_active'         => $faker->boolean(80), // 80% chance de true
        'created_at'        => now(),
        'updated_at'        => now(),
    ];
});