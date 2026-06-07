const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SaleItem = sequelize.define('SaleItem', {
    sale_id: { type: DataTypes.INTEGER, allowNull: false },
    book_id: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    unit_price: { type: DataTypes.FLOAT, allowNull: false },
    total_price: { type: DataTypes.FLOAT, allowNull: false },
  }, {
    tableName: 'sale_items',
    timestamps: false,
  });

  SaleItem.associate = (db) => {
    SaleItem.belongsTo(db.Sale, { foreignKey: 'sale_id' });
    SaleItem.belongsTo(db.Book, { foreignKey: 'book_id' });
  };

  return SaleItem;
};
