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
use Mail;
use App\Location;
use Session;
use App\Skills;
use App\LocationAreaSkill;
use App\LocationArea;
use App\UserLocation;
use App\User;
use App\Ratings;
use App\RatingCustomer;
use App\RatingSkill;
use App\AbusiveWords;
use App\Categories;
use App\Settings;
use Carbon\Carbon;
use App\RatingUser;
use App\PrivacyLocation;
use App\EmployeeCategory;
use App\CustomMaster;
use App\CustomValues;
use App\CustomerAuditAnswers;
use App\CustomerAuditQuestion;
use App\CustomerAudit;
use App\GeneralFunction;
use App\AuditCategories;
use App\AuditSetQuestion;
use App\AuditQuestion;
use App\AuditQuestionOption;
use App\AuditAnswer;
use App\TagLocation;
use App\TagRegion;
use Crypt;
use Cookie;
use Auth;
use View;
use DB;
use Illuminate\Contracts\Encryption\DecryptException;
class CustomerAuditFrontController extends Controller
{ 
    public function __construct() {
        
        $image_time = Carbon::now()->addMinutes(5);
        View::share('image_time',$image_time);

    }


    public function index ( Request $request )  
    {

        $image_time = Carbon::now()->addMinutes(5);
        View::share('image_time',$image_time);

        $session = Session::all();
        $id = CustomerAudit::where('unique_id',$request->id)->first();
        $question_id    = AuditQuestion::where('audit_set_question_id',$id->audit_set_question_id)->count();
        $check_count    = AuditAnswer::where('customer_audit_id',$id->id)->count();
        Session::put('unique_id',$id->id);
        if ($id == null || ($check_count) > 0)
        {
           return view('customer_audit_link.expiry');   
        }

        // if  location 
        if($id->tag_id == 0 )
        {
            $location = Location::where('id',$id->location_id)->first();
            $company  = LocationArea::where('id',$location->location_area_id)->first();
            Session::put('location_id',$location->id);
            Session::put('location_name',$location->name);
            Session::put('company',$company);
            View::share('location_name',$location->name);
            View::share('company',$company);    
        }
        else
        {
            // if tag
            $location =  null;    
            $company_id  = TagRegion::where('tag_id',$id->tag_id)->first();
            $company   = LocationArea::where('id',$company_id->location_area_id)->first();
        }
        

        

        $check = AuditAnswer::where('customer_audit_id',$id->id)->count();
        if ($check > 0 )
        {
           return view('customer_audit_link.expiry');            
        }
        
        Session::put('question_set_id',$id->audit_set_question_id);
        
        if(!isset($request->page ))
        {
            $request->page = 0;    
        }
        $all_question = array();
        $per_page = 5 ; 
        $offset = $request->page * 5 ; 
        $questions_count_total = DB::table('audit_question')->where('audit_set_question_id',$id->audit_set_question_id)->count();
        $questions = DB::table('audit_question')->where('audit_set_question_id',$id->audit_set_question_id)->offset($offset)->limit($per_page)->orderBy('question_order')->get();
        
        foreach($questions as $question_key => $question_value)
        {
            $all_question[$question_key]['id']              =  $question_value->id;
            $all_question[$question_key]['question']        =  $question_value->question;
            $all_question[$question_key]['score']           =  $question_value->score; 
            $all_question[$question_key]['type']            =  $question_value->type; 
            $all_question[$question_key]['is_requried']     =  $question_value->is_requried; 
            $all_question[$question_key]['min_character']   =  (int)$question_value->min_character; 
            $all_question[$question_key]['option']          =  AuditQuestionOption::where('audit_question_id',$question_value->id)->get();
            
        }
        $nearest_location = null ; 
        
        if($id->tag_id != 0 )
        {
            // get ip 
            $ip  = !empty($_SERVER['HTTP_X_FORWARDED_FOR']) ? $_SERVER['HTTP_X_FORWARDED_FOR'] : $_SERVER['REMOTE_ADDR'];
            $data = \IPLocation::get($ip);
            // get lat long 
            $lat        = $data->latitude;
            $lng        = $data->longitude;

            $location_id = TagLocation::where('tag_id',$id->tag_id)->pluck('location_id')->toArray();
            $nearest_location = DB::table('location')->whereIn('id',$location_id)
                ->select('id','name','location_id','image','address_1' ,'address_2','zipcode','city' , 'latitude', 'longitude', DB::raw(sprintf(
                    '(6371 * acos(cos(radians(%1$.7f)) * cos(radians(latitude)) * cos(radians(longitude) - radians(%2$.7f)) + sin(radians(%1$.7f)) * sin(radians(latitude)))) AS distance',
                    $lat,
                    $lng
                )))
            ->having('distance', '<', 100000)
            ->orderBy('distance', 'asc')->where('is_active',1)
            ->get();
        }
        
        //dd($all_question);

        return view('customer_audit_link.index',compact('session','all_question','request','questions_count_total','nearest_location','company'));
    }

