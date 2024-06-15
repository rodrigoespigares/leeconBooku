<?php

namespace App\Http\Controllers;

use App\Repository\RetosRepository;
use App\Utils\Utils;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;

class RetoController extends Controller
{
    protected $repository;
    public function __construct(RetosRepository $repository)
    {
        $this->repository = $repository;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data=$this->repository->buscaReto();
        
        
        $json["head"]=Utils::statusMessage(202,"Ok");
        $json['data']=$data;

        return response()->json($json);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $json["head"]=Utils::statusMessage(202,"Se ha creado el reto correctamente");

        $data['uid'] = $request->uid;
        $data['nombre'] = $request->nombre;
        $data['id_libros'] = $request->id_libros;
        $data['duracion'] = $request->duracion;

       
        $json["head"]['id'] = $this->repository->creaReto($data);

        return response()->json($json);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {

        $data=$this->repository->getReto($id);

        $json["head"]=Utils::statusMessage(202,"¿Vas a comenzar este reto?");
        $json["data"]= $data;

        return response()->json($json);
    }

    /**
     * Show the form for editing the specified resource.           
     */
    public function edit(string $id)
    {
        $json["head"]= Utils::statusMessage(202,"El reto ha sido editado");

        $json["data"]= $this->repository->getReto($id);

        return response()->json($json);
    }

    /**
     * Update the specified resource in storage.    
     */
    public function update(string $id, Request $request)
    {
        $json["head"]=Utils::statusMessage(202,"El reto ha sido editado");

        $data['uid'] = $request->uid;
        $data['nombre'] = $request->nombre;
        $data['id_libros'] = $request->id_libros;
        $data['duracion'] = $request->duracion;

        $this->repository->editReto($id,$data);

        return response()->json($json);
    }
    /**
     * Remove the specified resource from storage.
     */
    public function destroy(String $id)
    {
        $json["head"]=Utils::statusMessage(202,"El reto ha sido borrado");
        $this->repository->removeReto("reto/".$id);


        return response()->json($json);
    }
}
