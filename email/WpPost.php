<?php

namespace App;

use Illuminate\Database\Eloquent\Model; 
class WpPost extends Model
{
    protected $table = 'wp_posts'; 
    public $timestamps = false;
}
