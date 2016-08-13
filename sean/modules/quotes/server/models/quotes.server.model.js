"use strict";

module.exports = function(sequelize, DataTypes) {

  var Quote = sequelize.define('quote', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [1, 250],
          msg: "Quote title must be between 1 and 250 characters in length"
        },
      }
    },
    content: DataTypes.TEXT
  }, {
    associate: function(models) {
      Quote.belongsTo(models.user);
    }
  });
  return Quote;
};