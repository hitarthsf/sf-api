<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Validator;
use Illuminate\Contracts\Hashing\Hasher as HasherContract;
use Illuminate\Support\Str;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Response;
use App\XApi;
use Hash;
use File;
use Route;
use App\Location;
use App\User;
use App\Skills;
use App\Ratings;
use App\RatingCustomer;
use App\RatingSkill;
use App\UserLocation;
use App\Settings;
use App\LocationAreaSkill;
use App\LocationArea;
use App\Categories;
use App\EmployeeCategory;
use App\GeneralFunction;
use App\CppqRatingMaster;
use App\CppqAnswers;
use App\Privacy;
use App\PrivacyLocation;
use App\RatingUser;
use App\SecondaryLocation;
use App\ScreenSaver;
use App\ScreenSaverLocation;
use App\Models\HexNodeHelper;
use Storage;
use URL;
use Carbon\Carbon;
use Mail;
use DB;
use App\AbusiveWords;

class ApiController extends Controller
{ 

      public function __construct() {
        //API log code.
        $headers = apache_request_headers();
        $file = 'apilog.txt';
        list($controller , $action) = explode('@', Route::getCurrentRoute()->getActionName());
            
        if(file_exists($file)) {
            $data        = '';
            $info        = $headers;
            $headInfo    = http_build_query($info,'', ',');
            list($controller , $action) = explode('@', Route::getCurrentRoute()->getActionName());
            
            $requestData = http_build_query(Request::all(), '', ',');
            $date        = date('d-m-Y H:i:s');
            $data        = 'Date : '.$date.' | Controller : '.$controller.' | Action : '.$action.' | Request  Parameters :'.$requestData.' | Header Information :'.$headInfo;
            if ( 0 != filesize( $file )) {
                $data = "\r\n".$data;
            }
            $handle      = fopen($file, 'a') or die('Cannot open file:  '.$file);
            fwrite($handle, $data);
            fclose($handle);
        }
    }

    public function Append($log_file, $value)
    {   
        File::append($log_file, $value . "\r\n");
    }

    //Add Log for Reqest Params Log from App
    public function LogInput(Request $request)
    {
        $log_file = storage_path() . '/logs/api' . date('Ymd') . '.log';
        $headers = apache_request_headers();

        $this->Append($log_file,'----------------' . debug_backtrace()[1]['function'] . ' --------------');
        $this->Append($log_file,'Request Info : ');
        $this->Append($log_file,'Date: ' . date('Y-m-d H:i:s') . '    IP: ' . $request->ip());
        $this->Append($log_file,'User-Agent: ' . $request->header('User-Agent'));
        $this->Append($log_file,'URL: ' . $request->url());
        $this->Append($log_file,'Input Parameters: ' .  json_encode(\Request::all()));
        $this->Append($log_file,'Headers Parameters: ' .  json_encode($headers));
        $this->Append($log_file,'-----------');
        return;
    }


    //Add Log for response Log for App
    public function LogOutput($output)
    {
        $log_file = storage_path() . '/logs/api' . date('Ymd') . '.log';
        $this->Append($log_file, 'Output: ');
        $this->Append($log_file,$output);
        $this->Append($log_file,'--------------------END------------------------');
        $this->Append($log_file,'');
        return;
    }
   
    //Location login API 
    public function locationLogin(Request $request) {
        $this->LogInput($request);
        $headers = apache_request_headers();
        $errors_array = array();
        $requestData = (array) json_decode(file_get_contents('php://input'), TRUE);
        $validator = Validator::make($requestData, []);

        if ($validator->fails()) {
            $this->LogOutput(Response::json(array('status'=>500,'message' => $validator->errors())));
            return Response::json(array('status'=>500,'message' => $validator->errors()));
        } else {


            if (isset($request->app_color) && $request->app_color != null) {
                $update_location   = Location::where('location_id' , $request->location )->update(['app_color' => $request->app_color]);    
            }
            $location = Location::with(['location_area','state','country'])->where('is_active',1)->where('location_id',$request->location)->first();

            // check location id
             if ($location == null) {
                $this->LogOutput(Response::json(array('status'=>500,'message' => "Invalid Location id")));
                return Response::json(array('status'=>500,'message' => "Invalid Location id"));
            } 

            // check password 
             if (isset($request->password)) {
                if ($request->password != $location->password)
                {
                    $this->LogOutput(Response::json(array('status'=>500,'message' => "Incorrect Password")));
                    return Response::json(array('status'=>500,'message' => "Incorrect Password"));   
                }
            } 
            
            //$headers['device_id'] = "c67faa9eda33093b1";
            // hexnode
            if(isset($request->device_id))
            {
                $hex_node_respose = HexNodeHelper::check($location,$request->device_id);    
            }
            
            


            $location_area = LocationArea::where('id',$location->location_area_id)->first();
            $url = url('/api/privacy');
            if ( $location_area != null )
            {

                if ( $location_area->privacy_link != null)
                {
                     $url = $location_area->privacy_link ;
                }
                elseif ( $location_area->privacy_text != null )
                {
                    $url = $url."/".$location_area->id;
                }
                else
                {
                    $privacy_policy = Settings::where('key',"privacy_policy")->first();
                    $url = $url."/0";
                }
            }
  
            if ($location == null) {
                $this->LogOutput(Response::json(array('status'=>500,'message' => "Invalid Location id")));
                return Response::json(array('status'=>500,'message' => "Invalid Location id"));

            } else { 
                $location['image'] = url('/')."/uploads/location/".$location->image; 
                $url =    Storage::disk('s3')->url('images/user/') ; 
                $location['app_backgroud_image'] = $url.$location->app_backgroud_image; 

                $location['zipcode'] = "0";
                if($location->app_color == null )
                {
                    $location['app_color'] = "#955275";    
                }
                
                $allow_cppq = $location_area->allow_cppq;


                //screen saver  
                $location_scree_saver_id = array('0',$location->id);

                $screen_saver_id = ScreenSaverLocation::where('location_area_id',$location->location_area_id)->whereIn('location_id',$location_scree_saver_id)->groupBy('screen_saver_id')->pluck('screen_saver_id')->toArray();
                

                $screen_saveer = array();
                $images = ScreenSaver::select('id','name','type')->whereIn('id',$screen_saver_id)->get();
                $image_url = Storage::disk('s3')->url('images/screen_saver/') ; 
                foreach ($images as $images_key => $images_value) {
                    if ($images_value->type == "file" || $images_value->type == "video" )
                    {
                        $images_value->name = $image_url.$images_value->name;
                        $screen_saveer[$images_key] = $images_value;
                    }
                    else
                    {
                        $screen_saveer[$images_key] = $images_value;
                    }
                }


                // check if hexnode wored 
                // flag 0 dont show pop up , 1 then show pop up 
                $hexnode_flag = 0 ; 
                $message = "Here are the details of location";

                if(isset($hex_node_respose['status']) && $hex_node_respose['status'] == "Fail" )
                {
                    $hexnode_flag = 1 ; 
                    $message = $hex_node_respose['message']   ;
                } 
                $this->LogOutput(Response::json(array('status'=>200,'message' => $message,'data' =>  $location ,'url' => $url , 'allow_cppq' => $allow_cppq  , 'screen_saveer' => $screen_saveer , 'hexnode_flag' => $hexnode_flag)));


                return Response::json(array('status'=>200,'message' => $message,'url' => $url ,'data' =>  $location , 'allow_cppq' => $allow_cppq  , 'screen_saveer' => $screen_saveer , 'hexnode_flag' => $hexnode_flag));   

            }
        }
    }

