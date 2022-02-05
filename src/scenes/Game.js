import Phaser from '../lib/phaser.js'

import Ball from '../game/Ball.js'
import Gem from '../game/Gem.js'

var upKey;
var downKey;
var leftKey;
var rightKey;
var wKey;
var sKey;
var aKey;
var dKey;

export default class Game extends Phaser.Scene
{
	/** @type {Phaser.Physics.Arcade.StaticGroup} */
	platforms
	/** @type {Phaser.Physics.Arcade.Sprite} */
	player
	/** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
	cursors
	controls
	/** @type {Phaser.Physics.Arcade.Group} */
	balls
	ballsCollected = 0
	gems
	gemsCollected = 0
	/** @type {Phaser.GameObjects.Text} */
	ballsCollectedText
	GemsCollectedText

	popUpMessage
	isClinging = false
	schimitar
	constructor()
	{
		super('game')
	}

	init()
	{
		
		this.ballsCollected = 0
		this.gemsCollected = 0
	}

	preload()
	{
		this.load.image('background', 'assets/desert-bg1.png')
		this.load.image('platform', 'assets/ground_sand_broken.png')
		this.load.image('character', 'assets/character-1.png')

		this.load.spritesheet('character_walk-left', 'assets/ani/character_walking-left.png.pxo'),
		{ frameWidth: 70, frameHeight: 80 }
		this.load.spritesheet('character_walk-right', 'assets/ani/character_walking-right.png.pxo'),
		{ frameWidth: 70, frameHeight: 80 }
		
		this.load.image('gem', 'assets/gem.png')
		this.load.image('ball', 'assets/ball.png')
		this.load.audio('jump', 'assets/sfx/jump.wav')
		this.load.audio('powerup', 'assets/sfx/powerup.wav')
		this.load.audio('dead', 'assets/sfx/playerdied.mp3')
		this.load.audio('cling', 'assets/sfx/cling.wav')

		this.cursors = this.input.keyboard.createCursorKeys()
		
		this.load.spritesheet('player', 'assets/spritesheet/characterSheet.png', {
			frameWidth: 60,
			frameHeight: 80
		});
		//this.load.spritesheet('player_Schimitar', 'assets/schimitar.png', {
		//	frameWidth: 60,
		//	frameHeight: 200
		//});
	}

