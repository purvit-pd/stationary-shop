const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Return = sequelize.define('Return', {
    type: { type: DataTypes.ENUM('purchase', 'sale'), allowNull: false },
    reference_id: { type: DataTypes.INTEGER, allowNull: false },
    return_date: { type: DataTypes.DATEONLY, allowNull: false },
    total_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
    reason: DataTypes.TEXT,
  }, {
    tableName: 'returns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  Return.associate = (db) => {
    Return.hasMany(db.ReturnItem, { foreignKey: 'return_id', onDelete: 'CASCADE' });
  };

  return Return;
};