    //Employee listing API
    public function employeeList(Request $request) {
        //code starts
        $this->LogInput($request);
        $headers = apache_request_headers();
        $errors_array = array();
        $requestData = (array) json_decode(file_get_contents('php://input'), TRUE);
        $validator = Validator::make($requestData, []);

        if ($validator->fails()) {
            $this->LogOutput(Response::json(array('status'=>500,'message' => $validator->errors())));
            return Response::json(array('status'=>500,'message' => $validator->errors()));
        } else {
            $employee = array();
            $data = array();
            $location = Location::with(['location_area','state','country'])->where('is_active',1)->where('id',$request->location_id)->first();

            $user_employee_id = UserLocation::where('location_id',$request->location_id)->pluck('user_id')->toArray();
            if($location->is_show_location)
            {
                $employee = User::whereIn('id',$user_employee_id)->where('type','!=','area_manager')->where('is_show',1)->where('is_active',1)->get();
            }
            else $employee = User::whereIn('id',$user_employee_id)->where('type','employee')->where('is_show',1)->where('is_active',1)->get();
            // if ( isset($request->version ) && !is_null($request->version) && (double)$request->version > 1  )
            if ( strpos(URL::current(), 'stage') !== true ) 
            {
                $url =    Storage::disk('s3')->url('images/user/') ;  //'images/user/'
            }
            else
            {
                $url =    Storage::disk('s3')->url('images/user/thumbnail/') ; // 'images/user/thumbnail/'
            }
            
            foreach ($employee as $key => $value) {
                $data[$key] = $value;
                $employee_full_name = explode(' ', $value->name);
                $data[$key]['name'] =  $employee_full_name['0'];
                $data[$key]['image_name'] =  $value['image'];
                $data[$key]['image'] =  $url.$value['image'];
                //Storage::disk('s3')->temporaryUrl($url.$value['image'], Carbon::now()->addMinutes(5)) ;
            }
            
            //Qr code image code 
            if (isset($location->show_qr_code) && $location->show_qr_code == 1)
            {
                $qr_code =  Storage::disk('s3')->url('images/qrcode/'.$location->id.'.png') ; 
            }   
            else
            {
                $qr_code = "";
            }         

            
            $location_area = LocationArea::where('id',$location->location_area_id)->first();
            $url = url('/api/privacy');
            if ( $location_area != null )

            {
                
                if ( $location_area->privacy_link != null)
                {
                     $url = $location_area->privacy_link ;
                }
                elseif ( $location_area->privacy_text != null  )
                {
                    $url = $url."/".$location_area->id;
                }
                else
                {
                   $privacy_policy = Settings::where('key',"privacy_policy")->first();

                $url = $url."/0";
                }
            }
            $allow_cppq = $location_area->allow_cppq;

            //screen saver  
                $location_scree_saver_id = array('0',$location->id);

                $screen_saver_id = ScreenSaverLocation::where('location_area_id',$location->location_area_id)->whereIn('location_id',$location_scree_saver_id)->groupBy('screen_saver_id')->pluck('screen_saver_id')->toArray();

                $screen_saveer = array();
                $images = ScreenSaver::select('id','name','type')->whereIn('id',$screen_saver_id)->get();
                $image_url = Storage::disk('s3')->url('images/screen_saver/') ; 
                foreach ($images as $images_key => $images_value) {
                    if ($images_value->type == "file" || $images_value->type == "video" )
                    {
                        $images_value->name = $image_url.$images_value->name;
                        $screen_saveer[$images_key] = $images_value;
                    }
                    else
                    {
                        $screen_saveer[$images_key] = $images_value;
                    }
                }



            $this->LogOutput(Response::json(array('status'=>200,'message' => "List of employee",'data' =>  $data, 'url' => $url , 'qrcode' => $qr_code ,'isMultiLocation' => $location->is_multilocation  ,'hide_team' => $location->hide_team , 'allow_cppq' => $allow_cppq , 'screen_saver_image' => $screen_saveer)));
            return Response::json(array('status'=>200,'message' => "List of employee",'data' =>  $data , 'url' => $url , 'qrcode' => $qr_code ,'isMultiLocation' => $location->is_multilocation ,'hide_team' => $location->hide_team , 'allow_cppq' => $allow_cppq , 'screen_saver_image' => $screen_saveer));
        }
    }
    
