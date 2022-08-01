const config = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    operatorsAliases: false,

    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);


//Test the DB Connection
sequelize.authenticate()
  .then(() => console.log('Database Connected'))
  .catch(err => console.log('Error: ', err))

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.authdetail = require("./authDetail.model.js")(sequelize, Sequelize);


//create foreign key authdetails_id_fk in users table
db.user.belongsTo(db.authdetail, {as :"AuthDetail", foreignKey : 'authdetails_id_fk'}); 

module.exports = db;