	create()
	{
		this.add.image(240, 320, 'background')
			.setScrollFactor(1, 0)

		this.platforms = this.physics.add.staticGroup()

		// then create 5 platforms from the group
		for (let i = 0; i < 5; ++i)
		{
			const x = Phaser.Math.Between(80, 400)
			const y = 150 * i
	
			/** @type {Phaser.Physics.Arcade.Sprite} */
			const platform = this.platforms.create(x, y, 'platform')
			platform.scale = 0.5
	
			/** @type {Phaser.Physics.Arcade.StaticBody} */
			const body = platform.body
			body.updateFromGameObject()
		}

		this.player = this.physics.add.sprite(240, 320, 'character')
			.setScale(0.7)

		//this.schimitar = this.physics.add.sprite(player.x, player.y, 'schimitar')
			//.setScale(1)
		

		this.physics.add.collider(this.platforms, this.player)
		
		this.player.body.checkCollision.up = true
		this.player.body.checkCollision.left = true
		this.player.body.checkCollision.right = true
		this.player.body.checkCollision.down = true

		//this.player = this.physics.add.sprite(100, 450, 'character_walk');
		this.player.setBounce(0.2);
		this.player.setCollideWorldBounds(false);

		//this.schimitar.setBounce(0.2);
		//---------------Player Animation------------------------------
		this.anims.create({
    		key: 'left',
   		    frames: this.anims.generateFrameNumbers('player', { start: 1, end: 3 }),
    		frameRate: 10,
    		repeat: -1
		});

		this.anims.create({
    		key: 'turn',
    		frames: [ { key: 'player', frame: 0 } ],
    		frameRate: 20
		});

		this.anims.create({
    		key: 'right',
    		frames: this.anims.generateFrameNumbers('player', { start: 4, end: 6 }),
    		frameRate: 10,
    		repeat: -1
		});

		this.anims.create({
    		key: 'clingleft',
    		frames: [ { key: 'player', frame: 10 } ],
    		frameRate: 20
		});
		this.anims.create({
    		key: 'clingright',
    		frames: [ { key: 'player', frame: 11 } ],
    		frameRate: 20
		});
		this.anims.create({
    		key: 'turn',
    		frames: [ { key: 'player', frame: 0 } ],
    		frameRate: 20
		});
		//------------------Schimitar animation--------------------------
		//this.anims.create({
    	//	key: 'left',
    	//	frames: [ { key: 'schimitar', frame: 2 } ],
    	//	frameRate: 20
		//});
		//this.anims.create({
    	//	key: 'right',
    	//	frames: [ { key: 'schimitar', frame: 3 } ],
    	//	frameRate: 20
		//});
		//-------------------------------------------------------------
		this.cameras.main.startFollow(this.player)
		this.cameras.main.setDeadzone(this.scale.width * 1.5)

		this.balls = this.physics.add.group({
			classType: Ball
		})
		this.gems = this.physics.add.group({
			classType: Gem
		})

		this.physics.add.collider(this.platforms, this.carrot)
		this.physics.add.overlap(this.player, this.balls, this.handleCollectBall, undefined, this)
		this.physics.add.collider(this.platforms, this.gem)
		this.physics.add.overlap(this.player, this.gems, this.handleCollectGem, undefined, this)
		this.ballsCollectedText = this.add.text(240, 10, 'Balls: 0', { color: 'white', fontSize: 24 })
			.setScrollFactor(0)
			.setOrigin(0.5, 0)
		this.gemsCollectedText = this.add.text(240, 10, 'Gems: 0', { color: 'green', fontSize: 24 })
			.setScrollFactor(0)
			.setOrigin(2, 0)
		
	}

	update(t, dt)
	{
		if (!this.player)
		{
			return
		}
		
		this.platforms.children.iterate(child => {
			/** @type {Phaser.Physics.Arcade.Sprite} */
			const platform = child

			const scrollY = this.cameras.main.scrollY
			if (platform.y >= scrollY + 700)
			{
				platform.y = scrollY - Phaser.Math.Between(50, 90)
				platform.body.updateFromGameObject()
				this.addBallAbove(platform),
				this.addGemAbove(platform).setScale(0.7)
			}
		})

		//--------------------Movement--------------------------
		
		if (this.cursors.left.isDown)
		{
    		this.player.setVelocityX(-160);

    		this.player.anims.play('left', true);

			//this.schimitar.anims.play('left');
		}
		else if (this.cursors.right.isDown)
		{
    		this.player.setVelocityX(160);

    		this.player.anims.play('right', true);

			//this.schimitar.anims.play('right');
		}
		else
		{
    		this.player.setVelocityX(0);

    		this.player.anims.play('turn');
		}

		if (this.cursors.up.isDown && this.player.body.touching.down)
		{
			this.sound.play('jump')
   		 	this.player.setVelocityY(-330);
		}
		//-------------------------------------------------------
		
	   const clingKeys = this.input.keyboard.addKeys({
		'clingOn': Phaser.Input.Keyboard.KeyCodes.W,
		'clingOff': Phaser.Input.Keyboard.KeyCodes.S
		
	   });
	   //------------cliffhanging------------------------
	 	
		
	   if(clingKeys['clingOn'].isDown )
	   {
		console.log('is clinging')
		this.player.setAcceleration(0,0)	
	   }
	   if(clingKeys['clingOff'].isDown)
	   {	
			console.log('is not clinging')
			this.player.setAcceleration(0,0)	
	   }
		
		if(clingKeys['clingOn'].isDown && this.player.body.touching.left)
			{
				this.isClinging = true
				this.player.setVelocityY(0,0),
				this.player.setVelocityX(0,0),
				this.player.anims.play('clingleft');
				if (this.isClinging){
					this.player.anims.play('left',false);
				}
			}
			if(clingKeys['clingOn'].isDown && this.player.body.touching.right)
			{
				this.isClinging = true
				this.player.setVelocityY(0,0),
				this.player.setVelocityX(0,0),
				this.player.anims.play('clingright');
				if (this.isClinging){
					this.player.anims.play('right',false);
				}
			}
		
				
		if(clingKeys['clingOn'].isDown && this.physics.add.overlap(this.player, this.platforms)) 
		{
			this.player.setAcceleration(0,0)
		}
		
		function cliffHang()
		{
			//
			//isTouchingPlatform = true
			//this.popUpMessage.text = `Press 'w' to cling`

			if (clingKeys['clingOn'].isDown && this.player.body.touching.left && this.cursors.up.isDown)
			{
				this.sound.play('cling')
   		 		
					if(this.cursors.up.isDown)
					{
						climbUp();
					}
			}
			else if (clingKeys['clingOn'].isDown && this.player.body.touching.right && this.cursors.up.isDown)
			{
				this.sound.play('cling')
   		 		this.player.setVelocityY(-50)
					if(this.cursors.up.isDown)
					{
						climbUp();
					}
			}
			else if (clingKeys['clingOff'].isDown)
			{
				this.player.setAcceleration(0,50)
				this.player.setVelocityY(50)
			}
		}
		function climbUp(){
			this.player.setAcceleration(0,-50)
				this.player.setVelocityY(-s50)
		}
		/*
		else if(clingKeys['clingOff'].isDown && this.physics.add.overlap(this.player, this.platforms)) 
		{
			isClinging = true
			this.player.setAcceleration(0,0)
			cliffHang()
		}
		else if(!this.physics.add.overlap(this.player, this.platforms))
		{
			isTouchingPlatform = false
		}
		
		*/
		this.horizontalWrap(this.player)

		const bottomPlatform = this.findBottomMostPlatform()
		if (this.player.y > bottomPlatform.y + 200)
		{
			this.scene.start('game-over')
			this.sound.play('dead')
		}
	}

