const Card = require("./Card");
const Player = require("./Player");

/* 
  The main game object responsible for holding players, 
  cards, and carrying out the game loop until win or loss
*/
class GameObject {
  constructor(player1, player2) {
    // Set players from arguments
    this.player1 = player1;
    this.player2 = player2;

    // Current player + opponent to be swapped on each new turn
    this.currentPlayer = this.currentPlayer;
    this.opponent = this.opponent;

    // Turn counter to limit infinite loops where no player wins (among other uses)
    // Begins at 0 so DetermineOrder() knows the game hasn't started yet
    this.turn = 0;
  }

  // Main game loop (UNDER CONSTRUCTION)
  GameLoop() {
    this.DetermineOrder();
    this.StartTurn();
  }

  // Check cultivation before first turn and set player order
  DetermineOrder() {
    // Check if game has begun ...
    if (this.turn === 0) {
      // ...and assign current player to highest cultivation
      if (this.player1.cultivation > this.player2.cultivation) {
        this.currentPlayer = this.player1;
        this.opponent = this.player2;
      } else {
        this.currentPlayer = this.player2;
        this.opponent = this.player1;
      }

      // Game begins on turn 1
      this.turn += 1;
    }
  }

  // Start current player's turn
  StartTurn() {
    // Update defence at start of turn
    this.UpdateDefenceSOT();

    // Apply any SOT statuses
    this.ApplyStatusesSOT();
  }

  // Update defence at start of turn
  UpdateDefenceSOT() {
    // Check for maintain defence stacks
    if (this.currentPlayer.defence.maintain > 0) {
      this.currentPlayer.defence.maintain -= 1;
      return;
    }

    // Reduce current player DEF by reduction factor
    this.DefenceReductionInstance(
      this.currentPlayer,
      // Math.floor as game rounds down to nearest integer
      Math.floor(
        this.currentPlayer.defence.current *
          this.currentPlayer.defence.reduction
      )
    );
  }

  // Determine which player an effect should target
  // Target is not always a function of whose turn it is even when
  // mechanic is consistent (due to variety of card effects)
  DeterminePlayer(target) {
    if (target === "self") {
      return this.currentPlayer;
    } else {
      return this.opponent;
    }
  }

  // Deal DMG instance against target's current DEF
  DefenceReductionInstance(target, instance) {
    // TODO: Revisit this method following creation of 'DeterminePlayer()'
    // Determine which player is target and assign other player to nonTarget
    let nonTarget;
    if (target === this.currentPlayer) {
      nonTarget = this.opponent;
    } else {
      nonTarget = this.currentPlayer;
    }

    // Create remainingDamage to A) check if DMG > DEF, and B) use the value later
    let remainingDamage = instance - target.defence.current;

    // If DMG > DEF, set DEF to 0 and deal remainingDamage to target as damage instance
    if (remainingDamage > 0) {
      target.defence.current = 0;
      this.DamageInstance(target, remainingDamage);

      // if DEF > DMG, reduce DEF by DMG and continue
    } else {
      target.defence.current -= instance;
    }

    // Increase target's defence.totalReduced
    target.defence.totalReduced += instance;

    // Check for stacks of damageOnDefenceReduction
    if (target.status.damageOnDefenceReduction.count > 0) {
      target.status.damageOnDefenceReduction.count -= 1;
      this.DamageInstance(nonTarget, instance);
    }

    // Check for stacks of restoreDefenceOnReduction
    if (target.status.restoreDefenceOnReduction > 0) {
      target.status.restoreDefenceOnReduction -= 1;
      target.defence.current += instance;
      target.defence.totalGained += instance;
    }
  }

  // DMG instance against target
  DamageInstance(target, instance) {
    // Check if target's current DEF > 0
    if (target.defence.current > 0) {
      this.DefenceReductionInstance(target, instance);
    } else {
      this.RemoveHPInstance(target, instance);
    }
  }

  // HP removal instance against target
  RemoveHPInstance(target, instance) {
    // Check for target guardUp stacks
    if (target.guardUp.current > 0) {
      target.guardUp.current -= 1;
      return;
    }
    target.health.current += -instance;
    target.health.totalReduced += instance;

    // Check whether target current HP > 0
    if (target.health.current > 0) {
      return;
    } else {
      this.PreDeathChecks(target);
    }
  }

  // Checks to perform after HP removal instance if target current HP is not > 0
  PreDeathChecks(target) {
    // Check for phoenix
    if (target.status.phoenix.count > 0) {
      target.status.phoenix.count -= 1;

      // TODO: Check 'value' variable below, doesn't look like it's connected to anything
      // and I suspect I haven't caught this yet because I've not attempted to test it
      target.health.current = value;
      target.health.maximum += value;
    }

    // Death() method to trigger end of game functions
    this.Death(target);
  }

