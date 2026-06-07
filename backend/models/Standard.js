const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Standard = sequelize.define('Standard', {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: DataTypes.TEXT,
  }, {
    tableName: 'standards',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  Standard.associate = (db) => {
    Standard.hasMany(db.Book, { foreignKey: 'standard_id' });
  };

  return Standard;
};
