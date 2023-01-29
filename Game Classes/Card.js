class Card {
  constructor(name, continuous, effects, specialRules) {
    this.name = name;
    this.continuous = continuous;
    this.effects = effects;
    this.specialRules = specialRules
  }
  
  StarPoints(baseDamage, player, slot) {
    if (slot["special"].includes("SP Active")) {
      baseDamage = baseDamage + player["starPoints"].current;
    }
  }
}

module.exports = Card;