    //test save data 
    function submitTest ( Request $request ) 
    {

        $unique_id  = Session::get('unique_id');
        $customer_audit_id = CustomerAudit::where('id',$unique_id)->first();
        $company  = LocationArea::where('id',$customer_audit_id->location_area_id)->first();
        View::share('company',$company);
        $per_page = 5 ; 
        $max_score = 0;
        $last_page =  $request->page ; 
        $offset = ($request->page - 1) * 5 ; 
        $request->page =  $last_page ; 
         $questions = DB::table('audit_question')->where('audit_set_question_id',$customer_audit_id->audit_set_question_id)->offset($offset)->limit($per_page)->orderBy('question_order')->get();
        foreach ($questions as $questions_key => $questions_value) {
            $answer_id = "value_".$questions_value->id;
            $note_id   = "note_".$questions_value->id;
            $check  =  AuditAnswer::where('question_id',$questions_value->id)->where('customer_audit_id',$unique_id)->count();

            if ($check > 0 )
            {
                $check  =  AuditAnswer::where('question_id',$questions_value->id)->where('customer_audit_id',$unique_id)->forceDelete();                
            }


            if(isset($request->$answer_id)  )
            {
                if ($questions_value->type == "input"  || $questions_value->type == "radio" )
                {

                    //Session::get("image_")
                    dd(Session::get("image_".$questions_value->id));
                    $answers = new AuditAnswer();
                    $answers->question_id       = $questions_value->id;
                    $answers->answer            = $request->$answer_id;
                    $answers->note              = $request->$note_id; 
                    $answers->image             = Session::get("image_".$questions_value)    ;
                    if($questions_value->type == "input")
                    {
                        $score = $questions_value->score;
                    }
                    else
                    {
                        $score_answer = AuditQuestionOption::where('audit_question_id',$questions_value->id)->where('option_name',$request->$answer_id)->first();
                        $score  = $score_answer->score;
                    }
                    $answers->score = $score;     
                    $answers->customer_audit_id = $unique_id;     
                    $answers->save();
                    
                    Session::put($answer_id,$request->$answer_id);
                    Session::put($note_id,$request->$note_id);
                }

                if ($questions_value->type == "file")
                {
                    
                     // upload image
                        if(count($request->$answer_id) > 0 )
                        {
                             //upload image
                            $filename_array = array();
                            foreach ($request->$answer_id as $image_key_28 => $image_value) {
                                $extension =  $image_value->getClientOriginalExtension(); 
                                $rotation = 0;
                                $rand = rand(111111,999999);
                                $filename_array[] = $filename = $rand.time().".".$extension;
                                //$image_upload = $image_value->move(public_path('uploads/customer'), $filename);
                                $image_upload = GeneralFunction::imageUpload($image_value , $filename , ' ' , 'images/customer_audit/'.$unique_id.'/' , 1 , "string" ,$rotation , null , null );
                            }
                            $filename = implode(",", $filename_array);

                        }

                        $answers = new AuditAnswer();
                        $answers->question_id       = $questions_value->id;
                        $answers->answer            = $filename; 
                        $answers->note              = $request->$note_id; 

                        
                        $answers->score = $total_score;  
                        $answers->customer_audit_id = $unique_id;   
                        $answers->save();
                }

                if ($questions_value->type == "checkbox")
                {
                    if(count($request->$answer_id) > 0 )
                    {
                        $total_score = 0 ;
                        foreach($request->$answer_id as $count_score)
                        {
                            $score_answer = AuditQuestionOption::where('audit_question_id',$questions_value->id)->where('option_name',$count_score)->first();
                            $total_score = $total_score + $score_answer->score; 
                        }
                    }
                    $check_box_answer  =  implode(",",$request->$answer_id);

                    $answers = new AuditAnswer();
                    $answers->question_id       = $questions_value->id;
                    $answers->answer            = $check_box_answer; 
                    $answers->note              = $request->$note_id; 

                    
                    $answers->score = $total_score;  
                    $answers->customer_audit_id = $unique_id;   
                    $answers->save();
                    
                    Session::put($answer_id,$request->$answer_id);
                    Session::put($note_id,$request->$note_id);
                    
                }
                
            }
            
        }
        
        // new questions of submit 
        $session = Session::all();

        $all_question = array();
        $per_page = 5 ; 
        $offset = $request->page * 5 ; 
        $questions_count_total = DB::table('audit_question')->where('audit_set_question_id',$customer_audit_id->audit_set_question_id)->count();
        
        if ($offset >= $questions_count_total)
        {
            $audit_answer_socre =  AuditAnswer::where('customer_audit_id',$customer_audit_id->id)->get();
            foreach($audit_answer_socre as $score_total )
            {
                $max_score = $max_score + $score_total->score;
            }
            $update_score = CustomerAudit::where('id',$customer_audit_id->id)->update(['total_score' => $max_score , 'average_score' => number_format((100 * $max_score ) / $customer_audit_id->max_score ,2)]);

            return view('customer_audit_link.thank_you');
        }
        else
        {
             $questions = DB::table('audit_question')->where('audit_set_question_id',$customer_audit_id->audit_set_question_id)->offset($offset)->limit($per_page)->orderBy('question_order')->get();

            foreach($questions as $question_key => $question_value)
            {
                $all_question[$question_key]['id']          =  $question_value->id;
                $all_question[$question_key]['question']    =  $question_value->question;
                $all_question[$question_key]['score']       =  $question_value->score; 
                $all_question[$question_key]['type']        =  $question_value->type; 
                $all_question[$question_key]['is_requried']     =  $question_value->is_requried; 
                $all_question[$question_key]['min_character']   =  (int)$question_value->min_character; 
                $all_question[$question_key]['option']      =  AuditQuestionOption::where('audit_question_id',$question_value->id)->get();
                
            }
            //dd($all_question);
            $audit_answer_socre =  AuditAnswer::where('customer_audit_id',$customer_audit_id->id)->get();
            foreach($audit_answer_socre as $score_total )
            {
                $max_score = $max_score + $score_total->score;
            }
            $update_score = CustomerAudit::where('id',$customer_audit_id->id)->update(['total_score' => $max_score , 'average_score' => number_format((100 * $max_score ) / $customer_audit_id->max_score ,2)]);
            
            return view('customer_audit_link.new_page',compact('session','all_question','request','questions_count_total'));
        }
       
       
        
    }
 
