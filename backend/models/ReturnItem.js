const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ReturnItem = sequelize.define('ReturnItem', {
    return_id: { type: DataTypes.INTEGER, allowNull: false },
    book_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unit_price: { type: DataTypes.FLOAT, allowNull: false },
    total_price: { type: DataTypes.FLOAT, allowNull: false },
  }, {
    tableName: 'return_items',
    timestamps: false,
  });

  ReturnItem.associate = (db) => {
    ReturnItem.belongsTo(db.Return, { foreignKey: 'return_id' });
    ReturnItem.belongsTo(db.Book, { foreignKey: 'book_id' });
  };

  return ReturnItem;
};