    //Skill listing API
    public function skillList(Request $request) {
        $this->LogInput($request);
        $headers = apache_request_headers();
        $errors_array = array();
        $requestData = (array) json_decode(file_get_contents('php://input'), TRUE);
        $validator = Validator::make($requestData, []);

        if ($validator->fails()) {
            $this->LogOutput(Response::json(array('status'=>500,'message' => $validator->errors())));
            return Response::json(array('status'=>500,'message' => $validator->errors()));
        } else {
            $skill = array();
            $skill_v2 = array();
            
            $location_area = $location_area_id = Location::where('id',$request->location_id)->first();

            if (isset($location_area_id->use_location_skills) && $location_area_id->use_location_skills == 1)
            {
                $skill_id = LocationAreaSkill::where('location_id',$location_area_id->id)->pluck('skill_id')->toArray();
            }
            else
            {
                $skill_id = LocationAreaSkill::where('location_area_id',$location_area_id->location_area_id)->where('location_id',0)->pluck('skill_id')->toArray();    
            }

            $skill = Skills::where('type',$request['type'])->whereIn('id',$skill_id)->where('is_active',1)->with(['location'])->get();

            //new skill section 
            $skill_new = array();
            if ( isset($location_area_id->category_wise_skill) && isset($location_area->category_wise_skill) )
            {
                if ($location_area_id->category_wise_skill == 1 ||  $location_area->category_wise_skill == 1)
                {
                    $categories = Categories::all();
                    $count_skill = 0 ;     
                    $skill_array = array(); 
                        foreach ($categories as $categories_key => $categories_value) {
                            $skill_data = Skills::where('type',$request['type'])->whereIn('id',$skill_id)->where('categories_id',$categories_value->id)->where('is_active',1)->with(['location'])->get();

                            if ( count($skill_data)  > 0 )
                            {
                                $skill_array[$categories_key]['isCategory']  = true;
                            }
                            else
                            {
                                $skill_array[$categories_key]['isCategory']  = false;   
                            }
                            
                                $skill_array[$categories_key]['categoryId']  = $categories_value->name;
                                $skill_array[$categories_key]['skills']      = $skill_data;
                                $skill_v2                   = $skill_array;
                            
                        }
                        $skill_data = Skills::where('type',$request['type'])->whereIn('id',$skill_id)->where('categories_id',null)->where('is_active',1)->with(['location'])->get();
                        if (!isset($categories_key) )
                        {
                            $categories_key = 0 ;
                        } 
                        
                        if ( count($skill_data)  > 0 )
                            {
                                $skill_array[$categories_key]['isCategory']  = true;
                            }
                            else
                            {
                                $skill_array[$categories_key]['isCategory']  = false;   
                            }
                            
                                $skill_array[$categories_key]['categoryId']  = 'others';
                                $skill_array[$categories_key]['skills']      = $skill_data;
                                $skill_v2                   = $skill_array;

                        
                     
                        // change the skills data 
                        $skill_new = array();
                        $skill_new = $skill_v2;    
                }

            }
                
            $location = Location::with(['location_area','state','country'])->where('is_active',1)->where('id',$request->location_id)->first();
            
            
            $url = url('/api/privacy');
            if ( $location_area != null )
            {
                
                if ( $location_area->privacy_link != null)
                {
                     $url = $location_area->privacy_link ;
                }
                elseif ( $location_area->privacy_text != null  )
                {
                    $url = $url."/".$location_area->id;
                }
                else
                {
                   $privacy_policy = Settings::where('key',"privacy_policy")->first();

                $url = $url."/0";
                }
            }
            $this->LogOutput(Response::json(array('status'=>200,'message' => "List of skill",'data' =>  $skill, 'data_new' => $skill_new)));
            return Response::json(array('status'=>200,'message' => "List of skill", 'url'=>$url,'data' =>  $skill
            , 'data_new' => $skill_new ));
        }
    }
    // Skill list API
    public function skillFlag ( Request $request )
    {
        $this->LogInput($request);
        $headers = apache_request_headers();
        $errors_array = array();
        $requestData = $request->toArray();
        $validator = Validator::make($requestData, []);

        if ($validator->fails()) {
            $this->LogOutput(Response::json(array('status'=>500,'message' => $validator->errors())));
            return Response::json(array('status'=>500,'message' => $validator->errors()));
        } else {   
            $location_area_id = Location::where('id',$request->location_id)->first();
            $location_area = LocationArea::where('id',$location_area_id->location_area_id)->first();

            if ( isset($location_area_id->category_wise_skill) && isset($location_area->category_wise_skill) )
            {
                if ($location_area_id->category_wise_skill == 1 ||  $location_area->category_wise_skill == 1)
                {
                    $flag = 1;
                }
            }
            if (!isset($flag))
            {
                $flag = 0; 
            }
            $data['flag'] = $flag ;
            $this->LogOutput(Response::json(array('status'=>200,'message' => "Flag of skill",'data' =>  $data)));
            return Response::json(array('status'=>200,'message' => "Flag of skill",'data' =>  $data ));
        }
    }
    //Save Details API
    public function saveDetails(Request $request) {
        $this->LogInput($request);
        $headers = apache_request_headers();
        $errors_array = array();
        $requestData = $request->toArray();
        $validator = Validator::make($requestData, []);

        if ($validator->fails()) {
            $this->LogOutput(Response::json(array('status'=>500,'message' => $validator->errors())));
            return Response::json(array('status'=>500,'message' => $validator->errors()));
        } else {     
              
            $last_rating = Ratings::where('location_id',$request['location_id'])->orderBy('created_at','DESC')->first();
            $now = Carbon::now()->subMinutes(2)->format('Y-m-d H:i:s');
            $location = Location::where('id',$request['location_id'])->first();
            //dd($last_rating->created_at ." ----- " . $now);
            $fraud = 0;
            if ($last_rating != null &&  $last_rating->created_at > $now  )
            {
                $fraud = 1;
                
                // Mail::send(['html'=>'email.ratings'],['location'=>$location],function($message) use ($location){
                // //->cc(['joe@servefirst.co.uk','alan@servefirst.co.uk']) erol@servefirst.co.uk
                //      $message->to('hitarth.rc@gmail.com')->subject('Reapeted Rating');
                //  // $message->to('erol@servefirst.co.uk')->cc(['joe@servefirst.co.uk','alan@servefirst.co.uk'])->subject('Reapeted Rating');
                //   $message->from('vstechnology2019@gmail.com','ServeFirst');
                // });
            }
            $skills = array();

            if(isset($request['skill_id']) && $request['skill_id'] != null)
            {
                $skills = Skills::whereIn('id',$request['skill_id'])->get();    
            }
            $location_name = Location::where('id',$request->location_id)->first();
            if  ( $request['employee_id'] == null )
            {
                $request['employee_id'] = 0 ;
            }
            else
            {
            
                if ( $request['is_standout'] && $request['rating'] > 3   )

                {
                    $feedback = $request['feedback'];
                    $user = User::find($request['employee_id']);    


                    if ( $user->allow_email == 1  && config('app.env') != "dev")
                    {

                        Mail::send(['html'=>'email.employee'],['location_name'=>$location_name,'user'=>$user,'skills'=>$skills , 'feedback' => $feedback],function($message) use ($location_name,$user,$skills , $feedback){
                            
                            $message->to($user->email)->bcc('erol@servefirst.co.uk')->subject('CONGRATULATIONS');
                          $message->from('vstechnology2019@gmail.com','ServeFirst');
                        });
                    }
                
                }
                

            }
            //save Rating details
            $details = new Ratings();
            $details->location_id = $request['location_id'];
            //$details->employee_id = $request['employee_id'];
            $details->rating   = $request['rating'];
            $details->fraud   = $fraud;
            $details->dropout_page = $request['dropout_page'];

            //reomve absuvie words 
            $feedback = trim($request['feedback']." ".$request['other_feedback']);

            $words = AbusiveWords::pluck('word')->toArray();
            $sentence_words = explode(" ",$feedback );
            
            foreach ($words as $words_key => $words_value) {
                foreach ($sentence_words as $sentence_words_key => $sentence_words_value) {
                    if (strtolower($words_value) == strtolower($sentence_words_value) )
                    {
                        $sentence_words[$sentence_words_key] = str_repeat("*", strlen($words_value));
                    }
                }
                //$feedback = str_replace($words_value, $replace, $feedback);
            }
            $feedback = implode(" ", $sentence_words);
            $details->feedback = $feedback;
            if( $details->feedback == "") 
            {
                $details->feedback = null;
            }
            //$details->is_standout = $request['is_standout'];    
            $details->other_feedback = $request['other_feedback'];
            $details->out_of = 5;
            $percentage_rating = (($request['rating'] * 100) / 5);
            if ($percentage_rating <= 60)
            {
            $details->is_negative = 1;    
            }
            else
            {
             $details->is_negative = 0;       
            }
            if ( isset($request['created_at']) &&  !is_null($request['created_at'])  )
            {
                $details->created_at = $request['created_at'];    
            }
            if ( isset($request['device_id']) &&  !is_null($request['device_id'])  )
            {
                $details->device_id = $request['device_id'];    
            }


            $details->is_standout = $request['is_standout']  ;   
             

            //maintain assing_all flag
            if  ( $request['employee_id'] != null &&  $request['employee_id'] != "0" && $request['employee_id'] != 0  )
            {
                $details->assign_all = '1';
            }
            else
            {
                
                $details->assign_all = '0';
            }


            $details->save();

            // Save Rating id from CPPQ id 

            if ( isset($request['cppq_id']) &&  !is_null($request['cppq_id'])  )
            {
                $cppq = CppqRatingMaster::where('id',$request['cppq_id'])->update(['ratings_id'=>$details->id]);
            }

            if(isset($request['skill_id']) && $request['skill_id'] != null)
                $details->skill_id = json_encode($request['skill_id']);
           
            $user_employee_id = DB::table('user_location')->join('users','users.id','=','user_location.user_id')->where('users.is_active',1)->where('user_location.location_id',$request['location_id'])->where('users.include_in_ratings',1)->pluck('user_location.user_id')->toArray();
            if  ( $request['employee_id'] != null && $request['employee_id'] != 0   )
            {
                $employee_rating = new RatingUser();
                $employee_rating->ratings_id = $details->id;
                $employee_rating->user_id = $request['employee_id'];
                $employee_rating->save();    

            }
            else
            {
                foreach ($user_employee_id as $user_employee_id_key => $user_employee_id_value) {

                    $employee_rating = new RatingUser();

                    $employee_rating->ratings_id    = $details->id;

                    $employee_rating->user_id       = $user_employee_id_value;

                    $employee_rating->save();   

                }                   
            }


            if (isset($request['employee_id']) && $request['employee_id'] != null) 
             //category distrubution
            $location = Location::where('id',$request['location_id'])->first();

            if ( isset($location->category_wise_skill) && isset($location->category_wise_skill) )
            {
                if ($location->category_wise_skill == 1 ||  $location->category_wise_skill == 1)
                {
                    //get category 
                    $category = Skills::whereIn('id',$request['skill_id'])->groupBy('categories_id')->pluck('categories_id')->toArray();
                    // get employees from category
                    $employee_id = EmployeeCategory::whereIn('category_id',$category)->pluck('user_id')->toArray();
                    $user_id = Location::getCachedUserIdsForLocations(array($request['location_id']));        
                    $combine_ids  = array_intersect($employee_id, $user_id);
                    $request['employee_id'] = array($request['employee_id']);
                    
                    $employee_raw_ids =  array_diff( $combine_ids , $request['employee_id'] );
                    
                    foreach ($employee_raw_ids as $user_key => $user_value) {
                         $employee_rating = new RatingUser();
                         $employee_rating->ratings_id = $details->id;
                         $employee_rating->user_id = $user_value;
                         $employee_rating->save();
                    }
                }
            }


            //Save Customer Detail
            $privacy_location = PrivacyLocation::pluck('location_id')->toArray();
            if (!in_array($details->location_id, $privacy_location))
            {
                
                if (!in_array($details->location_id, $privacy_location) || !empty($request['customer_name']) || !empty($request['customer_phone'])  || !empty($request['customer_email'])) {   
                    
                    $customer = new RatingCustomer();
                    $customer->ratings_id = $details->id;
                    $customer->name = ($request['customer_name'])?$request['customer_name']:'';
                    $customer->phone = ($request['customer_phone'])?$request['customer_phone']:'';
                    $customer->email = ($request['customer_email'])?$request['customer_email']:'';
                    $customer->save();
                } 

            }
            else
            {
                if (!empty($request['customer_name']) || !empty($request['customer_phone'])  || !empty($request['customer_email'])  && config('app.env') != "dev")
                {
                 $privacy_location = PrivacyLocation::where('location_id',$details->location_id)->first();
                // Send mail if location is in privacy
                 Mail::send(['html'=>'email.privacy_location'],['location_name'=>$location_name,'request'=>$request,'privacy_location'=>$privacy_location , 'skills' => $skills],function($message) use ($request ,$privacy_location , $skills){
                
                    $message->to($privacy_location['email'])->bcc('erol@servefirst.co.uk')->subject('Complaint Recieved');

                  //$message->to($user->email)->subject('Positive Rating');
                  $message->from('vstechnology2019@gmail.com','ServeFirst');
                });

                } 

            }

            //Save Skills
            if (isset( $request['skill_id']) &&  count($request['skill_id']) > 0) {  
                foreach ($request['skill_id'] as $skill_key => $skill_value) {
                    $ratings_skill = new RatingSkill();
                    $ratings_skill->ratings_id = $details->id;
                    $ratings_skill->skills_id = $skill_value;
                    $ratings_skill->save();
                }                
            }
            // auto mail on comlaint recieved 
            $check_location = Location::where('id',$request['location_id'])->first();
            
            // && config('app.env') != "dev"

            if ( isset($check_location->allow_complain_mails) && $check_location->allow_complain_mails == 1 && $details->is_negative == 1 && $details->is_standout == 1  && isset($customer))
            {
                $send_mail = 0; 
                // check phone number
                if ( isset($customer->phone)  && strlen($customer->phone) == 11 &&  substr($customer->phone,0, 2)== "07" )
                {
                    $send_mail = 1;  
                }
                // check email
                if ( isset($customer->email) && filter_var($customer->email, FILTER_VALIDATE_EMAIL))
                {
                    $send_mail = 1;  
                }
                if ($send_mail == 1)
                {
                    
                    // region manger will haev location_id "0" and location manager will be having same location_area_id as region manager 
                    $user_id      = UserLocation::where('location_area_id',$check_location->location_area_id)->where('location_id',0)->orWhere('location_id',$request['location_id'])->pluck('user_id')->toArray();
                    
                    //$managers = User::whereIn('id',$user_id)->where('type','!=',"employee")->where('allow_complain_mails',1)->get();   
                    $managers = User::whereIn('id',$user_id)->where('type','!=',"employee")->where('allow_complain_mails',1)->get();   
                  
                    foreach ($managers as $key => $value) {
    
                        $user = $value;
                            if ( $user->allow_email == 1  && config('app.env') != "dev")
                            {
                                Mail::send(['html'=>'email.complaint'],['location_name'=>$location_name,'location'=>$check_location ,'user' => $user, 'details' => $details , 'customer' => $customer , 'skills' => $skills ],function($message) use ($location , $details , $user , $customer, $value , $skills){
                                   
                                $message->to($value->email)->bcc('erol@servefirst.co.uk')->subject('Serve First - Complaint Recieved.');
                                //$message->to($value->email)->subject('Serve First - Complaint Recieved.');
                                $message->from('vstechnology2019@gmail.com','ServeFirst');
                                 });
                            }
    
                     } 
                }
                
            }  
         
            $this->LogOutput(Response::json(array('status'=>200,'message' => "Details saved",'data' =>  $details)));
            return Response::json(array('status'=>200,'message' => "Details saved",'data' =>  $details));
        }
    }

