<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateClinicsTable extends Migration
{
    public function up()
    {
        Schema::create('clinics', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Usando UUID como chave primária
            $table->string('corporate_name'); // corporateName
            $table->string('fantasy_name');   // fantasyName
            $table->string('cnpj')->unique();
            $table->string('regional');
            $table->date('inauguration_date')->nullable(); // inaugurationDate
            $table->boolean('is_active')->default(true); // isActive
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('clinics');
    }
}