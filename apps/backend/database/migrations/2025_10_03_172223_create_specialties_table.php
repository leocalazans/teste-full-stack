<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSpecialtiesTable extends Migration
{
    public function up()
    {
        Schema::create('specialties', function (Blueprint $table) {
            $table->uuid('id')->primary(); // Usando UUID como chave primária
            $table->string('name')->unique();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('specialties');
    }
}