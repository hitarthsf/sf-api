<style type="text/css">
   .copy-button-edit-location
   {
      padding: 5px;
      border-radius: 20px;
   }
   .hide{display: none !important;}
</style>
<script type="text/javascript" src="{{url('adminlayout\js\admin\location.js')}}"></script> 

<div class="col-md-6 float-right">
   <div class="col-md-12">
   <h5>Links and Codes</h5>
   <hr>
   </div>
   @php $encryptedLocation = Crypt::encryptString($location->location_id); $link = url('/')."/front/login?locationId=".$encryptedLocation ;
   $register_link = url('/')."/register?locationId=".$encryptedLocation ;
   @endphp
   <input type="hidden" name="location_id" id="location-id" value="{{$location->id}}" >
   <div class="float-left">
      <img src="{{isset( $location->id ) && $location->id != null ? Storage::disk('s3')->temporaryUrl('images/qrcode/'.$location->id.'.png'  , $image_time): ''}}" />
      <br>
      <a href="{{route('download-qr-code',$location->id)}}" target="_blank" download="" style="position: relative;z-index: 1;">  
      <span class="btn btn-primary margin-left-15 "> Download Qr Code</span>
      </a>
      <br>
      <div style="margin-top: 10px;margin-left: 16px; position: relative;z-index: 1;">
         <span data-toggle="tooltip" data-placement="top" title="Copy Auto Login Link" class="copy-btn" data-type="attribute" data-attr-name="data-clipboard-text" data-model="couponCode" data-clipboard-text="{{$link}}"><a href="javascript:void(0);" class="btn btn-primary">Copy Location Link</a></span>
      </div>
      <div style="margin-top: 10px;margin-left: 16px; position: relative;z-index: 1;">
         <span data-toggle="tooltip" data-placement="top" title="Copy Auto Login Link" class="copy-btn-register" data-type="attribute" data-attr-name="data-clipboard-text" data-model="couponCode" data-clipboard-text="{{$register_link}}"><a href="javascript:void(0);"class="btn btn-primary"> Copy Register Link</a></span>
      </div>
      <div style="margin-top: 10px;margin-left: 16px;position: relative;z-index: 1;margin-bottom: 15px;">
         <span><a href="#edit-popup" class="btn btn-primary" data-toggle="modal"> Setting</a></span>
      </div>
      <div class="modal" id="edit-popup" tabindex="-1" role="dialog">
         <div class="modal-dialog" role="document">
            <div class="modal-content">
               <div class="modal-header">
                  <h4 class="modal-title">Settings</h4>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                  </button>
               </div>
               <div class="modal-body">
                  <input type="checkbox" onchange="updateLink();" name="no_employee" id="no_employee" value="no_employee"> &nbsp; <label>Skip Employee Page </label> 
                  <br>
                  <input onchange="employeeDropdown(); updateLink();"  id="default_employee" type="checkbox" name="default_employee" value="default_employee">&nbsp; 
                  <label>Default Employee </label> 
                  <br>
                  <select class="form-control employee_dropdown" onchange="updateLink();" style="display: none">
                  </select>
                  <br>
                  <div class="row">
                     <div class="col-md-9"> 
                        <input type="textarea" class="form-control" name="url" id="setting-url" value="{{$link}}">
                     </div>
                     <div class="col-md-3"> 
                        <span data-toggle="tooltip" data-placement="top" title="Copy Auto Login Link" class="copy-btn-setting" data-type="attribute" data-attr-name="data-clipboard-text" data-model="couponCode" data-clipboard-text="{{$link}}"><a style="padding: 8px;" href="javascript:void(0);" class="btn btn-primary">Copy URL</a></span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</div>
<div class="col-md-6 float-left">
   <div class="col-md-12">
   <h5>Basic Informatoin</h5>
   <hr>
   </div>
<div class="col-md-12">
   <div class="form-group">
      <label>Name <span class="help-block">*</span></label>
      {!! Form::text('name', $location['name'], ['class' => 'form-control']) !!}
      @if ($errors->has('name'))
      <span class="help-block">
      <strong>{{ $errors->first('name') }}</strong>
      </span>
      @endif
   </div>
