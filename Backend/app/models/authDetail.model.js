module.exports = (sequelize, Sequelize) => {
    const AuthDetails = sequelize.define("authdetails", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nonce: {
            type: Sequelize.STRING,
            allowNull: false            
        },
        timestamp:{
            type:Sequelize.INTEGER(11).UNSIGNED,
            allowNull: false             
        }
    },{ timestamps: false });
  
    return AuthDetails;
  };