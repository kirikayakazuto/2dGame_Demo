cc.Class({
    extends: cc.Component,

    
    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        // 帧动画的图片, 多张图片, 
        sprite_frames: {
            default: [],
            type: cc.SpriteFrame, 
        },

        duration: 0.1, // 帧的时间间隔

        loop: false, // 是否循环播放;

        play_onload: false, // 是否在加载的时候就开始播放;
    },

    // use this for initialization
    onLoad: function () {
        this.end_func = null;
        this.is_playing = false; // 加一个变量
        this.play_time = 0; // 播放的时间

        // 获得了精灵组件
        this.sprite = this.getComponent(cc.Sprite);
        if (!this.sprite) {
            this.sprite = this.addComponent(cc.Sprite);
        }
        // end

        if (this.play_onload) { // 如果在加载的时候开始播放
            if (this.loop) { // 循环播放
                this.play_loop();
            }
            else { // 播放一次
                this.play_once(null);
            }
        } 
    },

    play_loop: function() {
        if (this.sprite_frames.length <= 0) {
            return;
        }

        this.loop = true;
        this.end_func = null;

        this.is_playing = true; // 正在播放
        this.play_time = 0; // 播放的时间

        this.sprite.spriteFrame = this.sprite_frames[0];
    },

    no_play_loop: function() {
        this.loop = false;
    },

    // 需要播放结束以后的回掉, end_func
    play_once: function(end_func) {
        if (this.sprite_frames.length <= 0) {
            return;
        }
        
        this.end_func = end_func;
        this.loop = false;
        this.is_playing = true; // 正在播放
        this.play_time = 0; // 播放的时间

        this.sprite.spriteFrame = this.sprite_frames[0];
    },

    // 停止播放动画
    no_play_anim: function() {
        this.is_playing = false;
    },

    // called every frame, uncomment this function to activate update callback
    // 每次游戏刷新的时候
    update: function (dt) {
        if(!this.is_playing) {
            return;
        }

        this.play_time += dt; // 当前我们过去了这么多时间;
        var index = Math.floor(this.play_time / this.duration);

        // 非循环播放
        if (!this.loop) {
            if (index >= this.sprite_frames.length)  { // 如果超过了，播放结束
                this.is_playing = false;
                if (this.end_func) {
                    this.end_func();
                }
            }
            else {
                this.sprite.spriteFrame = this.sprite_frames[index]; // 修改当前时刻显示的正确图片;
            }
        }
        else { // 循环播放
            while(index >= this.sprite_frames.length) {
                index -= this.sprite_frames.length;
                this.play_time -= (this.sprite_frames.length * this.duration);
            }
            this.sprite.spriteFrame = this.sprite_frames[index];
        }
    },

});
