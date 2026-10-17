(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const pages = $$(".page");
  const voice = $("#voiceAudio");
  const pageNames = ["The cover","A few words","The handwritten letter","Songs in the margins","The little archive","A small study of you","A voice between pages","The surprise"];
  let current = 0;
  let navigationReady = false;
  let isTurning = false;
  const toast = (message) => {
    const el=$("#toast"); el.textContent=message; el.classList.add("show");
    clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2600);
  };
  function cleanTurnStyles(page){
    page.classList.remove("flip-out-next","flip-out-prev","flip-in-next","flip-in-prev");
    ["position","left","top","width","height","margin","zIndex","transformOrigin","pointerEvents"].forEach(k=>page.style.removeProperty(k.replace(/[A-Z]/g,m=>"-"+m.toLowerCase())));
  }
  function showPage(index, requestedDirection) {
    index = Math.max(0, Math.min(pages.length-1,index));
    if(index===current){
      if(!navigationReady){
        pages.forEach((p,i)=>{p.classList.toggle("active",i===index);p.setAttribute("aria-hidden",i!==index?"true":"false")});
        navigationReady=true;
      }
      return;
    }
    if(isTurning)return;
    const oldIndex=current;
    const oldPage=pages[oldIndex];
    const newPage=pages[index];
    const direction=requestedDirection || (index>oldIndex ? "next" : "prev");
    pages.forEach(p=>p.classList.remove("turn-settled"));
    const shouldAnimate=navigationReady && oldPage && newPage && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    let oldRect=null, bookRect=null;
    if(shouldAnimate){oldRect=oldPage.getBoundingClientRect();bookRect=$("#book").getBoundingClientRect();}
    pages.forEach((p,i)=>{p.classList.toggle("active",i===index);p.setAttribute("aria-hidden",i!==index?"true":"false")});
    current=index;
    // Do not let the voice note keep playing under another chapter. Its pause event
    // coordinates the background-song resume without resetting the saved position.
    if(oldIndex===6 && index!==6 && voice && !voice.paused) voice.pause();
    $("#prevPage").disabled=index===0; $("#nextPage").disabled=index===pages.length-1;
    $("#navTitle").textContent=pageNames[index];
    $("#pageCounter").textContent=(index===0?"Cover":`Page ${index}`)+` · ${index+1} / ${pages.length}`;
    window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
    history.replaceState(null,"",`#${pages[index].id}`);
    if(shouldAnimate){
      isTurning=true;
      // Float the outgoing page over the next page so it can physically fold away.
      oldPage.style.position="absolute";
      oldPage.style.left=(oldRect.left-bookRect.left)+"px";
      oldPage.style.top=(oldRect.top-bookRect.top)+"px";
      oldPage.style.width=oldRect.width+"px";
      oldPage.style.height=oldRect.height+"px";
      oldPage.style.margin="0";
      oldPage.style.zIndex="12";
      oldPage.classList.add(direction==="next"?"flip-out-next":"flip-out-prev");
      newPage.classList.add(direction==="next"?"flip-in-next":"flip-in-prev");
      let finished=false;
      const finish=()=>{
        if(finished)return;finished=true;
        oldPage.removeEventListener("animationend",onOutgoingAnimationEnd);
        cleanTurnStyles(oldPage);cleanTurnStyles(newPage);
        newPage.classList.add("turn-settled");
        isTurning=false;
      };
      const onOutgoingAnimationEnd=(event)=>{if(event.target===oldPage)finish();};
      oldPage.addEventListener("animationend",onOutgoingAnimationEnd);
      setTimeout(()=>{if(isTurning)finish()},850);
    }
    navigationReady=true;
    if(index===3 && oldIndex!==3) onPlaylistPageEntered();
    else if(oldIndex===3 && index!==3) onPlaylistPageLeft();
  }
  $("#prevPage").addEventListener("click",()=>showPage(current-1,"prev"));
  $("#nextPage").addEventListener("click",()=>showPage(current+1,"next"));
  $("#beginBook").addEventListener("click",()=>{startBackgroundSong();showPage(1,"next")});

  // The original avatar sits on the cover immediately; the medallion still turns in 3D.
  const avatarMedallion=$("#avatarMedallion");
  const avatarImage=$(".avatar-image",avatarMedallion);
  function updateAvatarImageState(){
    if(avatarImage && avatarImage.complete && avatarImage.naturalWidth>0)avatarMedallion.classList.add("avatar-has-image");
    else avatarMedallion.classList.remove("avatar-has-image");
  }
  avatarImage?.addEventListener("load",updateAvatarImageState);
  avatarImage?.addEventListener("error",updateAvatarImageState);
  updateAvatarImageState();
  avatarMedallion.addEventListener("click",()=>{
    const flipped=avatarMedallion.classList.toggle("is-flipped");
    avatarMedallion.setAttribute("aria-expanded",String(flipped));
    if(!avatarMedallion.classList.contains("avatar-has-image"))toast("The original avatar image could not be loaded. Check assets/avatar/her-avatar.png.");
  });

  // Swipe horizontally to turn pages. Interactive controls and embeds are excluded.
  const interactiveSelector="button,a,input,textarea,select,iframe,audio,video,[role='button'],[contenteditable='true']";
  pages.forEach(page=>{
    let start=null;
    page.addEventListener("pointerdown",event=>{
      if(event.target.closest(interactiveSelector)) {start=null;return;}
      start={x:event.clientX,y:event.clientY,time:Date.now()};
    },{passive:true});
    page.addEventListener("pointerup",event=>{
      if(!start)return;
      const dx=event.clientX-start.x, dy=event.clientY-start.y;
      const elapsed=Date.now()-start.time;
      if(Math.abs(dx)>48 && Math.abs(dx)>Math.abs(dy)*1.2){
        event.preventDefault();
        if(dx<0)showPage(current+1,"next");else showPage(current-1,"prev");
      } else if(Math.abs(dx)<12 && Math.abs(dy)<12 && elapsed<650 && !event.target.closest(interactiveSelector)){
        const r=page.getBoundingClientRect(), localX=event.clientX-r.left;
        if(localX>r.width-28)showPage(current+1,"next");
        else if(localX<28)showPage(current-1,"prev");
      }
      start=null;
    },{passive:false});
    page.addEventListener("pointercancel",()=>{start=null;},{passive:true});
  });
  document.addEventListener("keydown",e=>{
    if(e.key==="ArrowRight" && !e.target.matches("input,textarea,button,a,iframe,audio,video"))showPage(current+1,"next");
    if(e.key==="ArrowLeft"&&!e.target.matches("input,textarea,button,a,iframe,audio,video"))showPage(current-1,"prev");
  });
  const backgroundAudio=$("#violinAudio"), backgroundButton=$("#violinButton"), soundToggle=$("#soundToggle"), wave=$(".sound-wave");
  const playlistFrame=$("#playlistEmbed"), spotifyHost=$("#spotifyEmbedHost"), spotifyStatus=$("#spotifyEmbedStatus");
  const spotifyHelpNote=$("#spotifyHelpNote");
  const SPOTIFY_PLAYLIST_URI="spotify:playlist:6hsGNTF4cAAcn42sR1ZiTK";
  const SPOTIFY_EMBED_URL="https://open.spotify.com/embed/playlist/6hsGNTF4cAAcn42sR1ZiTK?utm_source=generator&si=00f070f46b4c4e4b";
  let backgroundWanted=false;
  let spotifyController=null;
  let spotifyIframeAPI=null;
  let spotifyPlaybackIsPlaying=false;
  let playlistPageActive=false;
  let spotifyFallbackActive=false;
  let spotifyEmbedReady=false;
  let spotifyApiLoadStarted=false;
  let ambientResumeTimer=null;
  let spotifyReadyTimer=null;
  backgroundAudio.volume=0.42;

  function updateBackgroundAudioUi(isPlaying){
    backgroundButton.textContent=isPlaying?"Ⅱ":"▶";
    backgroundButton.setAttribute("aria-label",isPlaying?"Pause background song":"Play background song");
    soundToggle.setAttribute("aria-pressed",String(isPlaying));
    wave.classList.toggle("playing",isPlaying);
  }
  function setBackgroundStatus(message){$("#backgroundAudioStatus").textContent=message;}
  function voiceIsPlaying(){return Boolean(voice && !voice.paused && !voice.ended);}
  function spotifyIsForeground(){return spotifyPlaybackIsPlaying || (spotifyFallbackActive && playlistPageActive);}
  function foregroundAudioIsPlaying(){return spotifyIsForeground() || voiceIsPlaying();}

  function refreshBackgroundStatus(){
    if(spotifyPlaybackIsPlaying){
      setBackgroundStatus("Paused while Spotify plays. Your background song will return from this exact point when you pause Spotify or turn the page.");
    }else if(spotifyFallbackActive && playlistPageActive){
      setBackgroundStatus("Spotify is using compatibility mode, so the background song stays paused on this chapter to prevent overlapping audio. It will resume when you turn the page.");
    }else if(voiceIsPlaying()){
      setBackgroundStatus("Paused while your voice note plays. Your background song will return from the same point when the note pauses or finishes.");
    }else if(backgroundWanted && !backgroundAudio.paused){
      setBackgroundStatus("Your background song is playing softly behind the book. ♡");
    }else if(backgroundWanted){
      setBackgroundStatus("Your background song is ready to resume. If your browser blocks automatic audio, tap the sound control once.");
    }else{
      setBackgroundStatus("The background song is turned off. Use the sound control whenever you want to bring it back.");
    }
  }

  function pauseAmbientForForeground(){
    if(ambientResumeTimer){clearTimeout(ambientResumeTimer);ambientResumeTimer=null;}
    if(!backgroundAudio.paused)backgroundAudio.pause();
    updateBackgroundAudioUi(false);
    refreshBackgroundStatus();
  }

  function playAmbientIfAllowed(){
    if(!backgroundWanted){updateBackgroundAudioUi(false);refreshBackgroundStatus();return;}
    if(foregroundAudioIsPlaying()){
      pauseAmbientForForeground();
      return;
    }
    if(!backgroundAudio.paused){updateBackgroundAudioUi(true);refreshBackgroundStatus();return;}
    backgroundAudio.play().then(()=>{
      // A foreground source may have started while the browser was resolving play().
      if(!backgroundWanted || foregroundAudioIsPlaying()){
        backgroundAudio.pause();
        updateBackgroundAudioUi(false);
        refreshBackgroundStatus();
        return;
      }
      updateBackgroundAudioUi(true);
      refreshBackgroundStatus();
    }).catch(()=>{
      updateBackgroundAudioUi(false);
      setBackgroundStatus("Your browser blocked automatic audio resumption. Tap the sound control to continue from where the song stopped.");
    });
  }

  function maybeResumeAmbient(delay=160){
    if(ambientResumeTimer){clearTimeout(ambientResumeTimer);ambientResumeTimer=null;}
    if(foregroundAudioIsPlaying()){
      pauseAmbientForForeground();
      return;
    }
    if(!backgroundWanted){updateBackgroundAudioUi(false);refreshBackgroundStatus();return;}
    ambientResumeTimer=setTimeout(()=>{
      ambientResumeTimer=null;
      playAmbientIfAllowed();
    },delay);
  }

  function startBackgroundSong(){
    backgroundWanted=true;
    if(foregroundAudioIsPlaying()){
      pauseAmbientForForeground();
      toast("The background song will return when Spotify or your voice note pauses.");
      return;
    }
    playAmbientIfAllowed();
  }

  function toggleBackgroundSong(){
    if(backgroundWanted){
      backgroundWanted=false;
      if(!backgroundAudio.paused)backgroundAudio.pause();
      updateBackgroundAudioUi(false);
      setBackgroundStatus(foregroundAudioIsPlaying()?"The background song is set to stay off when Spotify or your voice note pauses.":"The background song is turned off.");
    }else{
      backgroundWanted=true;
      if(foregroundAudioIsPlaying()){
        updateBackgroundAudioUi(false);
        refreshBackgroundStatus();
        toast("The background song will return when the foreground audio pauses.");
      }else playAmbientIfAllowed();
    }
  }

  function handleSpotifyPlaying(){
    spotifyPlaybackIsPlaying=true;
    pauseAmbientForForeground();
    if(voiceIsPlaying())voice.pause();
    refreshBackgroundStatus();
    // The player should never keep playing audio after its page has been turned away.
    if(!playlistPageActive && spotifyController){
      try{spotifyController.pause();}catch(_error){}
    }
  }

  function handleSpotifyPaused(){
    spotifyPlaybackIsPlaying=false;
    maybeResumeAmbient(180);
  }

  function onPlaylistPageEntered(){
    playlistPageActive=true;
    if(spotifyFallbackActive){
      // Create the fallback only after this chapter is visible. A Spotify iframe
      // initialized inside a display:none page can choose a broken/narrow layout.
      if(!playlistFrame.querySelector(".spotify-fallback-player"))installSpotifyFallbackFrame();
      if(!backgroundAudio.paused)backgroundAudio.pause();
      updateBackgroundAudioUi(false);
      refreshBackgroundStatus();
      return;
    }

    // Lazy-load Spotify only after the chapter is displayed and has a real width.
    // This avoids a zero-width iframe in normal and private browsing modes.
    if(!spotifyEmbedReady && !spotifyController){
      requestAnimationFrame(()=>{
        if(!playlistPageActive || spotifyFallbackActive || spotifyEmbedReady || spotifyController)return;
        if(spotifyIframeAPI)initializeSpotifyEmbed(spotifyIframeAPI);
        else if(!spotifyApiLoadStarted)loadSpotifyIframeAPI();
      });
    }
    if(spotifyPlaybackIsPlaying)pauseAmbientForForeground();
    else maybeResumeAmbient(80);
  }

  function onPlaylistPageLeft(){
    playlistPageActive=false;
    if(spotifyController){
      if(spotifyPlaybackIsPlaying){
        try{spotifyController.pause();}catch(_error){}
        // Recovery path in case an embedded player does not send its pause event.
        if(ambientResumeTimer)clearTimeout(ambientResumeTimer);
        ambientResumeTimer=setTimeout(()=>{
          ambientResumeTimer=null;
          if(!playlistPageActive && spotifyPlaybackIsPlaying){
            spotifyPlaybackIsPlaying=false;
            maybeResumeAmbient(0);
          }
        },1100);
      }else{
        try{spotifyController.pause();}catch(_error){}
        maybeResumeAmbient(80);
      }
    }else if(spotifyFallbackActive){
      // Unloading the fallback iframe stops playback on page-turn in compatibility mode.
      const fallbackFrame=playlistFrame.querySelector(".spotify-fallback-player");
      if(fallbackFrame)fallbackFrame.remove();
      playlistFrame.classList.remove("is-ready","uses-fallback");
      spotifyStatus.hidden=false;
      spotifyStatus.innerHTML="Your playlist is ready when you return.<br><span>Turn back to this chapter to open Spotify again.</span>";
      maybeResumeAmbient(80);
    }else{
      maybeResumeAmbient(80);
    }
  }

  function installSpotifyFallbackFrame(){
    if(playlistFrame.querySelector(".spotify-fallback-player"))return;
    // This function is only called while the music chapter is visible, so Spotify
    // measures the same real viewport in regular and private browsing modes.
    playlistFrame.querySelectorAll("iframe").forEach(frame=>frame.remove());
    if(spotifyHost && spotifyHost.isConnected)spotifyHost.remove();
    const frame=document.createElement("iframe");
    const measuredWidth=Math.max(240,Math.round(playlistFrame.getBoundingClientRect().width-2));
    const measuredHeight=Math.max(220,Math.round(playlistFrame.getBoundingClientRect().height-2));
    frame.className="spotify-fallback-player";
    frame.title="Our shared Spotify playlist";
    frame.src=SPOTIFY_EMBED_URL;
    // Supply a concrete initial viewport and keep the element fluid through CSS.
    // This avoids the embed choosing a compact layout from a zero-size parent.
    frame.width=String(measuredWidth);
    frame.height=String(measuredHeight);
    frame.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
    frame.setAttribute("allow","autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture");
    frame.setAttribute("loading","eager");
    frame.setAttribute("allowfullscreen","");
    frame.style.border="0";
    playlistFrame.insertBefore(frame,spotifyStatus);
    playlistFrame.classList.add("is-ready","uses-fallback");
    spotifyStatus.hidden=true;
  }

  function activateSpotifyFallback(){
    if(spotifyEmbedReady || spotifyFallbackActive)return;
    spotifyFallbackActive=true;
    if(spotifyReadyTimer){clearTimeout(spotifyReadyTimer);spotifyReadyTimer=null;}

    // A controller may exist without completing initialization. Tear it down before
    // switching to the plain embed. Do not create the replacement while the page is
    // hidden; the next page entry will create it at the correct measured dimensions.
    if(spotifyController){
      try{spotifyController.destroy();}catch(_error){}
      spotifyController=null;
    }
    // The fallback no longer has observable playback events, so discard controller
    // state instead of treating it as a still-playing Spotify session.
    spotifyPlaybackIsPlaying=false;
    spotifyHelpNote.textContent="Spotify's standard playlist player is ready. If this browser blocks playback-state events, the background song stays paused while this chapter is open to prevent overlapping audio.";
    if(playlistPageActive){
      installSpotifyFallbackFrame();
      if(!backgroundAudio.paused)backgroundAudio.pause();
      updateBackgroundAudioUi(false);
      refreshBackgroundStatus();
    }else{
      playlistFrame.classList.remove("is-ready","uses-fallback");
      spotifyStatus.hidden=false;
      spotifyStatus.innerHTML="Your playlist is ready when you return.<br><span>Turn back to this chapter to open Spotify.</span>";
    }
  }

  function initializeSpotifyEmbed(IFrameAPI){
    if(IFrameAPI)spotifyIframeAPI=IFrameAPI;
    // The API script can finish loading just after the user leaves this chapter.
    // Save the API object and wait until the next visible entry to measure/create it.
    if(!playlistPageActive || spotifyFallbackActive || spotifyController || !spotifyHost)return;
    if(!IFrameAPI || typeof IFrameAPI.createController!=="function"){
      activateSpotifyFallback();
      return;
    }
    try{
      // Spotify documents width/height as pixel dimensions. Measure only after the
      // music page is active so hidden-page layout cannot initialise as 0px wide.
      const bounds=spotifyHost.getBoundingClientRect();
      const width=Math.max(240,Math.round(bounds.width));
      const height=Math.max(220,Math.round(playlistFrame.getBoundingClientRect().height-2));
      IFrameAPI.createController(spotifyHost,{uri:SPOTIFY_PLAYLIST_URI,width,height},controller=>{
        // The timeout may already have installed the fallback while Spotify was
        // still creating its controller. Never let a late callback replace it.
        if(spotifyFallbackActive){try{controller.destroy();}catch(_error){}return;}
        spotifyController=controller;
        try{
          // Register playback listeners before the ready listener. If any of them
          // fails, the watchdog below will choose the safe standard-iframe fallback
          // instead of marking the player ready without audio coordination.
          controller.addListener("playback_started",()=>handleSpotifyPlaying());
          controller.addListener("playback_update",event=>{
            if(!event || !event.data || typeof event.data.isPaused!=="boolean")return;
            if(event.data.isPaused)handleSpotifyPaused();
            else handleSpotifyPlaying();
          });
          controller.addListener("ready",()=>{
            if(spotifyFallbackActive)return;
            spotifyEmbedReady=true;
            if(spotifyReadyTimer){clearTimeout(spotifyReadyTimer);spotifyReadyTimer=null;}
            playlistFrame.classList.add("is-ready");
            spotifyStatus.hidden=true;
          });
        }catch(_listenerError){
          // Do not leave a stuck loader if a mobile WebView exposes a partial API.
          // The independent initialization watchdog will replace it with an iframe.
        }
      });
    }catch(_error){activateSpotifyFallback();}
  }

  function loadSpotifyIframeAPI(){
    if(!spotifyHost || spotifyApiLoadStarted || spotifyFallbackActive || spotifyEmbedReady)return;
    // Defensive check: the API must never be asked to size an embed in a hidden
    // chapter. onPlaylistPageEntered runs after display:block; requestAnimationFrame
    // gives the browser one layout pass before this measurement.
    if(!playlistPageActive || playlistFrame.getBoundingClientRect().width<100){return;}
    spotifyApiLoadStarted=true;

    // Arm a watchdog before loading the third-party script. This covers a blocked
    // API, a partial controller, or missing readiness events in privacy modes.
    spotifyReadyTimer=setTimeout(()=>{
      if(!spotifyEmbedReady && !spotifyFallbackActive)activateSpotifyFallback();
    },9000);

    window.onSpotifyIframeApiReady=initializeSpotifyEmbed;
    const apiScript=document.createElement("script");
    apiScript.src="https://open.spotify.com/embed/iframe-api/v1";
    apiScript.async=true;
    apiScript.onerror=activateSpotifyFallback;
    document.head.appendChild(apiScript);
  }

  // Any first tap on the cover counts as the visitor gesture required to start audio.
  $("#cover").addEventListener("click",startBackgroundSong,{once:true});
  backgroundButton.addEventListener("click",toggleBackgroundSong);
  soundToggle.addEventListener("click",toggleBackgroundSong);
  backgroundAudio.addEventListener("play",()=>updateBackgroundAudioUi(true));
  backgroundAudio.addEventListener("pause",()=>updateBackgroundAudioUi(false));
  backgroundAudio.addEventListener("error",()=>{
    setBackgroundStatus("The background song could not be loaded. Check assets/music/background-song.mp3.");
    updateBackgroundAudioUi(false);
  });

  // Voice note is foreground audio. The native pause keeps the exact background playhead.
  voice.addEventListener("play",()=>{
    if(current!==6){voice.pause();return;}
    if(spotifyPlaybackIsPlaying && spotifyController){try{spotifyController.pause();}catch(_error){}}
    pauseAmbientForForeground();
    refreshBackgroundStatus();
  });
  voice.addEventListener("pause",()=>maybeResumeAmbient(140));
  voice.addEventListener("ended",()=>maybeResumeAmbient(140));
  voice.addEventListener("loadedmetadata",()=>$("#voiceMissing").hidden=true);
  voice.addEventListener("error",()=>{$("#voiceMissing").hidden=false});

  // Spotify initialisation is intentionally lazy: wait until the playlist chapter is visible.
  // Load the user's original photos eagerly when their visible frame is activated.
  // CSS keeps each image in the layout while it loads (opacity 0); display:none would
  // prevent some mobile browsers from requesting lazy images inside hidden cards.
  $$(".real-photo").forEach(img=>{
    const frame=img.closest(".photo-frame");
    const markLoaded=()=>{frame.classList.remove("photo-error");frame.classList.add("has-photo");};
    const markFailed=()=>{
      frame.classList.remove("has-photo");
      frame.classList.add("photo-error");
      // A failed file path should never fail silently; this hint is hidden when the photo loads.
      const placeholder=frame.querySelector(".photo-placeholder");
      if(placeholder && !placeholder.querySelector(".photo-error-hint")){
        const hint=document.createElement("small");
        hint.className="photo-error-hint";
        hint.textContent=`Photo couldn't load. Check: ${img.dataset.src || "the photo file path"}`;
        placeholder.appendChild(hint);
      }
    };
    img.addEventListener("load",markLoaded);
    img.addEventListener("error",markFailed);
    img.loading="eager";
    img.decoding="async";
    if(img.dataset.src)img.src=img.dataset.src;
    if(img.complete){
      if(img.naturalWidth>0)markLoaded();
      else if(img.currentSrc)markFailed();
    }
  });
  const letterImg = new Image();
  letterImg.onload=()=>{$("#letterPhoto").innerHTML="";letterImg.alt="Photograph of the handwritten birthday letter";letterImg.style.width="100%";letterImg.style.height="auto";$("#letterPhoto").appendChild(letterImg)};
  letterImg.onerror=()=>{};
  letterImg.src="assets/photos/handwritten-letter.jpg";
  // One gentle knock on either the illustrated peephole or the instruction button
  // opens the childhood-photo sequence. The actual peephole is keyboard-accessible too.
  const door=$("#memoryDoor"), reveal=$("#memoryReveal"), peephole=$("#peephole"), knockButton=$("#knockButton");
  let memoryIndex=0, memoryOpening=false;
  function openFirstMemory(){
    if(memoryOpening || !reveal.hidden)return;
    memoryOpening=true;
    door.classList.add("open-peek");
    peephole.setAttribute("aria-pressed","true");
    $("#doorHint").textContent="The peephole opens… your first memory is here.";
    knockButton.disabled=true;
    knockButton.textContent="Opening your first memory… ♡";
    window.setTimeout(()=>{
      reveal.hidden=false;
      door.style.display="none";
      knockButton.style.display="none";
      $("#doorHint").style.display="none";
      setMemory(0);
      reveal.scrollIntoView({behavior:"smooth",block:"start"});
      memoryOpening=false;
    },520);
  }
  knockButton.addEventListener("click",openFirstMemory);
  peephole.addEventListener("click",openFirstMemory);
  peephole.addEventListener("keydown",event=>{
    if(event.key==="Enter" || event.key===" "){
      event.preventDefault();
      openFirstMemory();
    }
  });
  function setMemory(i){
    const cards=$$(".memory-card");
    memoryIndex=(i+cards.length)%cards.length;
    cards.forEach((c,n)=>c.classList.toggle("active",n===memoryIndex));
    // Reaffirm eager loading when a memory card becomes visible on mobile browsers.
    $$(".real-photo",cards[memoryIndex]).forEach(img=>{img.loading="eager";if(!img.currentSrc && img.dataset.src)img.src=img.dataset.src;});
    $("#memoryCounter").textContent=`${memoryIndex+1} / ${cards.length}`;
    $("#memoryPrev").disabled=memoryIndex===0;
    $("#memoryNext").textContent=memoryIndex===cards.length-1?"Back to first ↻":"Next →";
  }
  $("#memoryPrev").addEventListener("click",()=>setMemory(memoryIndex-1));$("#memoryNext").addEventListener("click",()=>setMemory(memoryIndex+1));
  // Favourites quiz. Known answers are explicitly separated from invented details.
  const questions = [
    {q:"What is your favourite colour?",options:["Purple","Blue","Pink","Green"],answer:1,note:"Blue — a colour that can hold both calm and a whole universe.",symbol:"✦"},
    {q:"Which flowers are your favourites?",options:["Red roses","Sunflowers","White lilies","Blue hydrangeas"],answer:3,note:"Blue hydrangeas: little clouds of blue, gathered into one bloom.",symbol:"✿"},
    {q:"Which Indian city has a special place among your favourites?",options:["Banaras (Varanasi)","Jaipur","Mumbai","Kochi"],answer:0,note:"Banaras — a city of old lanes, layered stories, and a river that remembers.",symbol:"⌂"},
    {q:"Which city outside India would you choose as a favourite?",options:["Prague","Vienna","Edinburgh","Lisbon"],answer:2,note:"Edinburgh — stone streets, literary corners, and a little misty magic.",symbol:"✧"},
    {q:"Which classical instrumental piece is a favourite?",options:["Canon in D","Clair de Lune","Vivaldi’s Winter","Moonlight Sonata"],answer:2,note:"Vivaldi’s Winter — a little drama, a little chill, and music that moves like weather.",symbol:"♫"},
    {q:"Which food is one of your favourites?",options:["Idli","Dosa","Chole bhature","Pav bhaji"],answer:0,note:"Idli — soft, simple comfort, with its own place in your little catalogue of favourites.",symbol:"❀"},
    {q:"Which vegetable do you like best?",options:["Broccoli","Bottle gourd","Beetroot","Mushroom"],answer:3,note:"Mushrooms made the list — a small, unmistakable favourite.",symbol:"✿"},
    {q:"Which food do you dislike?",options:["Corn","Sprouts","Paneer","Peas"],answer:1,note:"Sprouts are firmly on the not-for-me list. A self-study should include dislikes, too.",symbol:"☁"},
    {q:"Which instant noodle brand is your favourite?",options:["Yippee","Maggi","Top Ramen","Ching’s"],answer:1,note:"Maggi — a familiar quick comfort, and the one you chose as your favourite.",symbol:"♡"},
    {q:"Which career would you choose for yourself?",options:["Architect","Wildlife photographer","Trauma surgeon","Astronomer"],answer:2,note:"Trauma surgeon — a demanding calling built around skill, courage, and helping people when every second matters.",symbol:"✧"},
    {q:"Which adventure sounds most like your kind of outing?",options:["Shopping in a huge mall","Exploring abandoned places with a close friend","A crowded music festival","A luxury resort weekend"],answer:1,note:"An abandoned place, a close friend, and the thrill of discovering what time left behind.",symbol:"☾"},
    {q:"Which water activity would you most like to do?",options:["Scuba diving","Kayaking","Water skiing","Surfing"],answer:3,note:"Surfing — meeting a moving wave and learning to move with it.",symbol:"≈"},
    {q:"What distinctive detail would you want in your future house?",options:["A mirrored ceiling","All-white rooms","Coloured glass panes and windows","A giant indoor screen"],answer:2,note:"Coloured glass windows — letting ordinary daylight arrive in beautiful, unexpected colours.",symbol:"✦"},
    {q:"Which anime character is a favourite?",options:["Anya Forger","Chihiro Ogino","Nezuko Kamado","Nobara Kugisaki"],answer:0,note:"Anya Forger — expressive, chaotic, and impossible not to recognise.",symbol:"♡"},
    {q:"Which pair of writers belongs among your favourites?",options:["Jane Austen and Charles Dickens","Franz Kafka and Virginia Woolf","Agatha Christie and Arthur Conan Doyle","Tolkien and C. S. Lewis"],answer:1,note:"Franz Kafka and Virginia Woolf — two distinctive literary worlds, both worth wandering through slowly.",symbol:"▤"}
  ];
  // Confirmed intended answers: option positions A/B/C/D become lowercase a/b/c/d.
  // This same answer key drives the envelopes, final collage, and early gift password.
  const intendedAnswerPositions = "bdaccadbbcbdcab";
  if(intendedAnswerPositions.length!==questions.length)throw new Error("Quiz answer key length must match the number of questions.");
  questions.forEach((q,i)=>{
    const answerLetter=String.fromCharCode(97+q.answer);
    if(answerLetter!==intendedAnswerPositions[i])throw new Error(`Quiz answer key mismatch at question ${i+1}.`);
    if(q.options.length!==4 || q.answer<0 || q.answer>3)throw new Error(`Invalid options or answer index at question ${i+1}.`);
  });
  let qIndex=0, answers=[];
  const quizContent=$("#quizContent"), quizFinal=$("#quizFinal");
  function updateProgress(){const done=Math.min(qIndex+1,questions.length);$("#quizProgressText").textContent=`A little collection · ${Math.min(qIndex+1,questions.length)} of ${questions.length}`;$("#quizProgressBar").style.width=`${answers.length/questions.length*100}%`}
  function renderQuestion(){
    quizFinal.hidden=true;quizContent.hidden=false;updateProgress();
    const q=questions[qIndex];
    quizContent.innerHTML=`<p class="question-kicker">Question ${qIndex+1} · a favourite thing</p><h3 class="question-title">${q.q}</h3><div class="answer-options">${q.options.map((o,i)=>`<button type="button" class="answer-option" data-choice="${i}"><span class="option-symbol">${["✦","✿","✧","❧"][i]}</span>${o}</button>`).join("")}</div>`;
    $$(".answer-option",quizContent).forEach(btn=>btn.addEventListener("click",()=>chooseAnswer(Number(btn.dataset.choice))));
  }
  function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));}
  function chooseAnswer(choice){
    answers[qIndex]=choice;
    const q=questions[qIndex];
    const selectedAnswer=q.options[choice];
    const intendedAnswer=q.options[q.answer];
    const guessedRight=choice===q.answer;
    const responseNote=guessedRight
      ? "You picked the very answer I had in mind. ♡"
      : `You chose “${escapeHtml(selectedAnswer)}”. The answer I had in mind is the one above. ♡`;
    quizContent.innerHTML=`<div class="envelope-reveal"><p class="question-kicker">A little note, just opened</p><div class="reveal-envelope"><span class="wax-seal">✦</span></div><h3>${escapeHtml(intendedAnswer)}</h3><p>${escapeHtml(q.note)}</p><p class="answer-feedback ${guessedRight?"is-match":"is-mismatch"}">${responseNote}</p><button class="primary-button" id="continueQuiz" type="button">${qIndex===questions.length-1?"Gather my collection ↗":"Open the next envelope →"}</button></div>`;
    $("#quizProgressText").textContent=`Envelope opened · ${qIndex+1} of ${questions.length}`;
    $("#quizProgressBar").style.width=`${answers.length/questions.length*100}%`;
    $("#continueQuiz").addEventListener("click",()=>{if(qIndex<questions.length-1){qIndex++;renderQuestion()}else renderFinal()});
  }
  function renderFinal(){
    quizContent.hidden=true;quizFinal.hidden=false;$("#quizProgressText").textContent="Your collection is complete";$("#quizProgressBar").style.width="100%";
    $("#answerCollage").innerHTML=questions.map((q,i)=>`<div class="answer-tile"><span>${q.symbol}</span><small>${String(i+1).padStart(2,"0")} · YOUR CHOICE</small><strong>${escapeHtml(q.options[answers[i]])}</strong><small class="answer-truth">ANSWER I HAD IN MIND</small><em>${escapeHtml(q.options[q.answer])}</em></div>`).join("");
  }
  $("#startQuiz").addEventListener("click",()=>{qIndex=0;answers=[];renderQuestion()});
  $("#restartQuiz").addEventListener("click",()=>{qIndex=0;answers=[];renderQuestion()});
  // Countdown target is explicit India Standard Time (UTC+05:30).
  const unlockAt = new Date("2026-10-18T20:45:00+05:30").getTime();
  // Client-side preview key: 15 lowercase letters derived from the intended correct options.
  // The visitor's selected quiz answers do not affect this key.
  const GIFT_PASSCODE = questions.map(q=>String.fromCharCode(97+q.answer)).join("");
  // Optional alternative: set the real public gift URL here to generate a QR automatically.
  const GIFT_URL = "";
  let timedRevealReached=false;
  let qrRenderStarted=false;

  function renderGiftQr(){
    if(qrRenderStarted)return;
    qrRenderStarted=true;
    const area=$("#qrArea");
    const codeImage=new Image();
    codeImage.alt="QR code for the birthday surprise";
    codeImage.className="gift-qr-image";
    codeImage.onload=()=>{
      area.innerHTML="";
      area.appendChild(codeImage);
      if(GIFT_URL.trim()){
        const link=$("#giftDownload");link.href=GIFT_URL;link.hidden=false;
        $("#giftLinkStatus").textContent="The QR image is in place. You can also open the gift directly with the link below.";
      }else{
        $("#giftLinkStatus").textContent="The QR code image has been added. Scan it with another device to open the present.";
      }
    };
    codeImage.onerror=()=>{
      if(GIFT_URL.trim()){
        area.innerHTML="";
        if(window.QRCode){
          new QRCode(area,{text:GIFT_URL,width:150,height:150,colorDark:"#211822",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H});
          $("#giftLinkStatus").textContent="The code links to your gift. If you're viewing this on the same phone, use the button below.";
        }else{
          area.innerHTML='<div class="qr-placeholder">✦<br><span>QR generation is unavailable. Use the gift link below.</span></div>';
          $("#giftLinkStatus").textContent="The direct gift link is available below.";
        }
        const link=$("#giftDownload");link.href=GIFT_URL;link.hidden=false;
      }else{
        area.innerHTML='<div class="qr-placeholder">✦<br><span>Your little code is still on its way.</span></div>';
        $("#giftLinkStatus").textContent="The little code will appear here soon.";
      }
    };
    codeImage.src="assets/gift/gift-qr.png";
  }

  function unlockGift(reason){
    $("#giftFlipCard").classList.add("unlocked");
    $("#giftFlipCard").setAttribute("aria-label","The birthday surprise is now revealed");
    $("#giftReveal").hidden=false;
    renderGiftQr();
    if(reason==="time"){
      timedRevealReached=true;
      $("#countdownHeading").textContent="THE WAIT IS OVER";
      $("#countdownCaption").textContent="It's time. Your little surprise is ready. ♡";
      $("#unlockStatus").textContent="Unlocked · 18 October 2026 · 8:45 p.m. IST";
      $("#giftPasswordFeedback").textContent="The scheduled reveal has arrived.";
    }else if(!timedRevealReached){
      $("#countdownHeading").textContent="YOUR EARLY PREVIEW IS OPEN";
      $("#countdownCaption").textContent="A little early look — the scheduled reveal remains set for 18 October 2026 at 8:45 p.m. IST. ♡";
      $("#unlockStatus").textContent="Preview unlocked with passcode · timed reveal remains 18 October 2026 at 8:45 p.m. IST";
      $("#giftPasswordFeedback").textContent="The little lock is open. This preview does not change the scheduled reveal.";
    }
  }

  $("#giftUnlockForm").addEventListener("submit",event=>{
    event.preventDefault();
    const typed=$("#giftPassword").value.trim().toLowerCase();
    if(typed===GIFT_PASSCODE){
      $("#giftPasswordFeedback").classList.remove("is-error");
      unlockGift("password");
    }else{
      $("#giftPasswordFeedback").classList.add("is-error");
      $("#giftPasswordFeedback").textContent="That 15-letter key doesn't fit. Please try again.";
      $("#giftPassword").select();
    }
  });

  function tick(){
    const left=unlockAt-Date.now();
    if(left<=0){
      ["days","hours","minutes","seconds"].forEach(id=>$("#"+id).textContent="00");
      if(!timedRevealReached)unlockGift("time");
      return;
    }
    const days=Math.floor(left/86400000),hours=Math.floor(left%86400000/3600000),mins=Math.floor(left%3600000/60000),secs=Math.floor(left%60000/1000);
    $("#days").textContent=String(days).padStart(2,"0");$("#hours").textContent=String(hours).padStart(2,"0");$("#minutes").textContent=String(mins).padStart(2,"0");$("#seconds").textContent=String(secs).padStart(2,"0");
  }
  tick();setInterval(tick,1000);
  // Direct page hash links are supported for previewing and QA.
  const hash=location.hash.slice(1);const hashIndex=pages.findIndex(p=>p.id===hash);if(hashIndex>0)showPage(hashIndex);else showPage(0);
})();