  // Death() method to trigger end of game functions
  // TODO: Decide what EOG functions need to be carried out
  Death(target) {
    console.log(`${target} is dead. Game Over!`);
  }

  // Apply all status effects for current player's SOT array
  ApplyStatusesSOT() {
    console.log(
      `[Applying Statuses] Executing ${this.currentPlayer.SOTS.length} statuses...`
    );

    // For each item in the currentPlayer.SOTS array...
    for (let i = 0; i < this.currentPlayer.SOTS.length; i++) {
      // ...check if status is permanent and decrement charges if so
      console.log(`[Applying Statuses] Executing Status ${i + 1}...`);
      if (!this.currentPlayer.SOTS[i].permanent) {
        console.log(`[Applying Statuses] Status ${i + 1} is permanent.`);

        // Return if no charges remaining...
        if (this.currentPlayer.SOTS[i].charges === 0) {
          console.log(`[Applying Statuses] Status ${i + 1} is out of charges!`);
          return;

          // ...else reduce charges and continue
        } else {
          console.log(
            `[Applying Statuses] Status ${i + 1} reduced charges from ${
              this.currentPlayer.SOTS[i].charges
            } to ${this.currentPlayer.SOTS[i].charges - 1}.`
          );
          this.currentPlayer.SOTS[i].charges -= 1;

          // TODO: ADD EXECUTE STATUS FUNCTION HERE
        }

        // TODO: WHY IS THIS RETURN HERE?
        return;
      }

      // Check if status procs every turn
      if (this.currentPlayer.SOTS[i].frequency !== 1) {
        console.log(
          `[Applying Statuses] Status ${i + 1} procs once every ${
            this.currentPlayer.SOTS[i].frequency
          } turns.`
        );

        // For periodic statuses, increment proc count before checking for the proc itself
        console.log(
          `[Applying Statuses] Status ${i + 1} proc count increased from ${
            this.currentPlayer.SOTS[i].procs
          } to ${this.currentPlayer.SOTS[i].procs + 1}.`
        );
        this.currentPlayer.SOTS[i].procs += 1;

        // Check if the periodic status procs this turn...
        if (
          this.currentPlayer.SOTS[i].procs ===
          this.currentPlayer.SOTS[i].frequency
        ) {
          // ...and execute its effects if so
          this.ExecuteEffects(this.currentPlayer.SOTS[i].effects);

          // Because we're checking for equality (rather than divisibility)
          // we reset the proc counter back to 0 after each proc
          this.currentPlayer.SOTS[i].procs = 0;

          // If the periodic status didn't proc this turn we log no. of turns
          // remaining until proc into console
        } else {
          console.log(
            `[Applying Statuses] Status ${i + 1} will proc in ${
              this.currentPlayer.SOTS[i].frequency -
              this.currentPlayer.SOTS[i].procs
            } turns.`
          );
        }
      }
    }
  }

  // Execute all effects in a given array
  ExecuteEffects(effects) {
    console.log(`[Executing Effects] Executing ${effects.length} effects...`);

    // Loop through all effects in the array and check for type,
    // then trigger the effect associated with each method.
    // See each effect's method for information about its object
    // TODO: ADD THE INFORMATION REFERRED TO IN THE ABOVE LINE OF COMMENT (heh)
    for (let i = 0; i < effects.length; i++) {
      // If effect is 'Attack' type
      if (effects[i].type === "ATK") {
        console.log(
          `[Executing Effects] Effect ${i + 1} is an 'Attack' effect.`
        );
        this.Attack(effects[i]);

        // If effect is 'Attribute Change' type
      } else if (effects[i].type === "ATTR") {
        console.log(
          `[Executing Effects] Effect ${i + 1} is an 'Attribute Change' effect.`
        );
        this.ChangeAttribute(effects[i]);

        // If effect is 'Add Status' type
      } else if (effects[i].type === "ADDSTAT") {
        console.log(
          `[Executing Effects] Effect ${i + 1} is an 'Add Status' effect.`
        );
        this.AddStatus(effects[i]);

        // If effect is 'Status' type
      } else if (effects[i].type === "STAT") {
        console.log(
          `[Executing Effects] Effect ${i + 1} is a 'Status' effect.`
        );
        this.Status(effects[i]);
      }
    }
  }

  // 'Attack' effect
  Attack(effect) {
    // Calculating ATK instance damage
    console.log(`[Effect: Attack] Calculating instance damage...`);
    this.CalculateATKInstanceDamage(effect.baseDamage);
  }