	horizontalWrap(sprite)
	{
		const halfWidth = sprite.displayWidth * 0.5
		const gameWidth = this.scale.width
		if (sprite.x < -halfWidth)
		{
			sprite.x = gameWidth + halfWidth
		}
		else if (sprite.x > gameWidth + halfWidth)
		{
			sprite.x = -halfWidth
		}
	}
	

	addBallAbove(sprite)
	{
		const y = sprite.y - sprite.displayHeight

		const ball = this.balls.get(sprite.x, y, 'ball')

		ball.setActive(true)
		ball.setVisible(true)

		this.add.existing(ball)

		ball.body.setSize(ball.width, ball.height)

		this.physics.world.enable(ball)

		return ball
	}
	addGemAbove(sprite)
	{
		const y = sprite.y - sprite.displayHeight

		const gem = this.gems.get(sprite.x, y, 'gem')

		gem.setActive(true)
		gem.setVisible(true)

		this.add.existing(gem)

		gem.body.setSize(gem.width, gem.height)

		Phaser.Math.Between(gem.setVelocityX(20), gem.setVelocityX(-20))
		this.physics.world.enable(gem)

		return gem
	}

	handleCollectBall(player, ball)
	{
		this.balls.killAndHide(ball)

		this.physics.world.disableBody(ball.body)

		this.ballsCollected++
		this.sound.play('powerup')

		this.ballsCollectedText.text = `Balls: ${this.ballsCollected}`
	}
	handleCollectGem(player, gem)
	{
		this.gems.killAndHide(gem)

		this.physics.world.disableBody(gem.body)

		this.gemsCollected++
		this.sound.play('powerup')

		this.gemsCollectedText.text = `Gems: ${this.gemsCollected}`
	}

	findBottomMostPlatform()
	{
		const platforms = this.platforms.getChildren()
		let bottomPlatform = platforms[0]

		for (let i = 1; i < platforms.length; ++i)
		{
			const platform = platforms[i]

			// discard any platforms that are above current
			if (platform.y < bottomPlatform.y)
			{
				continue
			}

			bottomPlatform = platform
		}

		return bottomPlatform
	}
}