<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;  
use App\Models\NotificationLog;
use App\Models\User;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;


    protected function push_notification($utoken,$message, $title, $flag, $receiverUserId,$senderUserId,$current_userid,$product_id,$bid_id = null) {

                $API_ACCESS_KEY = 'AAAAkCBhCBQ:APA91bH08xnPJEdTDN2DeN9RA2uztqgQ0xyKdPl_WMMCoCEzu3Zd30tBXmoe-6CINK6Vw_5DQ5VEl4Lo5y8nvqBVBzkGSkzmmm1WtPobyLxg0o0KcI-MZrP6ALJKLKUnmlPhKNjGNOdb';
                
                $headers = array
                (
                'Authorization: key=' . $API_ACCESS_KEY,
                'Content-Type: application/json'
                );

                $token = $utoken;

                

                $user_detail = User::find($receiverUserId);

                if($user_detail->notification_on == 1)
				{
					// $existing_notification = NotificationLog::where('user_id',$receiverUserId)
	            	// 										->where('fromUserId',$senderUserId)
	            	// 										->where('flag',$flag)
	            	// 										->first(); 
	            	// if($existing_notification){
	            	// 	$notificationLog = $existing_notification;
	            	// }else{ 


					if($flag == 14){
						$sound = 'message.mp3';
					}else{
						$sound = 'default';
					}

					$msg = array(
		                'alert' => $message,
		                'title' => $title,
		                'message' => $message,
		                'flag' => $flag,
		                'product_id' => $product_id,
		                'senderUserId' => $senderUserId,
		            );
		            
	            		$notificationLog = new NotificationLog;
		                $notificationLog->user_id = $receiverUserId;
		                $user = User::where('id',$senderUserId)->select('id','name','image')->first();
		                $notificationLog->fromUserId = $senderUserId;
		                $notificationLog->fromUserName = $user->name;
		                $notificationLog->fromUserPhoto = $user->profile;
		                $notificationLog->flag = $flag; 
		                $notificationLog->notification_read = 0; 
		                $notificationLog->title = $title;
		                $notificationLog->message = $message;
		                $notificationLog->notificationBody = json_encode($msg);
		                $notificationLog->product_id = json_encode($product_id);
		                $notificationLog->bid_id = $bid_id;
		                $notificationLog->save();

	            	//}

	                
	                $check_notification_read = NotificationLog::where('user_id',$receiverUserId)->where('notification_read','==',0)->count();



	                $notification = array(
	                'title' => $title,
	                'body' => $message,
	               // 'message_data' => $message_data,
	                'badge' => $check_notification_read,
	                'receiverUserId' => $receiverUserId,
	                'sound' => $sound,

	                );
	                \Log::info($notification);

	                 $fields = [
	                'to' => $token,
	                'priority' => 'high',
	                'notification' => $notification,
	                'sound' => $sound,
	            	'vibrate' => 1,
	            	'badge' => $check_notification_read,
	            	'data' => $msg
	            	];

	                $jsonDetails = json_encode($fields);
	                \Log::info("json details");
	                \Log::info($jsonDetails);
	                \Log::info("json details ends");
	                
	        		try {
		                $ch = curl_init();
		                curl_setopt($ch, CURLOPT_URL, 'https://fcm.googleapis.com/fcm/send');
		                curl_setopt($ch, CURLOPT_POST, true);
		                curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
		                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
		                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
		                $result = curl_exec($ch);
		                curl_close($ch);
		                $errMsg = '';
		                $res = (array) json_decode($result);

		                $errMsg = '';
		                  if (!empty($res)) {
		                        if ($res['failure'] == 1) {
		                $errMsg = $res['results'][0]->error;
		                //Session::flash('error', $errMsg);
		                                         }
		                                }

		                                \Log::info("res details");
			                \Log::info($res);
			                \Log::info("res details ends");
		                \Log::info($token);
		                \Log::info($fields);
		                \Log::info($res);
		                \Log::info(json_encode($msg));
		                 \Log::info($receiverUserId);
		                \Log::info(" -------- CRON ------");
		                /* foreach (json_decode($result) as $key => $value) {

		                if ($key == 'results') {

		                $errMsg = $value[0]->error;

		                }
		                } */
		                //return redirect('/admin/notification/');
	                    } 
	                    catch (Exception $e) 
	                    {

	                        Log::info("ERROR IN CACHE");
			                /* $res = $e->results[0]->error;
			                $r->session()->put('notification_err', $res);
			                return redirect('/admin/notification/');
			                Log::info($res);'message_id' 
			                /* dd($e);
			                print_r($e);
			                exit; */
			            }
				}
            	
		            
                

    } 
}
