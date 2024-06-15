<?php

namespace App\Http\Controllers;

use App\Repository\LibrosRepository;
use App\Utils\Utils;
use Illuminate\Http\Request;

class LibrosController extends Controller
{
    protected $repository;
    public function __construct(LibrosRepository $repository)
    {
        $this->repository = $repository;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data=$this->repository->allBooks();
        
        
        $json["head"]=Utils::statusMessage(202,"Ok");
        $json['data']=$data;

        return response()->json($json);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Request $request)
    {
        $json["head"]=Utils::statusMessage(202,"Se ha creado el libro correctamente");

        $data['isbn']=$request->isbn;
        $data['foto']=$request->foto;
        $data['titulo']=$request->titulo;
        $data['autor']=$request->autor;
        $data['descripcion']=$request->descripcion;

        $this->repository->creaLibro($data);
        
        return response()->json($json);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {

        $data=$this->repository->getBook($id);

        $json["head"]=Utils::statusMessage(202,"Ok");
        $json["data"]= $data;

        return response()->json($json);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $json["head"]=Utils::statusMessage(202,"¿Vas a editar este libro?");
        $json["data"]= $this->repository->getBook($id);

        return response()->json($json);
    }

    public function update(string $id, Request $request)
    {
        $json["head"]=Utils::statusMessage(202,"El reto ha sido editado");

        $data['isbn']=$request->isbn;
        $data['foto']=$request->foto;
        $data['titulo']=$request->titulo;
        $data['autor']=$request->autor;
        $data['descripcion']=$request->descripcion;

        $this->repository->editBook($id,$data);

        return response()->json($json);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $json["head"]=Utils::statusMessage(202,"El libro ha sido borrado");
        $this->repository->removeBook($id);

        return response()->json($json);
    }
}
