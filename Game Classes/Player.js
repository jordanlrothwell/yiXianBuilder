class Player {
    constructor(name, maximumHP, cultivation) {
      this.name = name;
      this.cultivation = cultivation;
  
      this.health = {
        current: 0,
        maximum: maximumHP,
        totalReduced: 0,
      };
  
      this.defence = {
        current: 0,
        maintain: 0,
        reduction: 0.5,
        totalReduced: 0,
        totalGained: 0,
      };
  
      this.qi = {
        current: 2,
      };
  
      this.guardUp = {
        current: 0,
      };
  
      this.increaseAttack = {
        current: 0,
      };
  
      this.decreaseAttack = {
        current: 0,
      };
  
      this.swordIntent = {
        current: 0,
      };
  
      this.status = {
        damageOnDefenceReduction: {
          count: 0,
        },
        restoreDefenceOnReduction: {
          count: 0,
        },
        phoenix: {
          count: 0,
          value: 0,
        },
      };
  
      this.SOTS = [];
    }
  }
  
  module.exports = Player;
  