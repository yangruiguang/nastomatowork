
$(function(){

    var planTime,
        timer,
        startTime,
        stopTime,
        text,
        currentTaskId,
        currentTask,
        pastTomatoNum;

    var remainTimeEl = $("#remainTime"),
        startWorkButton = $("#startWorkButton"),
        endWorkButton = $("#endWorkButton"),
        endTaskButton = $("#endTaskButton"),
        progressBarBox = $("#progressBarBox"),
        progressBar = $("#progressBar"),

    text = {
        siteTitle : "TomatoWork",
        workTimeUp: "鎭枩浣狅紝浣犲張瀹屾垚浜嗕竴涓暘鑼勯挓锛屼紤鎭竴涓嬪惂锛�",
        restTimeUp: "浼戞伅瀹屼簡鍝︼紝璧跺揩鍥炴潵宸ヤ綔鍚э紒",
        warnText: "浣犳湁姝ｅ湪杩涜鐨勭暘鑼勫伐浣滃畾鏃讹紝濡傛灉绂诲紑鏈〉灏嗕細鏀惧純姝ょ暘鑼勯挓",
        noticeTimeUp: "褰撳墠鐣寗閽熸椂闂村凡鍒�,浼戞伅涓€涓嬪惂锛�"
    };

    var getTime = function(t){
        return t*1000;
    }
    var planStart = function(t){
        planTime = t;
        startTime = +new Date();
        stopTime = startTime + planTime;
    }
    var startTiming = function(t){
        if(!Task.config.isTiming){
            
            Task.config.isTiming=true;
            planStart(t);
            
            if(!Task.config.autoplay && Task.config.working ){
                TW.task.dostatus(Task.config.taskid,'doing');
            }
    
            $(progressBarBox).addClass("active");
        
            if(Task.config.working){
                $(remainTimeEl).addClass('remainTimeWork');
                $('#progressBar').removeClass().addClass('progress-bar progress-bar-info');
            }else{
                $(remainTimeEl).addClass('remainTimeRest');
                $('#progressBar').removeClass().addClass('progress-bar progress-bar-success');
            }
            
            $(startWorkButton).addClass("disabled");
            $(endWorkButton).removeClass("disabled");
            updateProgress();
            timer = setInterval(updateProgress, 1000);

        }
    }


    var updateProgress = function(){
    
        var now = +new Date();
        var remainTime = Math.round((stopTime - now)/1000);
        var nM=Math.floor(remainTime/(60));
        var nS=Math.floor(remainTime) % 60;  
        
        //console.log(remainTime);
        
        if(remainTime >= 0){
        
            var progress = remainTime / (planTime/1000);
            var remainTimeText = (nM  < 10 ? '0'+nM : nM) + ":" + (nS < 10 ? '0'+nS : nS);
            remainTimeEl.text(remainTimeText);
            progressBar.attr('style', 'width:'+progress*100+'%');
            
            document.title = remainTimeText + " 鍊掕鏃� - " + text.siteTitle;

        }else{
            timeComing();
        }

    }

    var timeComing = function(){
        stopTiming();
        timeCall() != '' ? preStartTiming() : preEndTiming();

    }
    
    var timeCall = function(){
        
        if(Task.config.working){
            
            TW.task.dostatus(Task.config.taskid,'stop');
            if( Task.config.tomatoTotal > pastTomatoNum ){
                var msg = text.workTimeUp;
                Task.config.desktop_notice && sendNotification(text.noticeTimeUp);
            }else{
                var msg = '';
            }
            
        }else{
            var msg = text.restTimeUp;
        }
        msg != '' && alert(msg);
        
        return msg;
    }
    
    var preStartTiming = function(){
        
        if(Task.config.working){
            Task.config.autoplay = 0;
            Task.config.working = 0;
            Task.config.workstatus = 2;
            startWorkButtonHander();
            
        }else{
            Task.config.autoplay = 0;
            Task.config.working = 1;
            Task.config.workstatus = 0;
            startWorkButtonHander();
        }
        
    }
    
    var preEndTiming = function(){

        alert('鎮ㄨ緵鑻︿簡!'); // 鍙互鍦ㄦ祻瑙堝櫒鏈€灏忓寲鏃舵渶澶у寲鏄剧ず娴忚鍣�
        
        Task.config.autoplay = 0;
        $(startWorkButton).addClass("disabled");
        $('#confirmModal').modal('show');
    
    }
    
    var stopTiming = function(){
        clearTimeout(timer);
        
        document.title = text.siteTitle;
        $(progressBarBox).removeClass("active");
        $(remainTimeEl).removeClass("remainTimeActive");
        $(startWorkButton).removeClass("disabled");
        
        if(Task.config.working){
            setTomatoIcon();
        }
        
        Task.config.isTiming=false;
    }
    
    var startWorkButtonHander = function(){
        if(!Task.config.isTiming){
            
            if( Task.config.tomatoTotal <=  Task.config.pastTomatoNum ){
                return false;
            }
        
            if( Task.config.autoplay ){
                var workTime = getTime(Task.config.remain);
            }else{
                var workTime = Task.config.working ? getTime(Task.config.worklong) : getTime(Task.config.restlong);
            }
            
            if( Task.config.workstatus == 1 || Task.config.workstatus == 3 ){
                Task.config.workstatus = Task.config.working ? 0 : 2;
            }
            
            $('.visible-desktop').text('- '+ Task.config.subtitle[Task.config.workstatus]);
            
            startTiming(workTime);
        }
    }
    
    var endWorkButtonHander = function(){
        TW.task.dostatus(Task.config.taskid,'discard');
    }
    
    var endTaskButtonHander = function(){
        TW.task.dostatus(Task.config.taskid,'dropout');
    }
    

    $(startWorkButton).on("click", startWorkButtonHander);
    
    $(endWorkButton).on("click", endWorkButtonHander);
    
    $(endTaskButton).on("click", endTaskButtonHander);
    
    
    $(window).on("beforeunload", function(e){
        if(Task.config.isTiming){
            if (e) {
                e.returnValue = text.warnText ;
            }
            return text.warnText;
        }
    });

});
