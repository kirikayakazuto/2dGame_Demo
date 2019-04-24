var sound_manager = require("./modules/sound_manager");
var utils = require("./utils/utils.js");
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
        enemy1_Prefab: {
            default: null,
            type: cc.Prefab,
        },
        enemy2_Prefab: {
            default: null,
            type: cc.Prefab,
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // 播放背景音乐;
        sound_manager.play_music("resources/sounds/game_fight_bg.mp3", "loop");
        // end
        // 获得菜单结点
        this.menu = cc.find("Canvas/camera/menu");
        this.menu_score = this.menu.getChildByName("bg").getChildByName("score").getChildByName("num").getComponent(cc.Label);
        // 获得敌人结点
        this.enemy = cc.find("Canvas/game/enemy1");

        // flag
        this.restart_flag = 0;
        this.map1_wave_flag = 0;  // 判断现在是第几波攻击
    },

    start () {
        
    },

    // 产生新的敌人
    add_enemy_by_map1: function(wave_flag) {
        
        this.scheduleOnce(function() {
            map1_info.enemy1_num = map1_info.wave[wave_flag].enemy1_num;
            map1_info.enemy2_num = map1_info.wave[wave_flag].enemy2_num;
            for(var i=1; i<=map1_info.wave[wave_flag].enemy1_num; i++) {
                var node = cc.instantiate(this.enemy1_Prefab);
                node.parent = this.enemy;
                if(i == 1) {
                    node.setPosition(-292, -292);
                }else if(i == 2) {
                    node.setPosition(64, -276);
                }else if(i == 3) {
                    node.setPosition(512, -300);
                }else if(i == 4) {
                    node.setPosition(1224, -147);
                }
                
            }
            var tmp = i;
            for(; i<=map1_info.wave[wave_flag].enemy2_num + tmp -1; i++) {
                var node = cc.instantiate(this.enemy2_Prefab);
                node.parent = this.enemy;
                if(i == 1) {
                    node.setPosition(-292, -292);
                }else if(i == 2) {
                    node.setPosition(64, -276);
                }else if(i == 3) {
                    node.setPosition(512, -300);
                }else if(i == 4) {
                    node.setPosition(1224, -147);
                }
                
            }

            this.restart_flag = 0;
            
        }.bind(this), 2);

        
    },

    // show_menu
    show_menu: function() {
        this.menu_score.string = map1_info.player_score;
        this.menu.active = true;
    },

    update (dt) {
        if(this.restart_flag == 0) {
            if(map1_info.enemy1_num == 0 && map1_info.enemy2_num == 0) { // 当前没有敌人
                this.enemy.removeAllChildren();
                if(this.map1_wave_flag < map1_info.wave.length) {
                    this.restart_flag = 1;
                    this.add_enemy_by_map1(this.map1_wave_flag);
                    this.map1_wave_flag ++;
                    
                }else {
                    this.show_menu();
                    this.restart_flag = 1;
                }
            }
        }
    },
});
