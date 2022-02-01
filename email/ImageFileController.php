<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Image;
use File;
use Excel;
use Illuminate\Support\Facades\Input;
use App\ProjectImport;
class ImageFileController extends Controller
{

    public function index()
    {
        ini_set('max_execution_time', '30000');
        $filesInFolder = File::files('image_old/old'); 
        //$filesInFolder = glob('image_old/old'); //array_diff(scandir('image_old/old'), array('.', '..')); ; 

        // foreach(glob('image_old/old/*.*') as $file) {
            
        // }
        $new_file_names = array();
        $changedFilesInFolder = File::files('image_new'); 
        foreach ($changedFilesInFolder as $key => $value) {
            $new_file = pathinfo($value);
            $new_file_names[] = $new_file['basename'];
        }
        
        foreach($filesInFolder as $key =>  $path) { 
            // if ($key == 1)
            // {
                $name = $this->random_strings(8);
                $file = pathinfo($path);
                $image_name = new ImageName();
                $image_name->old_image_name = $file['basename'];
                $image_name->new_image_name = $name.".png";
                $image_name->save();
            //dd($new_file_names );
            if (!in_array($file['basename'] , $new_file_names ))
            {echo ($file['basename']);
                $img = Image::make(public_path('image_old/old/'.$file['basename']));
                /* insert watermark at bottom-right corner with 10px offset */
                $img->insert(public_path('image/logo2.png'), 'bottom-right', 100, 1500);
                $img->save(public_path('image_new/'.$name.".png")); 
            }
       // }
            
        }
       
        dd('saved image successfully.');
       // return view('welcome');
    }
 
    public function script(Request $request)
    {
        
        //$data = Excel::load($request->file)->get();
        $data = Excel::import(new ProjectImport,request()->file('file'));
        // $data = Excel::load(request()->file('file'), function($reader) {

        // })->get();
        dd($data);
    }
        
    public function random_strings($length_of_string)
    {
    
        // String of all alphanumeric character
        $str_result = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    
        // Shuffle the $str_result and returns substring
        // of specified length
        return substr(str_shuffle($str_result), 
                        0, $length_of_string);
    }
}