module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
      id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
      },
      address: {
          type: Sequelize.STRING(42),
          allowNull: false,
          unique: true
      }
  },{ timestamps: false });

  return User;
};