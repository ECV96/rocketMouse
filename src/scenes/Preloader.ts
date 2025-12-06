import Phaser from 'phaser'

import TextureKeys from '../consts/TextureKeys'
import SceneKeys from '../consts/SceneKeys'
import AnimationKeys from '../consts/AnimationKeys'

export default class Preloader extends Phaser.Scene {
    constructor() {
        super(SceneKeys.Preloader)
    }

    preload() {
        this.load.image(TextureKeys.Background, 'assets/house/bg_repeat_340x640.png')
        this.load.image(TextureKeys.MouseHole, 'assets/house/object_mousehole.png')
        this.load.image(TextureKeys.Window1, 'assets/house/object_window1.png')
        this.load.image(TextureKeys.Window2, 'assets/house/object_window2.png')
        this.load.image(TextureKeys.Bookcase1, 'assets/house/object_bookcase1.png')
        this.load.image(TextureKeys.Bookcase2, 'assets/house/object_bookcase2.png')
        this.load.atlas(TextureKeys.RocketMouse, 'assets/character/rocket-mouse.png', 'assets/character/rocket-mouse.json')
        this.load.image(TextureKeys.LaserEnd, 'assets/house/object_laser_end.png')
        this.load.image(TextureKeys.LaserMiddle, 'assets/house/object_laser.png')
        this.load.image(TextureKeys.Coin, 'assets/house/object_coin.png')
    }

    create() {
        this.anims.create({
            key: AnimationKeys.RocketMouseRun,
            frames: this.anims.generateFrameNames(TextureKeys.RocketMouse, {
                start: 1,
                end: 4,
                prefix: 'rocketmouse_run',
                zeroPad: 2,
                suffix: '.png'
            }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: AnimationKeys.RocketMouseFall,
            frames: [{ key: TextureKeys.RocketMouse, frame: 'rocketmouse_fall01.png' }]
        })

        this.anims.create({
            key: AnimationKeys.RocketMouseFly,
            frames: [{ key: TextureKeys.RocketMouse, frame: 'rocketmouse_fly01.png' }]
        })

        this.anims.create({
            key: AnimationKeys.RocketMouseFlamesOn,
            frames: this.anims.generateFrameNames(TextureKeys.RocketMouse, {
                start: 1,
                end: 2,
                prefix: 'flame',
                zeroPad: 2,
                suffix: '.png'
            }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: AnimationKeys.RocketMouseDead,
            frames: this.anims.generateFrameNames(TextureKeys.RocketMouse, {
                start: 1,
                end: 2,
                prefix: 'rocketmouse_dead',
                zeroPad: 2,
                suffix: '.png'
            }),
            frameRate: 10
        })

        this.scene.start(SceneKeys.Game)
    }
}