    //  Secondary Location 

    public function secondaryLocation ( Request $request)
    {
        $this->LogInput($request);
        $headers = apache_request_headers();
        $errors_array = array();
        $requestData = $request->toArray();
        $validator = Validator::make($requestData, []);


        $secondaryLocations = DB::table('secondary_locations')->join('location','location.id','=','secondary_locations.secondary_location_id')->groupBy('secondary_locations.secondary_location_id')->select('secondary_locations.secondary_location_id as id','location.name as name')->where('secondary_locations.location_id',$request['location_id'])->get();
        
        
        $this->LogOutput(Response::json(array('status'=>200,'message' => "Secondary Locations",'data' =>  $secondaryLocations)));
        return Response::json(array('status'=>200,'message' => "Secondary Locations",'data' =>  $secondaryLocations));
    }

    /*/Save Details API
    public function syncData(Request $request) {
        $this->LogInput($request);
        $headers = apache_request_headers();
        $errors_array = array();
        $requestData = $request->toArray();
        $validator = Validator::make($requestData, []);

        if ($validator->fails()) {
            $this->LogOutput(Response::json(array('status'=>500,'message' => $validator->errors())));
            return Response::json(array('status'=>500,'message' => $validator->errors()));
        } else {  
            foreach ($requestData as $key => $value) {
                //save Rating details

                $details = new Ratings();
                $details->location_id = $value['location_id'];
                $details->employee_id = $value['employee_id'];
                $details->rating   = $value['rating'];
                $details->dropout_page = $value['dropout_page'];
                $details->feedback = trim($value['feedback']." ".$value['other_feedback']);
                if( $details->feedback == "") 
                {
                    $details->feedback = null;
                }
                $details->is_standout = $value['is_standout'];
                $details->other_feedback = $value['other_feedback'];
                $details->out_of = 5;
                $percentage_rating = (($value['rating'] * 100) / 5);
                if ($percentage_rating <= 60)
                {
                $details->is_negative = 1;    
                }
                else
                {
                 $details->is_negative = 0;       
                }
                $details->save();
                
                if(isset($value['skill_id']) && $value['skill_id'] != null)
                    $details->skill_id = json_encode($value['skill_id']);

                //Save Customer Detail
                if (!empty($value['customer_name']) || !empty($value['customer_phone'])  || !empty($value['customer_email'])) {   
                    $customer = new RatingCustomer();
                    $customer->ratings_id = $details->id;
                    $customer->name = ($value['customer_name'])?$value['customer_name']:'';
                    $customer->phone = ($value['customer_phone'])?$value['customer_phone']:'';
                    $customer->email = ($value['customer_email'])?$value['customer_email']:'';
                    $customer->save();
                }             

                //Save Skills
                if (isset( $value['skill_id'])) {
                    if( count($value['skill_id']) > 0){
                        foreach ($value['skill_id'] as $skill_key => $skill_value) {
                            $ratings_skill = new RatingSkill();
                            $ratings_skill->ratings_id = $details->id;
                            $ratings_skill->skills_id = $skill_value;
                            $ratings_skill->save();
                        }   
                    }                
                }
                   
            }
            $this->LogOutput(Response::json(array('status'=>200,'message' => "Details saved",'data' =>  $details)));
            return Response::json(array('status'=>200,'message' => "Details saved",'data' =>  $details));
        }
    }
    */

