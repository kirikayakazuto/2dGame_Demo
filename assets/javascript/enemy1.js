var player_com = require("./player");
var frame_anim = require("./frame_anim");
var utils = require("./utils/utils.js");
var sound_manager = require("./modules/sound_manager");
cc.Class({
    extends: cc.Component,

    properties: {
        

        body: {
            type: cc.RigidBody,
            default: null,
        },
    },
    // play_anim 0 run动画
    // play_anim 1 站立动画
    //           2 受伤动画
    //           3 攻击动画
    //           4 死亡动画 

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 初始化敌人参数
        this.name = enemy1_info.name;
        this.blood_volume = enemy1_info.blood_volume;
        this.fight_volume = enemy1_info.fight_volume;
        this.defense_volume = enemy1_info.defense_volume;

        // 获得玩家脚本
        this.player = cc.find("Canvas/game/player").getComponent(player_com);
    
        
        // 获得帧动画
        this.play_anim = this.node.getComponents(frame_anim);
        // 获得敌人信息面板
        this.enemy_info = cc.find("Canvas/camera/enemy_info");
        
        this.enemy_info.getChildByName("blood_volume_sprite");
        this.enemy_name = this.enemy_info.getChildByName("name").getComponent(cc.Label);
        this.enemy_blood_sprite = this.enemy_info.getChildByName("blood_volume_sprite");
        this.enemy_blood = this.enemy_info.getChildByName("blood_volum").getComponent(cc.Label);
        this.enemy_fight = this.enemy_info.getChildByName("fight_volum").getComponent(cc.Label);
        this.enemy_defense = this.enemy_info.getChildByName("defense_volum").getComponent(cc.Label);


        

        // flag
        this.suffer_flag = 0;
        this.input_flag = utils.random_the(-1, 1);
        this.warning_flag = 0;  // 0 表示敌人处于巡逻状态  1 表示发现玩家 警告状态
        this.fight_flag = 0;
        this.player_suffer_flag = 0;
        this.show_enemy_info_flag = 0;   // 只有flag 为1时 才显示敌人信息
        this.enemy_death_flag = 0;   // flag = 1 表示敌人死亡

        // flag 动画
        this.walk_anim_flag = 0;
        this.stand_anim_flag = 0;
        this.injured_anim_flag = 0;

        
    
    },
    start () {
        // 获得敌人当前的坐标 以及左右边界
        this.pos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        this.left_pos = this.pos.x - 150;
        this.right_pos = this.pos.x + 150;
        // 使用 定时器 播放攻击动画
        this.schedule(function() {
            this._play_fight_anim();
        }.bind(this), utils.random_int(2, 5));

        // 播放发呆动画
        this.schedule(function() {
            this._play_stand_anim();
        }.bind(this), utils.random_int(9, 15));
    },
        


    // 敌人巡逻
    _enemy_patrol() {

    },

    // 播放移动动画
    _play_run_anim() {

        if(this.walk_anim_flag == 0){
            this.stand_anim_flag = 0;
            if(this.input_flag != 0){
                this.play_anim[1].no_play_anim();
                this.play_anim[0].play_loop();
            }
            this.walk_anim_flag = 1;
        }
    },
    // 播放站立动画  每次站立3s  然后随机走向一边
    _play_stand_anim() {
        this.injured_anim_flag = 0;
        if(this.stand_anim_flag == 0){
            this.input_flag = 0;
            this.walk_anim_flag = 0;
            this.play_anim[0].no_play_anim();
            this.play_anim[1].play_loop();
        }
        this.scheduleOnce(function() {
            this.input_flag = utils.random_the(-1, 1);
        }.bind(this), 3);
        this.stand_anim_flag = 1;
    },

    //  攻击动画
    _play_fight_anim() {  // 只有播放攻击动画是 才 判断 是否击中玩家
        if(this.warning_flag == 0 || this.fight_flag == 1 || this.injured_anim_flag == 1) { // 安全
            return ;
        }
        // 等待0.5秒  给玩家格挡的机会
        this.scheduleOnce(function() {
            this.fight_flag = 1;
        }.bind(this), 0.5);

        this.play_anim[0].no_play_anim();
        this.play_anim[1].no_play_anim();
        this.walk_anim_flag = 1;
        this.stand_anim_flag = 1;
        // 播放攻击音效
        sound_manager.play_effect("resources/sounds/enemy_fight_1.mp3");
        this.play_anim[3].play_once(function() {
            this.walk_anim_flag = 0;
            this.stand_anim_flag = 0;
            this.fight_flag = 0;
        }.bind(this));
    },

    // 播放受伤动画, 可供外界调用 攻击无法被打断
    play_injured_anim() {
        if(this.fight_flag == 1) {
            this.fight_flag = 0;
        }
 
        if(this.injured_anim_flag == 0) {
            this.injured_anim_flag = 1;
        
            // 获得玩家攻击力 - 敌人防御力
            this.blood_volume -= (this.player.get_fight_volume() - this.defense_volume);
            
            this.scheduleOnce(function() {
                this.fight_flag = 0;
            }.bind(this), 1);

            if(this.blood_volume <= 0){ // 敌人死亡  播放死亡动画
                
                // console.log("show_enemy_info_flag" + this.show_enemy_info_flag);
                this.blood_volume = 0;
                this.enemy_blood_sprite.width = 0;
                this.play_anim[0].no_play_anim();
                this.play_anim[1].no_play_anim();
                this.play_anim[2].no_play_anim();
                this.play_anim[3].no_play_anim();

                // 禁止播放动画
                this.walk_anim_flag = 1;
                this.stand_anim_flag = 1;
                this.fight_anim_flag = 1;
                this.injured_anim_flag = 1;

                // 禁止行动
                this.input_flag = 0;
                this.fight_flag = 1;
                this.enemy_death_flag = 1;  // 敌人死亡
                this.player_suffer_flag = 1; // 玩家不受攻击
                this.show_enemy_info_flag = 0;  // 不在显示敌人信息
                // 播放死亡音效
                sound_manager.play_effect("resources/sounds/enemy1_death.mp3");
                this.play_anim[4].play_once(function() {
                    // console.log("-----播放动画-----" + this.name);
                    // console.log("enemy_info begin : " + this.enemy_info.active);
                    this.enemy_info.active = false;
                    // console.log("enemy_info end : " + this.enemy_info.active);
                    // this.injured_anim_flag = 0;
                    // this.node.active = false;
                    this.unscheduleAllCallbacks();
                    
                    //this.node.destroy();
                    this.node.getComponent(cc.Sprite).destroy();
                    this.node.getComponent(cc.RigidBody).destroy();
                    // 数量减一
                    map1_info.enemy1_num --;
                    map1_info.player_score += 2;
                    
                    this.destroy();

                    
                    // this.node.removeFromParent(false);
                    //this.node.zIndex = -100;
                }.bind(this));
                return ;
            }

            this.enemy_blood_sprite.width = this.blood_volume * 3;
            if(this.blood_volume <= 10) {
                this.enemy_blood_sprite.color = new cc.Color(255, 0, 0);
            }else {
                this.enemy_blood_sprite.color = new cc.Color(255, 255, 255);
            }

            // 重置当前动画
            this.play_anim[0].no_play_anim();
            this.play_anim[1].no_play_anim();
            this.play_anim[3].no_play_anim();
            this.walk_anim_flag = 0;
            this.stand_anim_flag = 0;
            this.fight_anim_flag = 0;
            this.play_anim[2].play_once(function() {
                // 播放受伤音效
                sound_manager.play_effect("resources/sounds/injued_enemy.mp3");
                this.injured_anim_flag = 0;
            }.bind(this));
        }

        
        
    },

    // -1, 1     -1 表示左移动  1 表示右移动   播放动画
    walk: function(dir) {
        var v = this.body.linearVelocity;
        v.x = 100 * dir;
        this.body.linearVelocity = v;
        this.node.scaleX = dir;
    },
    



    // 受到攻击
    onCollisionEnter: function (other, self) {
        
    },
    // 0.6  0.7  0.9
    // 碰撞持续  0.6秒调用一次
    onCollisionStay: function (other, self) {
        if(this.enemy_death_flag == 1) { // 敌人死亡
            return ;
        }
        if(other.node.groupIndex == 4) { // 武器碰撞到敌人
            // 敌人信息显示bug原因,  在敌人死亡后 又调用了 this.enemy_info.active = true;
            this.enemy_info.active = true;
            this.enemy_name.string = this.name;
            this.enemy_blood.string = this.blood_volume;
            this.enemy_fight.string = this.fight_volume;
            this.enemy_defense.string = this.defense_volume; 
            this.enemy_blood_sprite.width = this.blood_volume * 3;
            if(this.blood_volume <= 10) {
                this.enemy_blood_sprite.color = new cc.Color(255, 0, 0);
            }else {
                this.enemy_blood_sprite.color = new cc.Color(255, 255, 255);
            }

            // 玩家不处于攻击状态
            if(this.player.fight_anim_flag == 0){
                return ;
            }
            // 控制伤害0.6秒激发一次
            if(this.suffer_flag == 1) {
                return ;
            }
            //console.log("--------敌人受到攻击-----" + this.name);
            // 敌人受到攻击 播放受到攻击的动画
            this.suffer_flag = 1;

            //console.log("-----播放动画begin-----" + this.name);
            this.play_injured_anim();
            //console.log("-----播放动画end-----" + this.name);

            this.scheduleOnce(function() {
                this.suffer_flag = 0;
            }.bind(this), 0.6);      
            
        }

        if(other.node.groupIndex == 1) { // 攻击玩家
            if(this.fight_flag != 1) {  // 1表示敌人正在攻击
                return ;
            }
            if(this.player_suffer_flag == 1) {
                return ;
            }

            this.player_suffer_flag = 1;
            // 播放玩家被攻击动画
            this.player.play_injured_anim(this.fight_volume);
            this.scheduleOnce(function() {
                this.player_suffer_flag = 0;
            }.bind(this), 1);

            
        }
    },

  
    update (dt) {
        if (this.input_flag != 0) {  // 奔跑状态 播放奔跑动画
            this.walk(this.input_flag);
            this._play_run_anim();   // 奔跑是 随机停顿
            
        }else if(this.input_flag == 0) { // 保持站立状态
            
        }
        // begin
        // 获得玩家结点位置
        this.player_pos = cc.find("Canvas/game/player").convertToWorldSpaceAR(cc.v2(0, 0));
        this.pos = this.node.convertToWorldSpaceAR(cc.v2(0, 0));
        var distance_x = this.pos.x - this.player_pos.x;
        var distance_y = this.pos.y - this.player_pos.y;
        if(distance_y < 0) {
            distance_y = -distance_y;
        }
        
        if(this.warning_flag == 1) { // 追击玩家
            if(distance_x < 0)     {
                this.input_flag = 1;
            }else if(distance_x > 0){
                this.input_flag = -1;
            }
        }

        if(distance_x < 0) {
            distance_x = -distance_x;
        }

        if(distance_x < 250 && distance_y < 120) { // 玩家与敌人 距离小于安全距离 触发敌人追击玩家 显示敌人信息
            this.warning_flag = 1;
            this.show_enemy_info_flag = 1; 
        }

        if(distance_x > 250 || distance_y > 150) { // 玩家与敌人 距离大于安全距离
            this.warning_flag = 0;
            this.show_enemy_info_flag = 0; 
        }   
        // 获得玩家是否死亡
        if(this.player.death_flag == 1) {
           
            this.warning_flag = 0;
        }

        if(this.pos.x <= this.left_pos && this.warning_flag == 0){
            this.input_flag = 1;
        }else if(this.pos.x >= this.right_pos && this.warning_flag == 0){
            this.input_flag = -1;
        }

        /*
        if (this.show_enemy_info_flag == 1) {
            console.log("-----show_info  begin-----" + this.name);
            this.enemy_info.active = true;
            // 更新敌人信息面板
            this.enemy_name.string = this.name;
            this.enemy_blood.string = this.blood_volume;
            this.enemy_fight.string = this.fight_volume;
            this.enemy_defense.string = this.defense_volume;      
        }else if(this.show_enemy_info_flag == 0) {
            
            this.enemy_info.active = false;
        }
        */
    },
});
