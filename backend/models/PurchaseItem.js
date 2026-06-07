const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PurchaseItem = sequelize.define('PurchaseItem', {
    purchase_id: { type: DataTypes.INTEGER, allowNull: false },
    book_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unit_cost: { type: DataTypes.FLOAT, allowNull: false },
    total_cost: { type: DataTypes.FLOAT, allowNull: false },
  }, {
    tableName: 'purchase_items',
    timestamps: false,
  });

  PurchaseItem.associate = (db) => {
    PurchaseItem.belongsTo(db.Purchase, { foreignKey: 'purchase_id' });
    PurchaseItem.belongsTo(db.Book, { foreignKey: 'book_id' });
  };

  return PurchaseItem;
};
