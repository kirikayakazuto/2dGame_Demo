var frame_anim = require("./frame_anim");
var sound_manager = require("./modules/sound_manager");
var game_scene = require("./game_scene.js");
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        body: {
            type: cc.RigidBody,
            default: null,
        },

    },

    // play_anim 0 跑步
    //           1 站立
    //           2  跳跃
    //           3 , 4 , 5 连斩攻击
    //           6 格挡
    //           7 受伤
    //           8 死亡
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 代码获取
        // this.body = this.node.getComponent(cc.RigidBody);
        // end 
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.on_key_down.bind(this), this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.on_key_up.bind(this), this);
        this.play_anim = this.node.getComponents(frame_anim);

        this.player_info_panle = cc.find("Canvas/camera/player_info");
        
        this.blood_volum = this.player_info_panle.getChildByName("blood_volum").getComponent(cc.Label);
        this.fight_volum = this.player_info_panle.getChildByName("fight_volum").getComponent(cc.Label);
        this.defense_volum = this.player_info_panle.getChildByName("defense_volum").getComponent(cc.Label);
        this.blood_sprite_node = this.player_info_panle.getChildByName("blood_volume_sprite");

        // 结算窗口
        this.game_scene = cc.find("Canvas").getComponent(game_scene);;
        // flag 状态
        this.death_flag = 0;

        // flag 动作
        this.input_flag = 0;
        this.jump_flag = 0;  
        this.fight_flag = 0;
        this.defense_flag = 0;
        this.injured_flag = 0;

        // flag 动画
        this.walk_anim_flag = 0;  // 0 表示进入 1表示无法进入
        this.stand_anim_flag = 0;
        this.jump_anim_flag = 0;
        this.fight_anim_flag = 0;
        this.defense_anim_flag = 0;
        this.injured_anim_flag = 0;

        // flag  连击
        this.fight_one = 0;
        this.fight_two = 0;
        this.fight_three = 0;
    },

    start () {

    },

    // 血量   100点  公开的接口 供别人掉用
    get_blood_volume: function() {
        return player_info.blood_volume;
    },
    // 攻击力 20
    get_fight_volume() {
        return player_info.fight_volume;
    },

    // 防御力
    get_defense_volume: function() {
        return player_info.defense_volume;
    },

    // 血量   100点  公开的接口 供别人掉用
    set_blood_volume: function(a) {
        player_info.blood_volume = a;
    },
    // 攻击力 20
    set_fight_volume: function(a) {
        player_info.fight_volume = a;
    },

    // 防御力
    set_defense_volume: function(a) {
        player_info.defense_volume;
    },


    
    // 触地  才能再次跳跃
    onBeginContact: function (contact, selfCollider, otherCollider) {
        if(otherCollider.tag == 1) { // 空气墙
            return ;
        }

        if(otherCollider.tag == 2) { // 调入陷阱 弹出结算窗口

            this.injured_flag = 0;
            this.node.active = false;
            // 玩家死亡
            this.death_flag = 1;
            // 弹窗结算窗口
            //this.menu.active = true;
            this.game_scene.show_menu();
        }
        // 跳上障碍物
        if(this.jump_flag == 1){
            this.play_anim[2].no_play_anim();
        }
        this.jump_flag = 0;
    },

    jump: function() {
        if(this.jump_flag == 1){
            return ;
        }
        var v = this.body.linearVelocity;
        v.y = 1000;
        this.body.linearVelocity = v;
        this.jump_flag = 1;
        this._play_jump_anim();
    },

    // -1, 1     -1 表示左移动  1 表示右移动   播放动画
    walk: function(dir) {
        
        var v = this.body.linearVelocity;
        v.x = 200 * dir;
        this.body.linearVelocity = v;
        this.node.scaleX = dir;
        
    },
    // 播放跑步动画
    _play_run_anim() {
        if(this.walk_anim_flag == 0){
            this.stand_anim_flag = 0;
            if(this.input_flag != 0){
                this.play_anim[1].no_play_anim();
                this.play_anim[0].play_loop();
            }
        }
        this.walk_anim_flag = 1;
        
    },
    // 播放站立动画
    _play_stand_anim() {

        if(this.stand_anim_flag == 0){
            this.walk_anim_flag = 0;
            this.play_anim[0].no_play_anim();
            this.play_anim[1].play_loop();
        }

        this.stand_anim_flag = 1;
        
    },

    // 播放跳跃 动画
    _play_jump_anim() {
        if(this.jump_anim_flag == 0){
            this.play_anim[2].play_once();
        }
    },

    // 播放攻击动画    共三连击  按一次攻击键 释放一连击
    _play_fight_anim() {
        if(this.injured_flag == 1) {
            this.injured_flag = 0;
        }
        
        if(this.fight_anim_flag == 0){
            this.fight_anim_flag = 1;
            // 播放攻击音效
            sound_manager.play_effect("resources/sounds/fight_2.mp3");
            this.play_anim[3].play_once(function() {

                if(this.fight_two == 1) {
                    sound_manager.play_effect("resources/sounds/fight_2.mp3");
                    this.play_anim[4].play_once(function() {

                        if(this.fight_three == 1){
                            // 播放攻击音效
                            sound_manager.play_effect("resources/sounds/fight_3.mp3");
                            //跳跃
                            this.jump();
                            this.play_anim[5].play_once(function() {
                                
                                this.fight_three = 0;
                                this.fight_two = 0;
                                this.fight_anim_flag = 0;        
                            }.bind(this));
                        }else {
                            this.fight_two = 0;
                            this.fight_anim_flag = 0;
                        }
                        
                    }.bind(this));
                }else {
                    this.fight_anim_flag = 0;
                }
                
            }.bind(this));
            return ;
        }

        // 第一次攻击没结束, 又进行攻击
        if(this.fight_anim_flag == 1 && this.fight_two == 0){
            this.fight_two = 1;
            return ;
        }

        if(this.fight_two == 1 && this.fight_three == 0){
            this.fight_three = 1;
            return ;
        }
        
    },

    // 播放格挡动画  2s只能格挡一次  处于格挡状态不掉血
    _play_defense_anim() {
        if(this.defense_flag == 0) {
            this.defense_flag = 1;
            // 重置所有动画
            this.play_anim[3].no_play_anim();
            this.play_anim[4].no_play_anim();
            this.play_anim[5].no_play_anim();
            this.fight_three = 0;
            this.fight_two = 0;
            this.fight_anim_flag = 0; 
            // end

            this.play_anim[6].play_once(function() {    

            }.bind(this));
            this.scheduleOnce(function() {
                this.defense_flag = 0;
            }.bind(this), 2);
        }
        
    },

    // 播放受伤动画, 可供外界调用
    play_injured_anim(fight_volume) {

        if(this.defense_flag == 1) { // 格挡状态 不掉血 不播放动画
            // 播放格挡音效
            sound_manager.play_effect("resources/sounds/defense.mp3");
            return ;
        }
        if(this.injured_flag == 0) {
            this.injured_flag = 1;
            // 播放受伤音效
            sound_manager.play_effect("resources/sounds/player_injude.mp3");
            //执行掉血
            var last_volume = this.get_blood_volume() - (fight_volume - this.get_defense_volume());
            if(last_volume <= 0) {
                this.set_blood_volume(0); 
                this.blood_volum.string = 0;
                this.blood_sprite_node.width = 0;
                this.play_anim[3].no_play_anim();
                this.play_anim[4].no_play_anim();
                this.fight_two = 0;
                this.fight_anim_flag = 0; 

                this.play_anim[8].play_once(function() {
                    // this.injured_flag = 0;
                    this.node.active = false;
                    // 玩家死亡
                    this.death_flag = 1;

                    // 弹窗结算窗口
                    //this.menu.active = true;
                    this.game_scene.show_menu();

                }.bind(this));

                return ;
            }
            // 设置血量
            this.set_blood_volume(last_volume);
            this.blood_volum.string = this.get_blood_volume();
            this.blood_sprite_node.width = this.get_blood_volume() * 3;
            if(this.get_blood_volume() <= 30) {
                this.blood_sprite_node.color = new cc.Color(255, 0, 0);
            }
            
            // 在第3段攻击是 受伤不播放受伤动画, 仅扣血
            if(this.fight_three == 1) {
                return ;
            }
            // 重置当前动画  受伤时不允许跑步站立
            this.play_anim[0].no_play_anim();
            this.play_anim[1].no_play_anim();
            this.play_anim[2].no_play_anim();
            this.play_anim[3].no_play_anim();
            this.play_anim[4].no_play_anim();
            // 播放受伤动画是不允许其他任何操作
            
            this.walk_anim_flag = 1;
            this.stand_anim_flag = 1;
            this.jump_anim_flag = 1;

            this.play_anim[7].play_once(function() {

                this.walk_anim_flag = 0;
                this.stand_anim_flag = 0;
                this.jump_anim_flag = 0;
                this.fight_two = 0;
                this.fight_anim_flag = 0; 

                this.injured_flag = 0;
            }.bind(this));
        }

        
        
    },

    // 把
    // 响应按键事件   分等级  一段跳  二段跳
    // 向左移动  left 和 a  向右移动  rigth 和 d  跳跃 空格 和 w   s dowm  格挡 格挡不受伤害
    on_key_down: function(e) {
        switch(e.keyCode) {
            // 向左移动  left 和 a  向右移动  rigth 和 d  跳跃 空格 和 w
            case cc.KEY.left:
            case cc.KEY.a:
                this.input_flag = -1;
                this._play_run_anim();
            break;

            case cc.KEY.right:
            case cc.KEY.d:
                this.input_flag = 1;
                this._play_run_anim();
            break;

            case cc.KEY.q:
            this.play_injured_anim();
            break;

            // 攻击按键  j
            case cc.KEY.j:
                this._play_fight_anim();
            break;

            case cc.KEY.down:
            case cc.KEY.s:
                this._play_defense_anim();
            break;

            case cc.KEY.space:
            case cc.KEY.w:
                this.jump();
            break;
        }
    },

    on_key_up: function(e) {  // 松开键盘 停止   播放站立动画
        switch(e.keyCode) {
            case cc.KEY.left:
            case cc.KEY.a:
                if(this.input_flag == -1){
                    this.input_flag = 0;
                    this._play_stand_anim();
                }
            break;
            case cc.KEY.right:
            case cc.KEY.d:
            if(this.input_flag == 1){
                this.input_flag = 0;
                this._play_stand_anim();
            }
            break;

            case cc.KEY.space:
            break;
        }
    }, 

    update (dt) {
        if (this.input_flag != 0) {  // 奔跑状态 播放奔跑动画
            this.walk(this.input_flag);
            
        }else if(this.input_flag == 0) { // 保持站立状态
            
        }
    },
});
