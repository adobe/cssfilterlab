$(function () { 

    /* Target element: the shader applies to #container */
    var shaders = [];
    var shadersByName = {};
    var target = $('#container');
    var timeline = buildTimeline($("#timeline"), $("#timeline .keyframes_list"), $("#timeline .play_head"), timelineUpdateCallback,
                                 defaultKeyframeClone, calculateKeyframe);
    var defaultKeyframe = {};
    var editorsKeyframe = null;
    
    var lastHash = null;
    
    function timelineUpdateCallback() {
         $("#playPauseButton").toggleClass("active", timeline.isPlaying());
        updateEditorsKeyframe();
        updateFilters();
    }
    
    function updateEditorsKeyframe() {
        var keyframe = calculateKeyframe(timeline.currentTime());
        if (!keyframe)
            keyframe = makeGeneratedClone(defaultKeyframe);
        $("#toggleActiveKeyframeButton").toggleClass("active", !keyframe.generated);
        $("#gotoPrevKeyframeButton").toggleClass("active", !!timeline.prevKeyframe());
        $("#gotoNextKeyframeButton").toggleClass("active", !!timeline.nextKeyframe());
        
        editorsKeyframe = keyframe;
        for (var i = 0; i < shaders.length; ++i) {
            var shader = shaders[i];
            shader.configTable.setSource(keyframe[shader.name]);
        }
    }
    
    function editorValueChanged() {
        if (editorsKeyframe.generated) {
            // Convert this generate keyframe into a static keyframe.
            editorsKeyframe.generated = false;
            timeline.createKeyframe(timeline.currentTime(), editorsKeyframe);
        } else {
            updateFilters();
        }
        triggerStorageUpdate();
    }
    
    function loadDefaultValues() {
        timeline.createKeyframe(0, defaultKeyframeClone());
        timeline.createKeyframe(timeline.maxTime(), defaultKeyframeClone());
        
        timeline.setAnimationDuration(500);
        $("#timelineDuration").val(timeline.animationDuration() / 1000);
        
        toggleShader('grayscale', true);
    }
    
    function resetTimelineAndActiveShaders() {
        timeline.reset();
        for (var i = 0; i < shaders.length; ++i) {
            var shader = shaders[i];
            if (shader.el.hasClass("current"))
                toggleShader(shader.name, false);
        }
    }
    
    function resetToDefault() {
        resetTimelineAndActiveShaders();
        loadDefaultValues();
        triggerStorageUpdate();
    }
    
    var updateStorageTimer = null;
    
    function triggerStorageUpdate() {
        if (updateStorageTimer)
            clearTimeout(updateStorageTimer);
        updateStorageTimer = setTimeout(updateStorage, 100);
    }
            
    function updateStorage() {
        updateStorageTimer = null;
        var keyframes = timeline.keyframes();
        var storage = [];
        for (var i=0; i < keyframes.length; ++i) {
            storage.push({
                time: keyframes[i].time,
                value: keyframes[i].value
            });
        }

        var activeShaders = [];
        for (var i = 0; i < shaders.length; ++i) {
            var shader = shaders[i];
            if (shader.el.hasClass("current"))
                activeShaders.push(shader.name);
        }
        
        var jsonStorage = JSON.stringify({
            keyframes: storage,
            activeShaders: activeShaders,
            duration: timeline.animationDuration()
        });
        lastHash = "#" + encodeURIComponent(jsonStorage);
        window.location.hash = lastHash;
    }
    
    function loadFromStorage() {
        var loaded = false;
        var storageData = null;
        if (window.location.hash && window.location.hash.length > 1)
            storageData = decodeURIComponent(window.location.hash.substr(1));
        
        if (storageData) {
            try {
                var storage = JSON.parse(storageData),
                    keyframes = storage.keyframes,
                    activeShaders = storage.activeShaders;
                
                for (var i=0; i<keyframes.length; ++i)
                    timeline.createKeyframe(keyframes[i].time, keyframes[i].value);

                for (var i = 0; i < activeShaders.length; ++i)
                    toggleShader(activeShaders[i], true);
                
                timeline.setAnimationDuration(storage.duration);
                $("#timelineDuration").val(timeline.animationDuration() / 1000);
                
                loaded = true;
            } 
            catch (e) {
            }
        }
        
        if (!loaded) {
            loadDefaultValues();
        }
    }
    
    window.addEventListener("hashchange", function() {
        if (lastHash == window.location.hash)
            return;
        resetTimelineAndActiveShaders();
        loadFromStorage();
    });
    
    function defaultKeyframeClone() {
        return cloneFrame(defaultKeyframe);
    }
    
    function makeGeneratedClone(value) {
        var t = cloneFrame(value);
        t.generated = true;
        return t;
    }
    
    function calculateKeyframe(time) {
        var set = timeline.currentKeyframeSet();
        if (!set) {
            var keyframes = timeline.keyframes();
            if (!keyframes.length)
                return makeGeneratedClone(defaultKeyframe);
            
            if (keyframes[0].time > time)
                return makeGeneratedClone(keyframes[0].value);
            if (keyframes[keyframes.length - 1].time < time)
                return makeGeneratedClone(keyframes[keyframes.length - 1].value);
            throw new Error("ASSERT_NOT_REACHED");
        }
        if (set.length == 1)
            return set[0].value;
        
        var A = set[0];
        var B = set[1];
        var t = set[2];
        
        var R = { generated: true };

        // We need to mix A and B with a value of t
        for (var i = 0; i < shaders.length; ++i) {
            var shader = shaders[i];
            R[shader.name] = blendParams(shader, A.value[shader.name], B.value[shader.name], t);
        }
        
        return R;
    }
    
    $("#createKeyframeButton").click(timeline.createKeyframeNow);
    $("#deleteKeyframeButton").click(timeline.deleteCurrentKeyframe);
    
    $("#gotoPrevKeyframeButton").click(timeline.gotoPrevKeyframe);
    $("#gotoNextKeyframeButton").click(timeline.gotoNextKeyframe);
    $("#toggleActiveKeyframeButton").click(timeline.toggleKeyframe);
    $("#playPauseButton").click(timeline.playPause);
    $("#resetTimelineButton").click(resetToDefault);
    $("#timelineDuration").bind("click keyup", function(e){
        timeline.setAnimationDuration(parseFloat(e.target.value) * 1000)
        triggerStorageUpdate();
    })
    
    function toggleShader (shaderName, toggle) {
        var shader = shadersByName[shaderName];
        var selected = shader.el.hasClass("current");
        
        if (toggle !== undefined) {
            if (toggle == selected)
                return;
            selected = !toggle;
        } else {
            // Only trigger an update when the user clicked a shader.
            triggerStorageUpdate();
        }
        
        if (!selected)
            shader.el.addClass('current').children('.config').slideDown();
        else
            shader.el.removeClass('current').children('.config').slideUp();
        
        updateFilters();
    }
    
    function getFiltersForKeyframe(keyframe, theme) {
        var filterProperty = [];
        for (var i = 0; i < shaders.length; ++i) {
            var shader = shaders[i];
            if (shader.el.hasClass("current"))
                filterProperty.push(customFilterForShader(shader, keyframe[shader.name], theme));
        }
        return filterProperty;
    }
    
    function getFiltersAtTime(time, theme) {
        var keyframe = calculateKeyframe(time);
        if (!keyframe)
            return null;
        return getFiltersForKeyframe(keyframe, theme);
    }
    
    function updateFilters() {
        var filterProperty = getFiltersAtTime(timeline.currentTime());
        if (!filterProperty)
            return;

        target.css("-webkit-filter-margin", filterMargins).css("-webkit-filter", filterProperty.join(" "));
        
        $(document).trigger('update.filter', {
            "target" : target
        });
    }
    
    function computeAnimation(theme) {
        var keyframes = timeline.keyframes(),
            animation = [];
        if (!keyframes || !keyframes.length)
            return animation;
        
        var maxTime = timeline.maxTime();
        
        for (var i=0; i < keyframes.length; ++i) {
            var keyframe = keyframes[i];
            var percent = Math.floor(keyframe.time / maxTime * 100) + "%";
            animation.push(theme.keyframe(percent, getFiltersForKeyframe(keyframes[i].value, theme)));
        }
        
        return animation;
    }

    // Add controls to all the shader items
    $('#menu li').each(function (i, e) {
        var shaderName = e.id;
        var el = $(e);

        var dragPoint = $("<div class='dragpoint' />").appendTo(el);

        var filterConfig = filterConfigs[shaderName];
        
        var configTable = buildParamsControls(filterConfig.params, filterConfig.config, editorValueChanged);
        var configInsert = $("<div class='config'><\/div>").append(configTable.el).appendTo(el);

        defaultKeyframe[shaderName] = filterConfig.params;
        filterConfig.name = shaderName;
        filterConfig.el = el;
        filterConfig.configTable = configTable;
        
        shadersByName[shaderName] = filterConfig;
        shaders.push(filterConfig);
    });
    
    $("#builtin_shaders, #custom_shaders").sortable({
        distance: 15,
        axis: 'y',
        items: 'li',
        handle: '.dragpoint',
        start: function(event, ui) {
            ui.helper.addClass("dragging");
        },
        beforeStop: function(event, ui) {
            ui.helper.removeClass("dragging");
        },            
        update: function(event, ui) {
            var order = 0;
            $('#menu li').each(function (index, el) {
                var shaderName = el.id;
                shadersByName[shaderName].order = order++;
            });
            shaders.sort(function(a, b) { return a.order - b.order; });
            updateFilters();
        }
    });

    $("#builtin_shaders li").disableSelection();
    $("#custom_shaders li").disableSelection();
    
    $('#menu').click(function (evt) {
        if (evt.target.nodeName.toLowerCase() === 'li') {
            toggleShader(evt.target.id);
        }
    });  
     
   
   $("#target_selector").bind("click", toggleSetTargetBehavior);
   
   function toggleSetTargetBehavior(){
       var $button = $("#target_selector"),
           activeStateClass = "active",
           toggle = $button.hasClass(activeStateClass);
        
       if (toggle){
           $button.removeClass(activeStateClass);
           
           //set mouse event listeners on container for target search
           $("#container").unbind("mouseover", targetSearchOver).unbind("mouseout", targetSearchOut).unbind("click", setTarget, true);
       }
       else{
           $button.addClass(activeStateClass); 
           
           // remove mouse event listeners for target search 
           $("#container").bind("mouseover", targetSearchOver).bind("mouseout", targetSearchOut).bind("click", setTarget)
       }
   };
   
   function targetSearchOver(evt){
      $(evt.target).addClass("potentialTarget"); 
   }
   
   function targetSearchOut(evt){
      $(evt.target).removeClass("potentialTarget");    
   } 
   
   function setTarget(evt){ 
       // stop default element behavior on click 
       evt.preventDefault();
       
       // remove target highlight
       targetSearchOut(evt);
       
       // stop searching for a new target;
       toggleSetTargetBehavior();
       
      //reset the old target filters 
       target.css("-webkit-filter", "");

       //set the new target
       target = $(evt.target); 

       //set the filters to the new target
       updateFilters();
    } 

   
    $(document).bind("update.filter", function(e, obj) {
        var filter = getFiltersAtTime(timeline.currentTime(), colorTheme);
        if (!filter)
          return;
        $("#filter-code").html(filter.join("<br />"));

        var animation = computeAnimation(colorTheme);
        if (!animation)
            return;
        $("#animation-code").html(animation.join(""));
    })

    $('#tools_menu1 li').tabToggle($('#tools_panel .content > div'), {selectedClass: "selected"}).bind("click", function(e){
         toggleSlideUpDown($('#tools_panel .content'), true) 
    }); 

    $('#content input').tabToggle($('#container > div'));
    $('#trailer_video').bind('click', function(e) {
        var video = e.target;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    });
    $('#label_content_html').bind('click', function(e) {
        var video = $('#trailer_video')[0];
        if (!video.paused) {
            video.pause();
        }
    })
    
    $('#tools_toggle').bind("click", function(){
        toggleSlideUpDown($('#tools_panel .content'));
        $(this).toggleClass('active')
    })
    
    function toggleSlideUpDown(element, forceSlideUp){
        var $element = $(element),
            state = (typeof forceSlideUp == "boolean")? forceSlideUp : $element.is(':hidden');
        
        if (state){  
            $element.slideDown(150);
        }
        else{ 
            $element.slideUp(300) 
        }
    }
    
    loadFromStorage();
});