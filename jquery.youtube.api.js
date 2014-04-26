
/**
 * Note: A playback only counts toward a video's official 
 * view count if it is initiated via a native play button 
 * in the player.
 */

var player,
    firstVideo,
    videoPlayer        = document.getElementById('youtube-player'),
    videoPlaylist      = [],
    videoPlaylistPills = '.youtube-playlist li',
    videoMute          = '.youtube-mute',
    videoUnMute        = '.youtube-unmute',
    videoVolume        = '.youtube-volume',
    videoPrevious      = '.youtube-previous',
    videoNext          = '.youtube-next',
    iframeApiTag       = document.createElement('script'),
    firstScriptTag     = document.getElementsByTagName('script')[0];

function forEachElement( selector , fn ) {
  var elements = document.querySelectorAll( selector );
  for ( var i = 0; i < elements.length; i++) {
    fn( elements[ i ] , i );
  }
}

forEachElement( videoPlaylistPills , function( el , i ) {
  var rel = el.querySelectorAll( '[rel]' )[ 0 ].rel;
  if ( videoPlaylist.indexOf( rel ) > 0 ) {
    el.parentNode.removeChild( el );
  } else {
    videoPlaylist.push( rel );
  }
});

firstVideo = videoPlaylist.shift();

var playerControls = {
  autohide        : null,
  autoplay        : 1,      // 0 || 1 | Sets whether or not the initial video will autoplay when the player loads.
  cc_load_policy  : null,
  color           :'white', // 'red' || 'white' | Red/White Colors. Default: 'red'
  controls        : 0,      // 0 || 1 || 2 | Show/Hide/Show at start for video controls
  disablekb       : null,
  enablejsapi     : null,
  end             : null,
  fs              : null,
  iv_load_policy  : null,
  loop            : 1,
  modestbranding  : 1,      // 0 || 1 | Show/Hide YouTube Branding
  origin          : null,
  playerapiid     : null,
  playsinline     : null,
  rel             : 0,      // 0 || 1 | Hide/Show Related Videos
  showinfo        : 0,      // 0 || 1 | Hide/Show Video Info at the start of the video
  start           : null,
  theme           :'dark',  // dark || light | Dark/Light Theme Options. Default: 'dark'
  list            : null,
  listType        : null,
  playlist        : videoPlaylist.toString(),
  quality         :'highres', // highres || hd1080 || hd720 || large || medium || small
  pills           : videoPlaylistPills,
  videoMute       : videoMute,
  videoUnMute     : videoUnMute,
  videoVolume     : videoVolume,
  videoPrevious   : videoPrevious,
  videoNext       : videoNext
};

iframeApiTag.src = "https://www.youtube.com/iframe_api";
firstScriptTag.parentNode.insertBefore(iframeApiTag, firstScriptTag);

function onPlayerReady( event ) {
  $( videoPlayer ).playerReady( player , playerControls );
}

function onPlayerStateChange( event ) {
  $( videoPlayer ).playerStateChange( event );
}

function onYouTubeIframeAPIReady() {
  player = new YT.Player( videoPlayer.getAttribute( 'id' ) , {
    height     : '270',
    width      : '480',
    videoId    : firstVideo,
    playerVars : playerControls,
    events     : {
      'onReady'       : onPlayerReady,
      'onStateChange' : onPlayerStateChange
    }
  });
}

( function( $ ) {

  var th, $body = $( 'body' );

  $.fn.playerStateChange = function( event ) {
    
    var dict = {
      '-1' : 'videoUnstarted',
      '0'  : 'videoEnded',
      '1'  : 'videoPlaying',
      '2'  : 'videoPaused',
      '3'  : 'videoBuffering',
      '5'  : 'videoVideoCued'
    };

    for( var key in dict ) {
      $body.removeClass( dict[key] );
      if ( event.data.toString() === key ) {
        $body.addClass( dict[key] );
      }
    }

  };

  $.fn.playerReady = function( player , playerSettings ) {

    th              = this;
    th.player       = player;
    th.playerConfig = playerSettings;
    th.trackmouse   = false;
    
    /**
     * Initializing Function
     * @return null
     */
    th.init = function( playerSettings ) {

      th.deepExtend( {} , th.playerConfig , playerSettings );

      $volume = $( th.playerConfig.videoVolume );
      $pills  = $( th.playerConfig.pills );

      $volume.val( th.player.getVolume() );
      $pills.eq( player.getPlaylistIndex() ).addClass( 'active' );
      $body.addClass( 'videoUnMuted' );


      /**
       * Play Video defined by it's index in a playlist
       * @param  {int} videoIndex index of the video in playlist
       * @return null
       */
      $pills.click( function( event ) {
        event.preventDefault();
        $pills.removeClass( 'active' );
        $( this ).addClass( 'active' );
        th.player.playVideoAt( $( this ).index() );
      });


      /**
       * [description]
       * @return null
       */
      $( '[class*="youtube"]' ).bind( 'click' , function( event ) {

        event.preventDefault();
        eclassName = event.currentTarget.className;

        if ( eclassName.indexOf( th.playerConfig.videoPrevious.replace( '.' , '' ) ) > -1 ) {
          th.player.previousVideo();
        }

        if ( eclassName.indexOf( th.playerConfig.videoNext.replace( '.' , '' ) ) > -1 ) {
          th.player.nextVideo();
        }

        if ( eclassName.indexOf( th.playerConfig.videoMute.replace( '.' , '' ) ) > -1 ) {
          th.player.mute();
          $body.removeClass( 'videoUnMuted' ).addClass( 'videoMuted' );
        }

        if ( eclassName.indexOf( th.playerConfig.videoUnMute.replace( '.' , '' ) ) > -1 ) {
          th.player.unMute();
          $body.removeClass( 'videoMuted' ).addClass( 'videoUnMuted' );
        }

      });


      /**
       * Volume Controls
       * @return null
       */
      $volume.bind( 'mousedown' , function( event ) {
        th.trackmouse = true;
      });
      $volume.bind( 'mouseup' , function( event ) {
        th.trackmouse = false;
      });
      $volume.bind( 'mousemove' , function( event ) {
        if ( th.trackmouse ) {
          th.player.setVolume( $( this ).val() );
        }
      });


    };

    /**
     * Recursive Array Merge
     * @param  {array} out new array to create
     * @return null
     */
    th.deepExtend = function(out) {
      out = out || {};
      for (var i = 1; i < arguments.length; i++) {
        var obj = arguments[i];
        if (!obj) {
          continue;
        }
        for (var key in obj) {
          if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === 'object') {
              th.deepExtend(out[key], obj[key]);
            } else {
              out[key] = obj[key];
            }
          }
        }
      }
      return out;
    };

    th.init( playerSettings );

  };

  

})( jQuery );