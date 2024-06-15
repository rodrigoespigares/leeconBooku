<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reto extends Model
{
    use HasFactory;


    protected $fillable = [
        'uid_user',
        'id_reto',
        'nombre',
        'libros',
    ];
}
