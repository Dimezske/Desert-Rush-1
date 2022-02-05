import Phaser from '../lib/phaser.js'

export default class GameCharacter extends Phaser.GameObjects.Container {
    private bodyWidthFlipOffsetX = 0.4;
    body: Phaser.Physics.Arcade.Body;
  
    private charBody: Phaser.GameObjects.Sprite;
    private charWeapon: Phaser.GameObjects.Sprite;
  
    constructor(scene: Phaser.Scene, x: number, y: number, characterId: string) {
      super(scene, x, y);
  
      this.charBody = scene.add.sprite(0, 0, "astro", "astro-red-idle_armed-6.png");
      this.charBody.anims.play("astro-red-idle");
      this.setSize(this.charBody.width, this.charBody.height); // DO THIS
      this.add(this.charBody);
  
      this.charWeapon = scene.add.sprite(0, 0, "astro", "astro-gun02_still1.png");
      this.add(this.charWeapon);
      
    }
    
  }