     public function privacy ( )
    {   
     
        return view('privacy');
    }

    public function privacyPage ( Request $request , $id )
    {

        if ( !isset($id) ||  $id ==0  )
        {
            $privacy = Settings::where('key',"privacy_policy")->first();

        }
        else
        {
            $privacy = LocationArea::where('id',$id)->first();    
        }
        
        return view('privacy.privacy',compact('privacy'));
    }

    //set cron for the inactive location 

    public function inactiveLocation ()
    {
        $now = Carbon::now()->format('Y-m-d 00:00:00');
        $rating = Ratings::where('created_at','>=' ,$now)->groupBy('location_id')->pluck('location_id')->toArray();
        $location_id = Location::where('is_active',1)->pluck('id')->toArray();
        $in_active_location_id = array_diff($location_id, $rating);   
        $location = Location::whereIn('id',$in_active_location_id)->get();
        $date = Carbon::parse($now)->format('d M, Y') ;
        if ( $location->isNotEmpty() )
        {    
            Mail::send(['html'=>'email.inactiveLocation'],['location'=>$location , 'date' => $date ],function($message) use ($location , $date){
                $message->to('erol@servefirst.co.uk')->cc(['alan@servefirst.co.uk','vstechnology2019@gmail.com'])->subject('Serve First - Inactive Location on '.$date);
                $message->from('vstechnology2019@gmail.com','ServeFirst');
            });
        }

        
    }


    /// Storing CPPQ answers 
    public function cppqAnswerSave ( Request $request )
    {
        // $all = DB::table('questions')->where('id' , '>=' , 33 )->orderBy('id','DESC')->get();
        // foreach ($all as $key => $value) {
        //     $update = DB::table('questions')->where('id' , $value->id )->update(['id' => $value->id + 1 ]);
        // }
        // dd("|dd");

         $this->LogInput($request);
        $headers = apache_request_headers();
        $errors_array = array();
        $requestData = $request->toArray();
        $validator = Validator::make($requestData, []);

        $array_for_answers = array('1_a'=> 2 , '1_b' => 3 , '1_c' => 4 , '2' => 5 , '3' => 6 ,  '4_a' => 8 , '4_b' => 9 , '4_c' => 10 , '4_d' => 11 , '4_e' => 12 , '4_f' => 13 , '5_a' => 15 , '5_b' => 16 , '5_c' => 17 , '5_d' => 18 , '5_e' => 19 , '5_f' => 20 , '6_a' => 22 , '6_b' => 23  ,'6_c' => 24 , '6_d' => 25  , '7_a' =>  41 , '7_b' =>  42 , '7_c' =>  43, '8' => 27 , '9_a' => 29 ,'9_b' => 30 , '10' => 31 , '11_a' => 33 ,'11_b' => 34  , '12' =>  35 , '13' => 36 , '14' => 37 , '15' => 38 , '16' => 39 , '17' => 40 );
        $array_keys = array_keys($array_for_answers);
        
        // add entry in master table 

        $cppq_master = new CppqRatingMaster();
        $cppq_master->location_id   = $requestData['location_id'];
        $cppq_master->save();


        //foreach of arrays 
        foreach ($array_keys as $array_keys_key => $array_keys_value) {
            
            // if answer is in array due to multi select 
            if ($array_keys_value == "11_a")
            {
                $explode_string   = explode(",", $requestData[$array_keys_value]) ;  
                foreach ($explode_string as $_explode_string_key => $explode_string_value) {
                    $cppq_answer = new CppqAnswers();
                    $cppq_answer->cppq_rating_master_id     = $cppq_master->id;
                    $cppq_answer->question_id               = $array_for_answers[$array_keys_value];
                    $cppq_answer->answer                    = $explode_string_value;
                    $cppq_answer->save();        
                }
                
            } 
            // if answer is single 
            else
            {
                if (isset($requestData[$array_keys_value])) 
                {
                    $cppq_answer = new CppqAnswers();
                    $cppq_answer->cppq_rating_master_id     = $cppq_master->id;
                    $cppq_answer->question_id               = $array_for_answers[$array_keys_value];
                    $cppq_answer->answer                    = $requestData[$array_keys_value];
                    $cppq_answer->save();    
                }
              

            }
            
            
        }
        

        $this->LogOutput(Response::json(array('status'=>200,'message' => "Cppq Answers Saved " , 'cppq_id' => $cppq_master->id)));
        return Response::json(array('status'=>200,'message' => "Cppq Answers Saved " , 'cppq_id' => $cppq_master->id) );
    }