</div>
@if( Auth::user()->type == "super_admin" )
<div class="col-md-12">
   <div class="form-group">
      <label>Location Area<span class="help-block">*</span></label>
      {!! Form::select('location_area_id', $area,$location['location_area_id'], ['class' => 'form-control area' , 'onchange'=>'changeLocation();' ]) !!}
      
      @if ($errors->has('location_area_id'))
      <span class="help-block">
      <strong>{{ $errors->first('location_area_id') }}</strong>
      </span>
      @endif
   </div>
</div>
@endif
<div class="col-md-12">
   <div class="form-group">
      <label>Location ID <span class="help-block">*</span></label>
      {!! Form::text('location_id', $location['location_id'], ['class' => 'form-control']) !!}
      @if ($errors->has('location_id'))
      <span class="help-block">
      <strong>{{ $errors->first('location_id') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
       <label>Skills  <span class="help-block error-skills @if(!$location['use_location_skills']) hide @endif">*</span></label><br>
      <select class="ui fluid search dropdown skills" multiple="" name="skills[]" id="skills">
         @foreach($skills as $value)
         <option value="{{$value->id}}" <?php if(in_array($value->id, $selectedSkills)) echo 'selected'?> >{{$value->name}}</option>
         <!--  -->
         @endforeach
      </select>
      @if ($errors->has('skills'))
      <span class="help-block">
      <strong>{{ $errors->first('skills') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Customer Location ID </label>
      {!! Form::text('customer_location_id', $location['customer_location_id'], ['class' => 'form-control']) !!}
      @if ($errors->has('customer_location_id'))
      <span class="help-block">
      <strong>{{ $errors->first('customer_location_id') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Address Line 1 <span class="help-block"></span></label>
      {!! Form::text('address_1', $location['address_1'], ['class' => 'form-control']) !!}
      @if ($errors->has('address_1'))
      <span class="help-block">
      <strong>{{ $errors->first('address_1') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Address Line 2 </label>
      {!! Form::text('address_2',$location['address_2'], ['class' => 'form-control']) !!}
      @if ($errors->has('address_2'))
      <span class="help-block">
      <strong>{{ $errors->first('address_2') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Country <span class="help-block">*</span></label>
      {!! Form::select('country', $country, $location['country'], ['class' => 'country form-control' ,'id' => 'country' ]) !!}
      @if ($errors->has('country'))
      <span class="help-block">
      <strong>{{ $errors->first('country') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>State  <span class="help-block"></span></label>
      {!! Form::select('state', $state, $location->state['id'], ['class' => 'country form-control' ,'id' => 'country' ]) !!}
      @if ($errors->has('state'))
      <span class="help-block">
      <strong>{{ $errors->first('state') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>City <span class="help-block"></span></label>
      {!! Form::text('city',$location['city'], ['class' => 'form-control']) !!}
      @if ($errors->has('city'))
      <span class="help-block">
      <strong>{{ $errors->first('city') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Postal Code <span class="help-block"></span></label>
      {!! Form::text('zipcode',$location['zipcode'], ['class' => 'form-control']) !!}
      @if ($errors->has('zipcode'))
      <span class="help-block">
      <strong>{{ $errors->first('zipcode') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Email <span class="help-block"></span></label>
      {!! Form::email('email',$location['email'], ['class' => 'form-control']) !!}
      @if ($errors->has('email'))
      <span class="help-block">
      <strong>{{ $errors->first('email') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Contact No. <span class="help-block"></span></label>
      {!! Form::text('contract_no',$location['contract_no'], ['class' => 'form-control']) !!}
      <strong>Please enter contact number without country code </strong>
      @if ($errors->has('contract_no'))
      <span class="help-block">
      <strong>{{ $errors->first('contract_no') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Lattitude<span class="help-block"></span></label>
      {!! Form::text('latitude',$location['latitude'], ['class' => 'form-control']) !!}
      @if ($errors->has('latitude'))
      <span class="help-block">
      <strong>{{ $errors->first('latitude') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Longitude<span class="help-block"></span></label>
      {!! Form::text('longitude',$location['longitude'], ['class' => 'form-control']) !!}
      @if ($errors->has('longitude'))
      <span class="help-block">
      <strong>{{ $errors->first('longitude') }}</strong>
      </span>
      @endif
   </div>
</div>

<div class="col-md-12">

   <div class="form-group">
      <label>Description</label>
      {!! Form::textarea('description',$location['description'], ['class' => 'form-control']) !!}
      @if ($errors->has('description'))
      <span class="help-block">
      <strong>{{ $errors->first('description') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Tags <span class="help-block">*</span></label><br>
      <select class="ui fluid search dropdown location" multiple="" name="tag[]" id="location">
         @foreach($tags as $tag)
         <option value="{{$tag['id']}}" <?php if(isset($tag_location_id) &&
            in_array($tag->id, $tag_location_id)) echo 'selected'?> >{{$tag['name']}}</option>
         @endforeach
      </select>
      @if ($errors->has('tag'))
      <span class="help-block">
      <strong>{{ $errors->first('tag') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Open Time </label>
      <br>
      <div class='input-group date' id='datetimepicker3'>
         <input type='text' class="form-control" name="open_time" @if($location->open_time) value="{{Carbon\Carbon::parse($location->open_time)->format('g:i:A')}}" @endif>
         <span class="input-group-addon ">
         <span class="icofont icofont-ui-calendar"></span>
         </span>
      </div>
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Close Time </label>
      <br>
      <div class='input-group date' id='datetimepickeronlytime'>
         <input type='text' class="form-control" name="close_time" @if($location->close_time) value="{{Carbon\Carbon::parse($location->close_time)->format('g:i:A')}}" @endif>
         <span class="input-group-addon ">
         <span class="icofont icofont-ui-calendar"></span>
         </span>
      </div>
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Logo </label>
      <br>
      {!! Form::file('image', ['class' => 'form-control','onchange' => "showimagepreview(this)"]) !!}
      <input type="hidden" name="rotation" id="rotation" value="0"/>
      @if ($errors->has('image'))
      <span class="help-block">
      <strong>{{ $errors->first('image') }}</strong>
      </span>
      @endif
      <div class="col-sm-4">
         <div>
            <img id="imgprvw" src="{{isset( $location->image ) && $location->image != null ? Storage::disk('s3')->temporaryUrl('images/location/'.$location->image  , $image_time): ''}}" />
            <a id="rright" class="btn btn-primary" href="javascript:void(0);"><i class="fa fa-rotate-left float-right-side arrow mr-0"></i></a>
            <a id="rleft" class="btn btn-primary" href="javascript:void(0);"><i class="fa fa-rotate-right float-left-side arrow mr-0"></i></a>
         </div>
      </div>
   </div>
</div>
</div>
<br>
@if (Auth::user()->type == "super_admin")
<div class="col-md-6 float-right">
   <div class="col-md-12">
   <h5>Financial Information</h5>
   <hr>
   </div>
   <div class="col-md-12">
   <div class="form-group">
      <label>Invoice Tag <span class="help-block"></span></label>
      {!! Form::select('invoice_tag_id', $invoice_tag,$location['invoice_tag_id'], ['class' => ' form-control' , 'placeholder' => ' Please Select']) !!}
      @if ($errors->has('state'))
      <span class="help-block">
      <strong>{{ $errors->first('state') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Number of tablets</label>
      {!! Form::text('num_tablets',$location['num_tablets'], ['class' => 'form-control']) !!}
      @if ($errors->has('num_tablets'))
      <span class="help-block">
      <strong>{{ $errors->first('num_tablets') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Hardware Cost</label>
      {!! Form::text('hardware_cost',$location['hardware_cost'], ['class' => 'form-control']) !!}
      @if ($errors->has('hardware_cost'))
      <span class="help-block">
      <strong>{{ $errors->first('hardware_cost') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Software Cost</label>
      {!! Form::text('software_cost',$location['software_cost'], ['class' => 'form-control']) !!}
      @if ($errors->has('software_cost'))
      <span class="help-block">
      <strong>{{ $errors->first('software_cost') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Start Date</label>
      
      <input type="date" name="start_date" value="{{$location['start_date']}}" class="form-control" >
      
   </div>
</div>

<!-- 
<div class="col-md-12">
   <div class="form-group">
      <label>Billing Start Date</label>
      <input type="date" name="billing_start_date" value="{{$location['billing_start_date']}}" class="form-control" min="<?php echo date("Y-m-d"); ?>">
     
      
   </div>
</div>


<div class="col-md-12">
   <div class="form-group">
      <label>Billing Frequency</label>
      <select class="form-control" name="billing_frequency">
        <option @if(isset($location['billing_frequency']) && $location['billing_frequency']==1) selected="selected" @endif value="1">Monthly</option>
        <option @if(isset($location['billing_frequency']) && $location['billing_frequency']==3) selected="selected" @endif value="3">Quarterly</option>
        <option @if(isset($location['billing_frequency']) && $location['billing_frequency']==6) selected="selected" @endif value="6">6 Months</option>
        <option @if(isset($location['billing_frequency']) && $location['billing_frequency']==12) selected="selected" @endif value="12">Yearly</option>
      </select>
   </div>
</div>
 -->
<div class="col-md-12">
   <div class="form-group">
      <label>Installation Cost</label>
      {!! Form::text('installation_cost', $location['installation_cost'] , ['class' => 'form-control']) !!}
   </div>
</div>
</div>
@endif
<div class="col-md-6 float-right">
    <div class="col-md-12"> 
    <h5> Application Setting</h5>
    <hr>
  </div>
    <div class="col-md-12">
   <div class="form-group">
      <label>Password</label>
      <input type="text" name="password" class="form-control"  value="{{$location['password']}}">
      
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Application Color</label>
      <input type="text" name="app_color" id="saturation-demo" class="form-control demo" data-control="saturation" value="{{$location['app_color']}}">
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Maximum Budget For Customer Audit</label>
      <input type="text" name="max_budget_customer_audit" class="form-control" value="{{$location['max_budget_customer_audit']}}">
      
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Show Location Manager </label>
      <select name="hide">
         <option value="on" <?php echo ($location['is_show_location'] == 1 )?"selected":'';?>>Show</option>
         <option value="off" <?php echo ($location['is_show_location'] == 0 )?"selected":'';?>>Hide</option>
      </select>
      <!-- <input type="checkbox" name="hide" class="hide" />  -->
      @if ($errors->has('hide'))
      <span class="help-block">
      <strong>{{ $errors->first('hide') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Auto-EMail On Complaint Received </label>
      <select name="auto_email">
         <option value="on" <?php echo ($location['allow_complain_mails'] == 1 )?"selected":'';?>>Yes</option>
         <option value="off" <?php echo ($location['allow_complain_mails'] == 0 )?"selected":'';?>>No</option>
      </select>
      @if ($errors->has('auto_email'))
      <span class="help-block">
      <strong>{{ $errors->first('auto_email') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <label>Use Location Skills  </label>
      <select name="use_location_skills" id="use_skills">
      <option @if ($location['use_location_skills'] == 1 ) selected @endif value="1">Yes</option>
      <option @if ($location['use_location_skills'] == 0 ) selected @endif  value="0">No</option>
      </select>
      @if ($errors->has('auto_email'))
      <span class="help-block">
      <strong>{{ $errors->first('auto_email') }}</strong>
      </span>
      @endif
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <div class="custom-control custom-switch toggle-switch ml-0 pl-0">
         <input type="checkbox" id="switch1" class="checkbox"  name="category_wise_skill" @if ($location['category_wise_skill'] == 1 ) checked="checked" @endif /> 
         <label for="switch1" class=" toggle">
            <!-- <p>OFF    ON</p>  -->
         </label>
         <label class="mb-0 ml-2">Show Category-Wise Skills</label>
      </div>
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <div class="custom-control custom-switch toggle-switch ml-0 pl-0">
         <input type="checkbox" id="switch2" class="checkbox"  name="show_qr_code" @if ($location['show_qr_code'] == 1 ) checked="checked" @endif /> 
         <label for="switch2" class=" toggle">
            <!-- <p>OFF    ON</p>  -->
         </label>
         <label class="mb-0 ml-2">Show QR-Code in app</label>
      </div>
   </div>
</div>
<div class="col-md-12">
   <div class="form-group">
      <div class="custom-control custom-switch toggle-switch ml-0 pl-0">
         <input type="checkbox" id="switch3" class="checkbox"  name="allow_frequent_ratings" @if ($location['allow_frequent_ratings'] == 1 ) checked="checked" @endif /> 
         <label for="switch3" class=" toggle">
            <!-- <p>OFF    ON</p>  -->
         </label>
         <label class="mb-0 ml-2">Allow Frequent Ratings</label>
      </div>
   </div>
</div>
<div class="col-md-12">
<div class="form-group">
  <div class="custom-control custom-switch toggle-switch ml-0 pl-0">
   <input type="checkbox" id="switch5" class="checkbox"  name="hide_team" @if ($location['hide_team'] == 1 ) checked="checked" @endif  /> 
        <label for="switch5" class=" toggle"> 
            <!-- <p>OFF    ON</p>  -->
        </label> 
        <label class="mb-0 ml-2"> Show Team</label>
    
  </div>
</div>
</div>




<div class="col-md-12">
<div class="form-group">
  <div class="custom-control custom-switch toggle-switch ml-0 pl-0">
   <input type="checkbox" id="switch4" class="checkbox"  name="is_multilocation_key" onchange="showLocation();" @if ($location['is_multilocation'] == 1 ) checked="checked" @endif  /> 
        <label for="switch4" class=" toggle"> 
            <!-- <p>OFF    ON</p>  -->
        </label> 
        <label class="mb-0 ml-2">Is Multi-Location</label>
    <input type="hidden" name="is_multilocation" @if ($location['is_multilocation'] == 1 ) value="1" @else value="0" @endif   id="is_multilocation" > 
  </div>
</div>
</div>
<div class="col-md-12">
<div class="form-group">
  <div class="custom-control custom-switch toggle-switch ml-0 pl-0">
   <input type="checkbox" id="switch6" class="checkbox"  name="show_customer_audit" @if ($location['show_customer_audit'] == 1 ) checked="checked" @endif /> 
        <label for="switch6" class=" toggle"> 
            <!-- <p>OFF    ON</p>  -->
        </label> 
        <label class="mb-0 ml-2"> Customer Audit</label>
    
  </div>
</div>
</div>



<div class="col-md-12 @if ($location['is_multilocation'] == 0 ) hide @endif location-selection">
<div class="form-group">
  <label>Location </label>
    <div class="locationDiv"></div>
    <div class="locationEditDiv">
       <select class="ui fluid search dropdown location"  multiple="" name="location[]" id="area-location">
         @if(isset($all_location) && count($all_location) > 0 )
         @foreach($all_location as $all_location_key => $all_location_value)
         <option @if(isset($selected_location) && in_array($all_location_value['id'],$selected_location)  ) selected="selected" @endif  value="{{$all_location_value->id}}"> {{$all_location_value->name}}</option>
         @endforeach 
         @endif
       </select>
    </div>
</div>
</div>

   
   <div class="col-md-12 ">
<div class="form-group">
  <label>Profile Question </label>
    <div class="categoryDiv"></div>
    <div class="categoryEditDiv">
       <select class="ui fluid search dropdown category" multiple="" name="category[]" id="category">
         @foreach($category as $cat )
         <option @if(in_array($cat['id'],$selected_category ) ) selected="selected" @endif value="{{$cat->id}}">{{$cat->name}}</option>
         @endforeach
       </select>
    </div>

</div>
</div>

<div class="col-md-6">
  <label>Language</label>
  <select name="language" class="form-control"> 
      <option value="english" @if($location['app_default_language'] == "english") selected="selected" @endif>English</option>
      <option value="wales" @if($location['app_default_language'] == "wales") selected="selected" @endif>Wales</option> 
  </select>
</div>
<br>

<div class="col-md-12">
   <div class="form-group">
      <label>App Background Image </label>
      <br>
      {!! Form::file('app_backgroud_image', ['class' => 'form-control','onchange' => "showbackgroundimagepreview(this)"]) !!} 
      @if ($errors->has('app_backgroud_image'))
      <span class="help-block">
      <strong>{{ $errors->first('app_backgroud_image') }}</strong>
      </span>
      @endif 

      <div class="col-sm-4 px-0 mt-2">
         <div>
            <img id="backgroundimgprvw" src="{{isset( $location->app_backgroud_image ) && $location->app_backgroud_image != null ? Storage::disk('s3')->temporaryUrl('images/user/'.$location->app_backgroud_image  , $image_time): ''}}"  style="width:100%;" /> 
         </div>
      </div>
   </div>
</div>
<br>

<div class="col-md-12">
<div class="form-group">
   <label>RFD Url</label>
   <br>
 <div class="row justify-content-center text-center col-md-12">

      @for ( $i = 1 ; $i < 6 ; $i++  )
      <div class="col-md-2 col-sm-12">
         <a href=""><img src="{{url('/front/images/ratings')}}/{{$i}}.png" alt="" width="48" height="48"></a>
         @php $url = url('/').$i; @endphp
         <h5 class="font-weight-bold mt-3 mb-0" id="rating-" data-count=""></h5>


        <!--  <p class="m-0"><a href="javascript:void(0);" data-clipboard-text="{{url('/')}}/front/login?locationId={{$location->id}}&source=rfid&ratings={{$i}}" class="btn btn-primary copy-button-edit-location"><i class="fa fa-copy"></i></a></p> -->


         @php $link_rating  = url('/') ."/front/login?locationId=".$location->id."&ratings=".$i."&source=rfd";  
         $result_link = str_replace("https://","",$link_rating);
         @endphp
         <p class="m-0"><a href="javascript:void(0);" data-clipboard-text="{{$result_link}}" class="btn btn-primary copy-button-edit-location"><i class="fa fa-copy"></i></a></p>

      </div>
      @endfor
   </div>

</div>
</div>

</div>
<input type="hidden" name="" id="location_get_url" value="{{url('location/get')}}">
<script>

   $("#use_skills").on('change',function(){

  $(".error-skills").toggleClass("hide");
});

  $('.area').on('change',function(){

   $('#category').remove();
   var area = $('.area').val();
   var MySelectBox = '';
  var url = "<?php echo url('get/area/audit-categoryies'); ?>";
   var pdata = {'area':area};
   if(area.length > 0){
     $.ajax({
       url: url,
       type: 'POST',
       data: pdata,
       dataType:"xml",
       success: function(xml) {
         $(xml).find('root').each(function(index, element) {
          
           $(this).find('object').each(function(index, element) {
             
             var obj_id   = $(this).find('id').text();
             var obj_name = $(this).find('name').text().replace("%26","&");
             
             MySelectBox +='<option value="'+obj_id+'">'+obj_name+'</option>';
             
           })
         });

         var category = '<select class="ui fluid search dropdown category" multiple="" name="category[]" id="category">'+MySelectBox+'</select>';
         $('.categoryEditDiv').hide();
         $('.categoryEditDiv > .multiselect-native-select').hide();
         $('.category').hide();
         $(".categoryDiv").html(category);
         $('#category').multiselect({
           includeSelectAllOption: true
         });
           //called when successful
           
         },
         error: function(err) {
         //called when there is an error
         alert(err.message+"test");
       }
     });
   }else{
     var category = '<select class="ui fluid search dropdown category" multiple="" name="category[]" id="category"></select>';
     $(".categoryDiv").html(category);
     $('#category').multiselect({
       includeSelectAllOption: true
     });
   }

     
   });
   //Initiate Skills Multi select dropdown
        $( document ).ready(function() {
          //Initiate  Multi select dropdown
      $('#area-location').multiselect({
         includeSelectAllOption: true
        }); 

        //Initiate Skills Multi select dropdown
        $('#skills').multiselect({
         includeSelectAllOption: true
        }); 

        // copy 5 rating url 
         $('.copy-button-edit-location').on("click", function(){
        value = $(this).data('clipboard-text'); //Upto this I am getting value
         //$('.copy-btn').css("color", "#007bff");
         //$(this).css("background-color", "#404e67");
        var $temp = $("<input>");
          $("body").append($temp);
          $temp.val(value).select();
          document.execCommand("copy");
          $temp.remove();
   
          $(function() {
            new PNotify({
                text: 'Location Link Copied !!',
                icon: 'brighttheme-icon-success',
                type: 'success'
            });
        });
    })


        //changeLocation();
        //copy url for front app login
    $('.copy-btn').on("click", function(){
        value = $(this).data('clipboard-text'); //Upto this I am getting value
         //$('.copy-btn').css("color", "#007bff");
         //$(this).css("background-color", "#404e67");
        var $temp = $("<input>");
          $("body").append($temp);
          $temp.val(value).select();
          document.execCommand("copy");
          $temp.remove();
   
          $(function() {
            new PNotify({
                text: 'Location Link Copied !!',
                icon: 'brighttheme-icon-success',
                type: 'success'
            });
        });
    })
    //copy url for register
     $('.copy-btn-register').on("click", function(){
        value = $(this).data('clipboard-text'); //Upto this I am getting value
        // $('.copy-btn-register').css("color", "#007bff");
         //$(this).css("background-color", "#404e67");
        var $temp = $("<input>");
          $("body").append($temp);
          $temp.val(value).select();
          document.execCommand("copy");
          $temp.remove();
   
           $(function() {
            new PNotify({
                text: 'Register Link Copied !!',
                icon: 'brighttheme-icon-success',
                type: 'success'
            });
        });
    })
   
     //copy setting url 
     $('.copy-btn-setting').on("click", function(){
         
       var copyText = document.getElementById("setting-url");
   
      /* Select the text field */
      copyText.select();
      copyText.setSelectionRange(0, 99999); /*For mobile devices*/
   
      /* Copy the text inside the text field */
      document.execCommand("copy");
   
   
           $(function() {
            new PNotify({
                text: 'Setting Link Copied !!',
                icon: 'brighttheme-icon-success',
                type: 'success'
            });
        });
    })
        // Minimum setup
     $('#datetimepickeronlytime').datetimepicker({
        format: 'LT',
      
        icons: {
            time: "icofont icofont-clock-time",
            date: "icofont icofont-ui-calendar",
            up: "icofont icofont-rounded-up",
            down: "icofont icofont-rounded-down",
            next: "icofont icofont-rounded-right",
            previous: "icofont icofont-rounded-left"
        }
    });

         $("#datetimepicker3").on("dp.change", function(e) {
          $('#datetimepickeronlytime').data("DateTimePicker").minDate(e.date);
        });
    
      });
   
      $(function() {
      var rotation = 0;
      $("#rright").click(function() {
          rotation = (rotation -90) % 360;
          $("#imgprvw").css({'transform': 'rotate('+rotation+'deg)'});
      
          $('#rotation').val(rotation);
      });
    
      $("#rleft").click(function() {
          rotation = (rotation + 90) % 360;
          $("#imgprvw").css({'transform': 'rotate('+rotation+'deg)'});
      
         
          $('#rotation').val(rotation);
      });
   });
     function showimagepreview(input) {
       $(".arrow").show();
         if (input.files && input.files[0]) {
             var filerdr = new FileReader();
             filerdr.onload = function (e) {
                 $('#imgprvw').attr('src', e.target.result);
             };
             filerdr.readAsDataURL(input.files[0]);
         }
     }
</script>
<script type="text/javascript">
   //update link 
   
   function updateLink()
   {
     var url = "<?php echo $link; ?>";
   
     if (document.getElementById('no_employee').checked)
     {
       var url = url+"&employee_id=0";
     }
     var employee_id = $(".employee_dropdown").val();
   
       // if default employee is not selected from seleceted employee
      if (!document.getElementById('default_employee').checked || employee_id == null)
       {
           employee_id = "";
   
       }
       
       // Check if we have default employee
       if (employee_id != "" )
       {
          var url = url+"&employee_id="+employee_id;
       }
       
     // IF no settings are applied 
     if (!document.getElementById('default_employee').checked  && !document.getElementById('no_employee').checked)
     {
       var url = "<?php echo $link; ?>";
   
     }
     $('#setting-url').val(url);
   }
   
   
   // To change the employee dropdown on change of location multi-select . 
   function employeeDropdown()
   {
     
   
    var location = $('#location-id').val();
      
      var pdata = {'location':location};
      
      $.ajax({
        url : '{{url('/location/getLocationEmployees')}}',
        type: 'POST',
        data: pdata,
        dataType:"xml",
        success: function(xml) {
         
          var MySelectBox = '<option value="">No Employee Filter</option>';
          $(xml).find('root').each(function(index, element) {
    
           $(this).find('object').each(function(index, element) {
    
             var obj_id   = $(this).find('id').text();
             var obj_name = $(this).find('name').text();
             
             MySelectBox +='<option value="'+obj_id+'">'+obj_name+'</option>';
             
           })
         });
       
          $('.employee_dropdown').html(MySelectBox);
          if (document.getElementById('default_employee').checked)
           {
             $(".employee_dropdown").show();
           }
           else
           {
             $(".employee_dropdown").hide();
           }
           //called when successful
           
         },
         error: function(err) {
         //called when there is an error
         //alert(err.message+"test");
       }
     });
      
   }
   
   
   
    $('.country').on('change',function(){
    
     var countryVal = $('.country').val();
     
   
     var MySelectBox = '<option value="none">Select</option>';
     var pdata = {'country':countryVal};
     $.ajax({
         url: 'get/state',
         type: 'POST',
         data: pdata,
         dataType:"xml",
         success: function(xml) {
         //called when successful
         $(xml).find('root').each(function(index, element) {
                     
           $(this).find('object').each(function(index, element) {
             
             var obj_id   = $(this).find('id').text();
             var obj_name = $(this).find('name').text();
             
             MySelectBox +='<option value="'+obj_id+'">'+obj_name+'</option>';
           })
       });
    
       $("#state").html(MySelectBox);
       },
       error: function(err) {
       //called when there is an error
       alert(err.message+"test");
       }
     });
    });
    function showLocation()
   {
    var value = $('#is_multilocation').val();

    if(value==0)
    {
      $("#is_multilocation").val(1);
      $(".location-selection").removeClass('hide');
    }
    else
    {
      $("#is_multilocation").val(0);
      $(".location-selection").addClass('hide'); 
    }
    
   }
    function changeLocation()
   {
   
      $('#location').remove();
      var areaVal = $('.area').val();
      var url = $('#location_get_url').val();

      var MySelectBox = '';

      var pdata = {'areaVal':areaVal};
      if(areaVal.length > 0){
        $.ajax({
          url: url,
          type: 'POST',
          data: pdata,
          dataType:"xml",
          success: function(xml) {
            $(xml).find('root').each(function(index, element) {
             
              $(this).find('object').each(function(index, element) {
                
                var obj_id   = $(this).find('id').text();
                var obj_name = $(this).find('name').text().replace("%26","&");
                
                MySelectBox +='<option value="'+obj_id+'">'+obj_name+'</option>';
                
              })
            });
            
            var location = '<select class="ui fluid search dropdown location" onchange="changeCategory()" multiple="" name="location[]" id="location">'+MySelectBox+'</select>';
            $('.locationEditDiv').hide();
            $('.locationEditDiv > .multiselect-native-select').hide();
            $('.location').hide();
            $(".locationDiv").html(location);
            $('#location').multiselect({
              includeSelectAllOption: true
            });
              //called when successful
              
            },
            error: function(err) {
            //called when there is an error
            alert(err.message+"test");
          }
        });
      }else{
        var location = '<select class="ui fluid search dropdown location" multiple="" name="location[]" id="location"></select>';
        $(".locationDiv").html(location);
        $('#location').multiselect({
          includeSelectAllOption: true
        });
      }
   
   }
</script>