    public function page_1 ( Request $request )
    {

        $session = Session::all();
        return view('customer_audit_link.page_1',compact('session'));
    }
    public function page_2 ( Request $request )
    {
        
        if (isset($request->value_1)) { Session::put('value_1',$request->value_1) ;} ;
        if (isset($request->value_2)) { Session::put('value_2',$request->value_2) ;} ;
        if (isset($request->value_3)) { Session::put('value_3',$request->value_3) ;} ;
        if (isset($request->value_4_1)) { Session::put('value_4_1',$request->value_4_1) ;} ;
        if (isset($request->value_4_2)) { Session::put('value_4_2',$request->value_4_2) ;} ;
        if (isset($request->value_4_3)) { Session::put('value_4_3',$request->value_4_3) ;} ;


        if (isset($request->score_1)) { Session::put('score_1',$request->score_1) ;} ;
        if (isset($request->score_2)) { Session::put('score_2',$request->score_2) ;} ;
        if (isset($request->score_3)) { Session::put('score_3',$request->score_3) ;} ;
        if (isset($request->score_4_1)) { Session::put('score_4_1',$request->score_4_1) ;} ;
        if (isset($request->score_4_2)) { Session::put('score_4_2',$request->score_4_2) ;} ;
        if (isset($request->score_4_3)) { Session::put('score_4_3',$request->score_4_3) ;} ;

        if (isset($request->notes_1)) { Session::put('notes_1',$request->notes_1) ;} ;
        if (isset($request->notes_2)) { Session::put('notes_2',$request->notes_2) ;} ;
        if (isset($request->notes_3)) { Session::put('notes_3',$request->notes_3) ;} ;
        if (isset($request->notes_4)) { Session::put('notes_4',$request->notes_4) ;} ;
       $session = Session::all();
        return view('customer_audit_link.page_2',compact('session'));
    }
    public function page_3 ( Request $request )
    {
        if (isset($request->value_5)) { Session::put('value_5',$request->value_5) ;} ;
        if (isset($request->value_6)) { Session::put('value_6',$request->value_6) ;} ;
        if (isset($request->value_7)) { Session::put('value_7',$request->value_7) ;} ;
        if (isset($request->value_8_1)) { Session::put('value_8_1',$request->value_8_1) ;} ;
        if (isset($request->value_8_2)) { Session::put('value_8_2',$request->value_8_2) ;} ;
        if (isset($request->value_8_3)) { Session::put('value_8_3',$request->value_8_3) ;} ;

        if (isset($request->score_5)) { Session::put('score_5',$request->score_5) ;} ;
        if (isset($request->score_6)) { Session::put('score_6',$request->score_6) ;} ;
        if (isset($request->score_7)) { Session::put('score_7',$request->score_7) ;} ;
        if (isset($request->score_8_1)) { Session::put('score_8_1',$request->score_8_1) ;} ;
        if (isset($request->score_8_2)) { Session::put('score_8_2',$request->score_8_2) ;} ;
        if (isset($request->score_8_3)) { Session::put('score_8_3',$request->score_8_3) ;} ;

        if (isset($request->notes_5)) { Session::put('notes_5',$request->notes_5) ;} ;
        if (isset($request->notes_6)) { Session::put('notes_6',$request->notes_6) ;} ;
        if (isset($request->notes_7)) { Session::put('notes_7',$request->notes_7) ;} ;
        if (isset($request->notes_8)) { Session::put('notes_8',$request->notes_8) ;} ;
        $session = Session::all();
        return view('customer_audit_link.page_3',compact('session'));
    }
    public function page_4 ( Request $request )
    {
        if (isset($request->value_9)) { Session::put('value_9',$request->value_9) ;} ;
        if (isset($request->value_10)) { Session::put('value_10',$request->value_10) ;} ;
        if (isset($request->value_11)) { Session::put('value_11',$request->value_11) ;} ;
        if (isset($request->value_12)) { Session::put('value_12',$request->value_12) ;} ;
        if (isset($request->value_13)) { Session::put('value_13',$request->value_13) ;} ;


        if (isset($request->score_9)) { Session::put('score_9',$request->score_9) ;} ;
        if (isset($request->score_10)) { Session::put('score_10',$request->score_10) ;} ;
        if (isset($request->score_11)) { Session::put('score_11',$request->score_11) ;} ;
        if (isset($request->score_12)) { Session::put('score_12',$request->score_12) ;} ;
        if (isset($request->score_13)) { Session::put('score_13',$request->score_13) ;} ;

        if (isset($request->notes_9)) { Session::put('notes_9',$request->notes_9) ;} ;
        if (isset($request->notes_10)) { Session::put('notes_10',$request->notes_10) ;} ;
        if (isset($request->notes_11)) { Session::put('notes_11',$request->notes_11) ;} ;
        if (isset($request->notes_12)) { Session::put('notes_12',$request->notes_12) ;} ;
        if (isset($request->notes_13)) { Session::put('notes_13',$request->notes_13) ;} ;
        
        $session = Session::all();
        return view('customer_audit_link.page_4',compact('session'));
    }
    public function page_5 ( Request $request )
    {   
        
        if (isset($request->value_14_1)) { Session::put('value_14_1',$request->value_14_1) ;} ;
        if (isset($request->value_14_2)) { Session::put('value_14_2',$request->value_14_2) ;} ;
        if (isset($request->value_14_3)) { Session::put('value_14_3',$request->value_14_3) ;} ;
        if (isset($request->value_14_4)) { Session::put('value_14_4',$request->value_14_4) ;} ;
        if (isset($request->value_14_5)) { Session::put('value_14_5',$request->value_14_5) ;} ;
        if (isset($request->value_15)) { Session::put('value_15',$request->value_15) ;} ;
        if (isset($request->value_16)) { Session::put('value_16',$request->value_16) ;} ;
        if (isset($request->value_17)) { Session::put('value_17',$request->value_17) ;} ;

        if (isset($request->score_14_1)) { Session::put('score_14_1',$request->score_14_1) ;} ;
        if (isset($request->score_14_2)) { Session::put('score_14_2',$request->score_14_2) ;} ;
        if (isset($request->score_14_3)) { Session::put('score_14_3',$request->score_14_3) ;} ;
        if (isset($request->score_14_4)) { Session::put('score_14_4',$request->score_14_4) ;} ;
        if (isset($request->score_14_5)) { Session::put('score_14_5',$request->score_14_5) ;} ;
        if (isset($request->score_15)) { Session::put('score_15',$request->score_15) ;} ;
        if (isset($request->score_16)) { Session::put('score_16',$request->score_16) ;} ;
        if (isset($request->score_17)) { Session::put('score_17',$request->score_17) ;} ;

        if (isset($request->notes_14)) { Session::put('notes_14',$request->notes_14) ;} ;
        if (isset($request->notes_15)) { Session::put('notes_15',$request->notes_15) ;} ;
        if (isset($request->notes_16)) { Session::put('notes_16',$request->notes_16) ;} ;
        if (isset($request->notes_17)) { Session::put('notes_17',$request->notes_17) ;} ;
        
        
        $session = Session::all();
        return view('customer_audit_link.page_5',compact('session'));
    }
    public function page_6 ( Request $request )
    {

        if (isset($request->value_18_1)) { Session::put('value_18_1',$request->value_18_1) ;} ;
        if (isset($request->value_18_2)) { Session::put('value_18_2',$request->value_18_2) ;} ;
        if (isset($request->value_18_3)) { Session::put('value_18_3',$request->value_18_3) ;} ;
        if (isset($request->value_18_4)) { Session::put('value_18_4',$request->value_18_4) ;} ;
        if (isset($request->value_18_5)) { Session::put('value_18_5',$request->value_18_5) ;} ;
        if (isset($request->value_19)) { Session::put('value_19',$request->value_19) ;} ;
        if (isset($request->value_20)) { Session::put('value_20',$request->value_20) ;} ;
        if (isset($request->value_21)) { Session::put('value_21',$request->value_21) ;} ;


        if (isset($request->score_18_1)) { Session::put('score_18_1',$request->score_18_1) ;} ;
        if (isset($request->score_18_2)) { Session::put('score_18_2',$request->score_18_2) ;} ;
        if (isset($request->score_18_3)) { Session::put('score_18_3',$request->score_18_3) ;} ;
        if (isset($request->score_18_4)) { Session::put('score_18_4',$request->score_18_4) ;} ;
        if (isset($request->score_18_5)) { Session::put('score_18_5',$request->score_18_5) ;} ;
        if (isset($request->score_19)) { Session::put('score_19',$request->score_19) ;} ;
        if (isset($request->score_20)) { Session::put('score_20',$request->score_20) ;} ;
        if (isset($request->score_21)) { Session::put('score_21',$request->score_21) ;} ;

        if (isset($request->notes_18)) { Session::put('notes_18',$request->notes_18) ;} ;
        if (isset($request->notes_19)) { Session::put('notes_19',$request->notes_19) ;} ;
        if (isset($request->notes_21)) { Session::put('notes_21',$request->notes_21) ;} ;
        

        // check if too show employee page or not 
        if ($request->value_21 == "Yes")
        {
            $location_id = Session::get('location_id');
            $user_id     = UserLocation::where('location_id',$location_id)->pluck('user_id')->toArray();
            $employee_data = User::where('type','employee')->whereIn('id',$user_id)->limit(8)->get();
            return view('customer_audit_link.page_employee',compact('employee_data'));       
        }
        else
        {
            $session = Session::all();
            return view('customer_audit_link.page_6',compact('session'));    
        }
        
    }