    // get all data 
    public function getAllData ( Request $request )
    {

      if (isset($request->main_location))
     {
       
        $main_location = Location::where('is_active',1)->where('id',$request->main_location)->first();
        if ($main_location->is_multilocation  == 0 )
        {
            $request->location = $request->main_location;
        } 
        
        //check
     }
           
     $location = Location::with(['location_area','state','country'])->where('is_active',1)->where('id',$request->location)->first();


     // skills
     $skill_positive = array();
            $skill_v2_positive = array();
            $skill_v2_negative = array();
            $location_area = $location_area_id = Location::where('id',$request->location)->first();
            
            if (isset($location_area_id->use_location_skills) && $location_area_id->use_location_skills == 1)
            {
                $skill_id = LocationAreaSkill::where('location_id',$location_area_id->id)->pluck('skill_id')->toArray();
            }
            else
            {
                $skill_id = LocationAreaSkill::where('location_area_id',$location_area_id->location_area_id)->pluck('skill_id')->toArray();    
            }

            $skill_positive = Skills::where('type',1)->whereIn('id',$skill_id)->where('is_active',1)->with(['location'])->get();
            $skill_negative = Skills::where('type',0)->whereIn('id',$skill_id)->where('is_active',1)->with(['location'])->get();
            //new skill section  positive
            $skill_new_positive = array();
            if ( isset($location_area_id->category_wise_skill) && isset($location_area->category_wise_skill) )
            {
                if ($location_area_id->category_wise_skill == 1 ||  $location_area->category_wise_skill == 1)
                {
                    $categories = Categories::all();
                    $count_skill = 0 ;     
                    $skill_array = array(); 
                        foreach ($categories as $categories_key => $categories_value) {
                            $skill_data = Skills::where('type',1)->whereIn('id',$skill_id)->where('categories_id',$categories_value->id)->where('is_active',1)->with(['location'])->get();

                            if ( count($skill_data)  > 0 )
                            {
                                $skill_array[$categories_key]['isCategory']  = true;
                            }
                            else
                            {
                                $skill_array[$categories_key]['isCategory']  = false;   
                            }
                            
                                $skill_array[$categories_key]['categoryId']  = $categories_value->name;
                                $skill_array[$categories_key]['skills']      = $skill_data;
                                $skill_v2_positive                   = $skill_array;
                            
                        }
                        $skill_data = Skills::where('type',$request['type'])->whereIn('id',$skill_id)->where('categories_id',null)->where('is_active',1)->with(['location'])->get();
                        if (!isset($categories_key) )
                        {
                            $categories_key = 0 ;
                        } 
                        
                        if ( count($skill_data)  > 0 )
                            {
                                $skill_array[$categories_key]['isCategory']  = true;
                            }
                            else
                            {
                                $skill_array[$categories_key]['isCategory']  = false;   
                            }
                            
                                $skill_array[$categories_key]['categoryId']  = 'others';
                                $skill_array[$categories_key]['skills']      = $skill_data;
                                $skill_v2_positive                   = $skill_array;

                        
                     
                        // change the skills data 
                        $skill_new_positive = array();
                        $skill_new_positive = $skill_v2_positive;    
                }

            }
            //new skill section  negative
            $skill_new_negative = array();
            if ( isset($location_area_id->category_wise_skill) && isset($location_area->category_wise_skill) )
            {
                if ($location_area_id->category_wise_skill == 1 ||  $location_area->category_wise_skill == 1)
                {
                    $categories = Categories::all();
                    $count_skill = 0 ;     
                    $skill_array = array(); 
                        foreach ($categories as $categories_key => $categories_value) {
                            $skill_data = Skills::where('type',1)->whereIn('id',$skill_id)->where('categories_id',$categories_value->id)->where('is_active',1)->with(['location'])->get();

                            if ( count($skill_data)  > 0 )
                            {
                                $skill_array[$categories_key]['isCategory']  = true;
                            }
                            else
                            {
                                $skill_array[$categories_key]['isCategory']  = false;   
                            }
                            
                                $skill_array[$categories_key]['categoryId']  = $categories_value->name;
                                $skill_array[$categories_key]['skills']      = $skill_data;
                                $skill_v2_negative                   = $skill_array;
                            
                        }
                        $skill_data = Skills::where('type',$request['type'])->whereIn('id',$skill_id)->where('categories_id',null)->where('is_active',1)->with(['location'])->get();
                        if (!isset($categories_key) )
                        {
                            $categories_key = 0 ;
                        } 
                        
                        if ( count($skill_data)  > 0 )
                            {
                                $skill_array[$categories_key]['isCategory']  = true;
                            }
                            else
                            {
                                $skill_array[$categories_key]['isCategory']  = false;   
                            }
                            
                                $skill_array[$categories_key]['categoryId']  = 'others';
                                $skill_array[$categories_key]['skills']      = $skill_data;
                                $skill_v2_negative                           = $skill_array;

                        
                     
                        // change the skills data 
                        $skill_new_negative = array();
                        $skill_new_negative = $skill_v2_negative;    
                }

            }

            // employee
            $user_employee_id = UserLocation::where('location_id',$location->id)->pluck('user_id')->toArray();
            if($location->is_show_location)
            {
                $employee = User::whereIn('id',$user_employee_id)->where('type','!=','area_manager')->where('is_show',1)->where('is_active',1)->get();
            }
            else $employee = User::whereIn('id',$user_employee_id)->where('type','employee')->where('is_show',1)->where('is_active',1)->get();
            // if ( isset($request->version ) && !is_null($request->version) && (double)$request->version > 1  )
            if ( strpos(URL::current(), 'stage') !== true ) 
            {
                $url =    Storage::disk('s3')->url('images/user/') ;  //'images/user/'
            }
            else
            {
                $url =    Storage::disk('s3')->url('images/user/thumbnail/') ; // 'images/user/thumbnail/'
            }
            $employee_data = array();
            foreach ($employee as $key => $value) {
                $employee_data[$key] = $value;
                $employee_full_name = explode(' ', $value->name);
                $employee_data[$key]['name'] =  $employee_full_name['0'];
                $employee_data[$key]['image_name'] =  $value['image'];
                $employee_data[$key]['image'] =  $url.$value['image'];
                //Storage::disk('s3')->temporaryUrl($url.$value['image'], Carbon::now()->addMinutes(5)) ;
            }


            // screen saver
            //screen saver  
                $location_scree_saver_id = array('0',$location->id);

                $screen_saver_id = ScreenSaverLocation::where('location_area_id',$location->location_area_id)->whereIn('location_id',$location_scree_saver_id)->groupBy('screen_saver_id')->pluck('screen_saver_id')->toArray();
                

                $screen_saveer = array();
                $images = ScreenSaver::select('id','name','type')->whereIn('id',$screen_saver_id)->get();
                $image_url = Storage::disk('s3')->url('images/screen_saver/') ; 
                foreach ($images as $images_key => $images_value) {
                    if ($images_value->type == "file" || $images_value->type == "video" )
                    {
                        $images_value->name = $image_url.$images_value->name;
                        $screen_saveer[$images_key] = $images_value;
                    }
                    else
                    {
                        $screen_saveer[$images_key] = $images_value;
                    }
                }

            // skill flag 
            if ( isset($location_area_id->category_wise_skill) && isset($location_area->category_wise_skill) )
            {
                if ($location_area_id->category_wise_skill == 1 ||  $location_area->category_wise_skill == 1)
                {
                    $flag = 1;
                }
            }
            if (!isset($flag))
            {
                $flag = 0; 
            }

            //Qr code image code 
            if (isset($location->show_qr_code) && $location->show_qr_code == 1)
            {
                $qr_code =  Storage::disk('s3')->url('images/qrcode/'.$location->id.'.png') ; 
            }   
            else
            {
                $qr_code = "";
            }  

                
            // privacy policy 
            
            
            $url = url('/api/privacy');
            if ( $location_area != null )
            {
                
                if ( $location_area->privacy_link != null)
                {
                     $url = $location_area->privacy_link ;
                }
                elseif ( $location_area->privacy_text != null  )
                {
                    $url = $url."/".$location_area->id;
                }
                else
                {
                   $privacy_policy = Settings::where('key',"privacy_policy")->first();

                $url = $url."/0";
                }
            }

             if (isset($request->main_location))
             {
               
                $main_location = Location::where('is_active',1)->where('id',$request->main_location)->first();
                $location->is_multilocation = $main_location->is_multilocation;
             }
             $url =    Storage::disk('s3')->url('images/user/') ;  
             $location->app_backgroud_image = $url.$location->app_backgroud_image;
        
        $this->LogOutput(Response::json(array('status'=>200,'message' => "All details " , 'data' => $location , 'url' => $url )));
        return Response::json(array('status'=>200,'message' => "All details " , 'data' => $location , 'url' => $url , 'skill_positive' => $skill_positive , 'skill_negative' => $skill_negative ,'skill_new_positive' => $skill_new_positive , 'skill_new_negative' => $skill_new_negative , 'employee' => $employee_data , 'screen_saveer' => $screen_saveer , 'skill_flag' => $flag , 'qr_code' => $qr_code) );
    }


