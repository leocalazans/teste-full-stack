<?php
namespace App;

use Illuminate\Database\Eloquent\Model;

class Clinic extends Model
{
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'corporate_name',
        'fantasy_name',
        'cnpj',
        'regional',
        'inauguration_date',
        'is_active',
        'id'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        // 'inauguration_date' => 'date', // Opcional, dependendo de como você quer tratar a data
    ];
     // 1. Adiciona 'regional_name' à saída JSON quando a clínica for carregada
    protected $appends = ['regional_name'];

    // 2. Esconde o UUID da chave estrangeira 'regional' e o objeto 'region' completo
    protected $hidden = ['region']; 

    /**
     * Relacionamento N:M com Specialty.
     */
    public function specialties()
    {
        // O Laravel infere os nomes da tabela pivot e das chaves se seguir o padrão
        return $this->belongsToMany(Specialty::class, 'clinic_specialty', 'clinic_id', 'specialty_id');
    }

    public function region()
    {
        return $this->belongsTo(Region::class, 'regional', 'id');
    }

    public function getRegionalNameAttribute()
    {
        return $this->region ? $this->region->name : null;
    }
}