    public function page_6_employee (Request $request )
    {
        $session = Session::all();
        if($request->employee_id)
        {
            Session::put('employee_id',$request->employee_id);  
            Session::put('value_21',"yes**".$request->employee_id);  
        }
        
        return view('customer_audit_link.page_6',compact('session')); 
    }

    public function submit (Request $request) 
    {
      
        if (isset($request->value_22)) { Session::put('value_22',$request->value_22) ;} ;
        if (isset($request->value_23)) { Session::put('value_23',$request->value_23) ;} ;
        if (isset($request->value_24)) { Session::put('value_24',$request->value_24) ;} ;
        if (isset($request->value_25)) { Session::put('value_25',$request->value_25) ;} ;

        if (isset($request->notes_23)) { Session::put('notes_23',$request->notes_23) ;} ;
        if (isset($request->notes_24)) { Session::put('notes_24',$request->notes_24) ;} ;
        if (isset($request->notes_25)) { Session::put('notes_25',$request->notes_25) ;} ;
        $session    = Session::all();
        
        $unique_id  = $session['unique_id'];
        // upload image
        if ( isset($request->value_26) && count($request->value_26) > 0 )
        {
             //upload image
            $filename_array = array();
            foreach ($request->value_26 as $image_key_26 => $image_value_26) {
                $extension =  $image_value_26->getClientOriginalExtension(); 
                $rotation = 0;
                $rand = rand(111111,999999);
                $filename_array[] = $filename = $rand.time().".".$extension;
                //$image_upload = $image_value_26->move(public_path('uploads/customer'), $filename);
                $image_upload = GeneralFunction::imageUpload($image_value_26 , $filename , ' ' , 'images/customer_audit/'.$unique_id.'/' , 1 , "string" ,$rotation , null , null );
            }
            $filename_26 = implode(",", $filename_array);
            
        }
       
        else
        {
            $filename_26 = null;
        }

        // upload image
        if ( isset($request->value_27) && count($request->value_27) > 0 )
        {
             //upload image
            $filename_array = array();
            foreach ($request->value_27 as $image_key_27 => $image_value_27) {
                $extension =  $image_value_27->getClientOriginalExtension(); 
                $rotation = 0;
                $rand = rand(111111,999999);
                $filename_array[] = $filename = $rand.time().".".$extension;
                //$image_upload = $image_value_27->move(public_path('uploads/customer'), $filename);
                $image_upload = GeneralFunction::imageUpload($image_value_27, $filename , ' ' , 'images/customer_audit/'.$unique_id.'/' , 1 , "string" ,$rotation , null , null );
            }
            $filename_27 = implode(",", $filename_array);
            
        }
       
        else
        {
            $filename_27 = null;
        }

        // upload image
        if ( isset($request->value_28) && count($request->value_28) > 0 )
        {
             //upload image
            $filename_array = array();
            foreach ($request->value_28 as $image_key_28 => $image_value_28) {
                $extension =  $image_value_28->getClientOriginalExtension(); 
                $rotation = 0;
                $rand = rand(111111,999999);
                $filename_array[] = $filename = $rand.time().".".$extension;
                //$image_upload = $image_value_28->move(public_path('uploads/customer'), $filename);
                $image_upload = GeneralFunction::imageUpload($image_value_28 , $filename , ' ' , 'images/customer_audit/'.$unique_id.'/' , 1 , "string" ,$rotation , null , null );
            }
            $filename_28 = implode(",", $filename_array);
            
        }
       
        else
        {
            $filename_28 = null;
        }
        Session::put('value_26',$filename_26) ;
        Session::put('value_27',$filename_27) ;
        Session::put('value_28',$filename_28) ;
        $answer_array = array('1' => "value_1" , '2' => "value_2" , '3' => "value_3" , '5' => "value_4_1" , '6' => "value_4_2" , '7' => "value_4_3" , '8' => "value_5" , '9' => "value_6" , '10' => "value_7", '12' => "value_8_1" , '13' => "value_8_2" , '14' => "value_8_3" , '15' => "value_9" , '16' => "value_10" , '17' => "value_11" , '18' => "value_12" , '19' => "value_13" , '21' => "value_14_1", '22' => "value_14_2", '23' => "value_14_3", '24' => "value_14_4", '25' => "value_14_5" , '26' => "value_15", '27' => "value_16" , '28' => "value_17" ,'30' => "value_18_1" ,'31' => "value_18_2" , '32' => "value_18_3" , '33' => "value_18_4" ,'34' => "value_18_5" , '35' => "value_19" , '36' => "value_20" , '37' => "value_21" , '38' => "value_22" , '39' => "value_23" , '40' => "value_24" , '41' => "value_25", '42' => "value_26" , '43' => "value_27" , '44' => "value_28");

        $score_array = array('1' => "score_1" , '2' => "score_2" , '3' => "score_3" , '5' => "score_4_1" , '6' => "score_4_2" , '7' => "score_4_3" , '8' => "score_5" , '9' => "score_6" , '10' => "score_7", '12' => "score_8_1" , '13' => "score_8_2" , '14' => "score_8_3" , '15' => "score_9" , '16' => "score_10" , '17' => "score_11" , '18' => "score_12" , '19' => "score_13" , '21' => "score_14_1", '22' => "score_14_2", '23' => "score_14_3", '24' => "score_14_4", '25' => "score_14_5" , '26' => "score_15", '27' => "score_16" , '28' => "score_17" ,'30' => "score_18_1" ,'31' => "score_18_2" , '32' => "score_18_3" , '33' => "score_18_4" ,'34' => "score_18_5" , '35' => "score_19" , '36' => "score_20" , '37' => "score_21" , '38' => "score_22" , '39' => "score_23" , '40' => "score_24" , '41' => "score_25" ,'42' => null ,  '43' => null ,  '44' => null);

        $max_score_array = array('1' => "10" , '2' => "2" , '3' => "2" , '5' => "2" , '6' => "2" , '7' => "2" , '8' => "5" , '9' => "3" , '10' => "3", '12' => "2" , '13' => "2" , '14' => "2" , '15' => "3" , '16' => "3" , '17' => "3" , '18' => "3" , '19' => "4" , '21' => "2", '22' => "2", '23' => "2", '24' => "2", '25' => "2" , '26' => "2", '27' => "6" , '28' => "2" ,'30' => "4" ,'31' => "4" , '32' => "4" , '33' => "4" ,'34' => "4" , '35' => "6" , '36' => "0" , '37' => "0" , '38' => "0" , '39' => "0" , '40' => "0" , '41' => "0" ,'42' => "0" ,  '43' => "0" ,  '44' => "0");


        $notes_array = array('1' => "notes_1" , '2' => "notes_2" , '3' => "notes_3" , '5' => "notes_4" , '6' => "" , '7' => "" , '8' => "notes_5" , '9' => "notes_6" , '10' => "notes_7", '12' => "notes_8" , '13' => "" , '14' => "" , '15' => "notes_9" , '16' => "notes_10" , '17' => "notes_11" , '18' => "notes_12" , '19' => "notes_13" , '21' => "notes_14", '22' => "", '23' => "", '24' => "", '25' => "" , '26' => "notes_15", '27' => "notes_16" , '28' => "notes_17" ,'30' => "notes_18" ,'31' => "" , '32' => "" , '33' => "" ,'34' => "" , '35' => "notes_19" , '36' => "" , '37' => "notes_21" , '38' => "" , '39' => "notes_23" , '40' => "notes_24" , '41' => "notes_25" ,'42' => null ,  '43' => null ,  '44' => null );
        // question _id in array 
        $question_id = array_keys($answer_array) ; 
        
        $session    = Session::all();
        
        $unique_id  = $session['unique_id'];
        
        // For storing total score
        $total_score =  $max_score = 0 ; 

        // adding data 
        foreach ($answer_array as $answer_array_key => $answer_value) {
            
            if (isset($session[$answer_value]) )
            {
                if(isset($session[$score_array[$answer_array_key]])) 
                {
                    if($session[$score_array[$answer_array_key]] == "-")
                    {
                        $score = null ; 
                    }
                    else
                    {
                        $score          = $session[$score_array[$answer_array_key]] ;
                        $max            = $max_score_array[$answer_array_key] ;
                        $total_score    = $total_score  + $session[$score_array[$answer_array_key]] ;   
                        $max_score      = $max_score + $max_score_array[$answer_array_key]  ; 
                    }
                    
                }
                else
                {
                    $score = null ; 
                }

                if(isset($session[$notes_array[$answer_array_key]])) 
                {
                    $notes          = $session[$notes_array[$answer_array_key]] ;
                    
                }
                else
                {
                    $notes = null ; 
                }
                $answer = new CustomerAuditAnswers();
                $answer->customer_audit_id  = $unique_id ;
                $answer->question_id        = $answer_array_key;
                $answer->answer             = $session[$answer_value];
                $answer->score              = $score  ;
                $answer->notes              = $notes  ;
                $answer->save(); 
            }
            
        }

        $update_score = CustomerAudit::where('id',$unique_id)->update(['total_score' => $total_score , 'max_score' => $max_score, 'average_score' => number_format((100 * $total_score ) / $max_score ,2)]);
        Session::flush();
        return view('customer_audit_link.thank_you');
    }
   

