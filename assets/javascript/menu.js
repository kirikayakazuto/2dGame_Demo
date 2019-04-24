
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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.active = false;
    },

    start () {

    },

    restart_button: function() {
        player_info.blood_volume = 100;
        map1_info.enemy1_num = 0;
        map1_info.enemy2_num = 0;
        map1_info.player_score = 0;
        cc.director.loadScene("game");
    },

    // update (dt) {},
});