  // Calculate total damage for an ATK instance
  CalculateATKInstanceDamage(baseDamage) {
    // Add Increase Attack
    baseDamage += this.currentPlayer.increaseAttack.current;
    console.log(
      `[Effect: Attack] Increase Damage Stacks = ${this.currentPlayer.increaseAttack.current}. (TOTAL: ${baseDamage})`
    );

    // Subtract Decrease Attack
    baseDamage += -this.currentPlayer.decreaseAttack.current;
    console.log(
      `[Effect: Attack] Decrease Damage Stacks = ${this.currentPlayer.decreaseAttack.current}. (TOTAL: ${baseDamage})`
    );

    // Add Sword Intent
    baseDamage += this.currentPlayer.swordIntent.current;
    console.log(
      `[Effect: Attack] Sword Intent Stacks = ${this.currentPlayer.swordIntent.current}. (TOTAL: ${baseDamage})`
    );

    // TODO: ADD SPECIAL DAMAGE METHOD

    // Subtract Weaken
    if (this.currentPlayer.weaken.current > 0) {
      baseDamage = Math.round(baseDamage * 0.6);
    }
    console.log(
      `[Effect: Attack] Weaken Stacks = ${this.currentPlayer.weaken.current}. (TOTAL: ${baseDamage})`
    );
  }

  // 'Change Attribute' effect
  ChangeAttribute(effect) {
    console.log(
      `[Effect: Change Attribute] ${
        this.DeterminePlayer(effect.target)["name"]
      }'s '${effect.attribute[0]}.${effect.attribute[1]}' changed from ${
        this.DeterminePlayer(effect.target)[effect.attribute[0]][
          effect.attribute[1]
        ]
      } to ${
        this.DeterminePlayer(effect.target)[effect.attribute[0]][
          effect.attribute[1]
        ] + effect.value
      }.`
    );

    // Change target player's attribute by effect's value (positive or negative)
    this.DeterminePlayer(effect.target)[effect.attribute[0]][
      effect.attribute[1]
    ] =
      this.DeterminePlayer(effect.target)[effect.attribute[0]][
        effect.attribute[1]
      ] + effect.value;
  }

  // 'Add Status' effect
  AddStatus(effect) {
    // Determine whether 'Start of Turn' or 'Generic' status type
    if (effect.SOT) {
      // Start of Turn status is pushed into the target's 'SOT' array
      console.log(`[Effect: Add Status] Adding a 'Start of Turn' status...`);
      this.DeterminePlayer(effect.target)["SOTS"].push(effect.value);
    } else {
      // Generic status is added to the target's 'status' object as a property
      console.log(
        `[Effect: Add Status] Adding generic status '${
          effect["value"].statusName
        }' to ${this.DeterminePlayer(effect.target)["name"]}.`
      );
      this.DeterminePlayer(effect.target)["status"][
        `${effect["value"].statusName}`
      ] = effect["value"].initial;
    }
  }

  // 'Status' effect
  Status(effect) {}
}

let Player1 = new Player("Player One", 44, 1);
let Player2 = new Player("Player Two", 44, 2);

const Game = new GameObject(Player1, Player2);

const WSRD = new Card("Wind Sword", false, [
  {
    type: "ATK",
    target: "other",
    baseDamage: 3,
    times: 2,
    specialRules: {},
  },
]);

const SGCD = new Card("Spirit Gather Citta-Dharma", true, [
  {
    type: "ATTR",
    target: "self",
    attribute: ["qi", "current"],
    value: 1,
  },
  {
    type: "ADDSTAT",
    target: "self",
    SOT: true,
    value: {
      type: "STAT",
      permanent: true,
      charges: NaN,
      frequency: 5,
      procs: 0,
      effects: [
        {
          type: "ATTR",
          target: "self",
          attribute: ["qi", "current"],
          value: 1,
        },
      ],
    },
  },
]);

const SGCD2 = new Card("Spirit Gather Citta-Dharma", true, [
  {
    type: "ATTR",
    target: "self",
    attribute: ["qi", "current"],
    value: 1,
  },
  {
    type: "ADDSTAT",
    target: "self",
    SOT: false,
    value: {
      type: "STAT",
      statusName: "gainHealth",
      initial: 1,
      permanent: true,
      charges: NaN,
      frequency: 5,
      procs: 0,
      effects: [
        {
          type: "ATTR",
          target: "other",
          attribute: ["qi", "current"],
          value: 1,
        },
      ],
    },
  },
]);

Game.DetermineOrder();
Game.ExecuteEffects(WSRD);