    public function saveAllRatings(Request $request) {
        $this->LogInput($request);
        $headers = apache_request_headers();
        $errors_array = array();
        $requestData = $request->toArray();
        $validator = Validator::make($requestData, []);

        if ($validator->fails()) {
            $this->LogOutput(Response::json(array('status'=>500,'message' => $validator->errors())));
            return Response::json(array('status'=>500,'message' => $validator->errors()));
        } else {     
              
            
            $now = Carbon::now()->subMinutes(2)->format('Y-m-d H:i:s');

            foreach ($request['rating_data'] as $key_rating => $value_rating ) {
                $last_rating = Ratings::where('location_id',$request['location_id'])->orderBy('created_at','DESC')->first();
            $location = Location::where('id',$request['location_id'])->first();
            //dd($last_rating->created_at ." ----- " . $now);
            $fraud = 0;
            if ($last_rating != null &&  $last_rating->created_at > $now  )
            {
                $fraud = 1;
                
                // Mail::send(['html'=>'email.ratings'],['location'=>$location],function($message) use ($location){
                // //->cc(['joe@servefirst.co.uk','alan@servefirst.co.uk']) erol@servefirst.co.uk
                //      $message->to('hitarth.rc@gmail.com')->subject('Reapeted Rating');
                //  // $message->to('erol@servefirst.co.uk')->cc(['joe@servefirst.co.uk','alan@servefirst.co.uk'])->subject('Reapeted Rating');
                //   $message->from('vstechnology2019@gmail.com','ServeFirst');
                // });
            }
            $skills = array();

            if(isset($request['skill_id']) && $request['skill_id'] != null)
            {
                $skills = Skills::whereIn('id',$request['skill_id'])->get();    
            }
            $location_name = Location::where('id',$request->location_id)->first();
            if  ( $request['employee_id'] == null )
            {
                $request['employee_id'] = 0 ;
            }
            else
            {
            
                if ( $request['is_standout'] && $request['rating'] > 3   )

                {
                    $feedback = $request['feedback'];
                    $user = User::find($request['employee_id']);    


                    if ( $user->allow_email == 1  && config('app.env') != "dev")
                    {

                        Mail::send(['html'=>'email.employee'],['location_name'=>$location_name,'user'=>$user,'skills'=>$skills , 'feedback' => $feedback],function($message) use ($location_name,$user,$skills , $feedback){
                            
                            $message->to($user->email)->bcc('erol@servefirst.co.uk')->subject('CONGRATULATIONS');
                          $message->from('vstechnology2019@gmail.com','ServeFirst');
                        });
                    }
                
                }
                

            }
            //save Rating details
            $details = new Ratings();
            $details->location_id = $request['location_id'];
            //$details->employee_id = $request['employee_id'];
            $details->rating   = $request['rating'];
            $details->fraud   = $fraud;
            $details->dropout_page = $request['dropout_page'];

            //reomve absuvie words 
            $feedback = trim($request['feedback']." ".$request['other_feedback']);

            $words = AbusiveWords::pluck('word')->toArray();
            $sentence_words = explode(" ",$feedback );
            
            foreach ($words as $words_key => $words_value) {
                foreach ($sentence_words as $sentence_words_key => $sentence_words_value) {
                    if (strtolower($words_value) == strtolower($sentence_words_value) )
                    {
                        $sentence_words[$sentence_words_key] = str_repeat("*", strlen($words_value));
                    }
                }
                //$feedback = str_replace($words_value, $replace, $feedback);
            }
            $feedback = implode(" ", $sentence_words);
            $details->feedback = $feedback;
            if( $details->feedback == "") 
            {
                $details->feedback = null;
            }
            //$details->is_standout = $request['is_standout'];    
            $details->other_feedback = $request['other_feedback'];
            $details->out_of = 5;
            $percentage_rating = (($request['rating'] * 100) / 5);
            if ($percentage_rating <= 60)
            {
            $details->is_negative = 1;    
            }
            else
            {
             $details->is_negative = 0;       
            }
            if ( isset($request['created_at']) &&  !is_null($request['created_at'])  )
            {
                $details->created_at = $request['created_at'];    
            }
            if ( isset($request['device_id']) &&  !is_null($request['device_id'])  )
            {
                $details->device_id = $request['device_id'];    
            }


            $details->is_standout = $request['is_standout']  ;   
             

            //maintain assing_all flag
            if  ( $request['employee_id'] != null &&  $request['employee_id'] != "0" && $request['employee_id'] != 0  )
            {
                $details->assign_all = '1';
            }
            else
            {
                
                $details->assign_all = '0';
            }


            $details->save();

            // Save Rating id from CPPQ id 

            if ( isset($request['cppq_id']) &&  !is_null($request['cppq_id'])  )
            {
                $cppq = CppqRatingMaster::where('id',$request['cppq_id'])->update(['ratings_id'=>$details->id]);
            }

            if(isset($request['skill_id']) && $request['skill_id'] != null)
                $details->skill_id = json_encode($request['skill_id']);
           
            $user_employee_id = DB::table('user_location')->join('users','users.id','=','user_location.user_id')->where('users.is_active',1)->where('user_location.location_id',$request['location_id'])->where('users.include_in_ratings',1)->pluck('user_location.user_id')->toArray();
            if  ( $request['employee_id'] != null && $request['employee_id'] != 0   )
            {
                $employee_rating = new RatingUser();
                $employee_rating->ratings_id = $details->id;
                $employee_rating->user_id = $request['employee_id'];
                $employee_rating->save();    

            }
            else
            {
                foreach ($user_employee_id as $user_employee_id_key => $user_employee_id_value) {

                    $employee_rating = new RatingUser();

                    $employee_rating->ratings_id    = $details->id;

                    $employee_rating->user_id       = $user_employee_id_value;

                    $employee_rating->save();   

                }                   
            }


            if (isset($request['employee_id']) && $request['employee_id'] != null) 
             //category distrubution
            $location = Location::where('id',$request['location_id'])->first();

            if ( isset($location->category_wise_skill) && isset($location->category_wise_skill) )
            {
                if ($location->category_wise_skill == 1 ||  $location->category_wise_skill == 1)
                {
                    //get category 
                    $category = Skills::whereIn('id',$request['skill_id'])->groupBy('categories_id')->pluck('categories_id')->toArray();
                    // get employees from category
                    $employee_id = EmployeeCategory::whereIn('category_id',$category)->pluck('user_id')->toArray();
                    $user_id = Location::getCachedUserIdsForLocations(array($request['location_id']));        
                    $combine_ids  = array_intersect($employee_id, $user_id);
                    $request['employee_id'] = array($request['employee_id']);
                    
                    $employee_raw_ids =  array_diff( $combine_ids , $request['employee_id'] );
                    
                    foreach ($employee_raw_ids as $user_key => $user_value) {
                         $employee_rating = new RatingUser();
                         $employee_rating->ratings_id = $details->id;
                         $employee_rating->user_id = $user_value;
                         $employee_rating->save();
                    }
                }
            }


            //Save Customer Detail
            $privacy_location = PrivacyLocation::pluck('location_id')->toArray();
            if (!in_array($details->location_id, $privacy_location))
            {
                
                if (!in_array($details->location_id, $privacy_location) || !empty($request['customer_name']) || !empty($request['customer_phone'])  || !empty($request['customer_email'])) {   
                    
                    $customer = new RatingCustomer();
                    $customer->ratings_id = $details->id;
                    $customer->name = ($request['customer_name'])?$request['customer_name']:'';
                    $customer->phone = ($request['customer_phone'])?$request['customer_phone']:'';
                    $customer->email = ($request['customer_email'])?$request['customer_email']:'';
                    $customer->save();
                } 

            }
            else
            {
                if (!empty($request['customer_name']) || !empty($request['customer_phone'])  || !empty($request['customer_email'])  && config('app.env') != "dev")
                {
                 $privacy_location = PrivacyLocation::where('location_id',$details->location_id)->first();
                // Send mail if location is in privacy
                 Mail::send(['html'=>'email.privacy_location'],['location_name'=>$location_name,'request'=>$request,'privacy_location'=>$privacy_location , 'skills' => $skills],function($message) use ($request ,$privacy_location , $skills){
                
                    $message->to($privacy_location['email'])->bcc('erol@servefirst.co.uk')->subject('Complaint Recieved');

                  //$message->to($user->email)->subject('Positive Rating');
                  $message->from('vstechnology2019@gmail.com','ServeFirst');
                });

                } 

            }

            //Save Skills
            if (isset( $request['skill_id']) &&  count($request['skill_id']) > 0) {  
                foreach ($request['skill_id'] as $skill_key => $skill_value) {
                    $ratings_skill = new RatingSkill();
                    $ratings_skill->ratings_id = $details->id;
                    $ratings_skill->skills_id = $skill_value;
                    $ratings_skill->save();
                }                
            }
            // auto mail on comlaint recieved 
            $check_location = Location::where('id',$request['location_id'])->first();
            
            // && config('app.env') != "dev"

            if ( isset($check_location->allow_complain_mails) && $check_location->allow_complain_mails == 1 && $details->is_negative == 1 && $details->is_standout == 1  && isset($customer))
            {
                $send_mail = 0; 
                // check phone number
                if ( isset($customer->phone)  && strlen($customer->phone) == 11 &&  substr($customer->phone,0, 2)== "07" )
                {
                    $send_mail = 1;  
                }
                // check email
                if ( isset($customer->email) && filter_var($customer->email, FILTER_VALIDATE_EMAIL))
                {
                    $send_mail = 1;  
                }
                if ($send_mail == 1)
                {
                    
                    // region manger will haev location_id "0" and location manager will be having same location_area_id as region manager 
                    $user_id      = UserLocation::where('location_area_id',$check_location->location_area_id)->where('location_id',0)->orWhere('location_id',$request['location_id'])->pluck('user_id')->toArray();
                    
                    //$managers = User::whereIn('id',$user_id)->where('type','!=',"employee")->where('allow_complain_mails',1)->get();   
                    $managers = User::whereIn('id',$user_id)->where('type','!=',"employee")->where('allow_complain_mails',1)->get();   
                  
                    foreach ($managers as $key => $value) {
    
                        $user = $value;
                            if ( $user->allow_email == 1  && config('app.env') != "dev")
                            {
                                Mail::send(['html'=>'email.complaint'],['location_name'=>$location_name,'location'=>$check_location ,'user' => $user, 'details' => $details , 'customer' => $customer , 'skills' => $skills ],function($message) use ($location , $details , $user , $customer, $value , $skills){
                                   
                                $message->to($value->email)->bcc('erol@servefirst.co.uk')->subject('Serve First - Complaint Recieved.');
                                //$message->to($value->email)->subject('Serve First - Complaint Recieved.');
                                $message->from('vstechnology2019@gmail.com','ServeFirst');
                                 });
                            }
    
                     } 
                }
                
            }  
                
            }

            
         
            $this->LogOutput(Response::json(array('status'=>200,'message' => "Details saved",'data' =>  $details)));
            return Response::json(array('status'=>200,'message' => "Details saved",'data' =>  $details));
        }
    }
}