    // select location 
    public function selectLocation ( Request $request  )
    {   

        $unique_id = Session::get('unique_id');
        $customer_audit_id = CustomerAudit::where('id',$unique_id)->update(['location_id'=>$request->location_id, 'tag_id'=>0]);
        $customer_audit = CustomerAudit::where('id',$unique_id)->first();
        return $customer_audit->unique_id;
    }

    public function storeImages ( Request $request )
    {
        $file = $request->file() ; 

        $question_id = array_keys($file)[0];

         // upload image
        if ( isset($request->$question_id) && count($request->$question_id) > 0 )
        {
             //upload image
            $filename_array = array();
            foreach ($request->$question_id as $image_key => $image_value) {
                $extension =  $image_value->getClientOriginalExtension(); 
                $rotation = 0;
                $rand = rand(111111,999999);
                $filename_array[] = $filename = $rand.time().".".$extension;
                //$image_upload = $image_value->move(public_path('uploads/customer'), $filename);
                $image_upload = GeneralFunction::imageUpload($image_value , $filename , ' ' , 'images/customer_audit/temp/' , 1 , "string" ,$rotation , null , null );
            }
            $image_name = implode(",", $filename_array);
            
        }
       
        else
        {
            $image_name = null;
        }

        Session::put('image_'.$question_id,$image_name) ;
        
    }
}

