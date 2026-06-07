const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Purchase = sequelize.define('Purchase', {
    supplier_id: { type: DataTypes.INTEGER, allowNull: true },
    invoice_no: { type: DataTypes.STRING, allowNull: false, unique: true },
    purchase_date: { type: DataTypes.DATEONLY, allowNull: false },
    total_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
  }, {
    tableName: 'purchases',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  Purchase.associate = (db) => {
    Purchase.belongsTo(db.Supplier, { foreignKey: 'supplier_id' });
    Purchase.hasMany(db.PurchaseItem, { foreignKey: 'purchase_id', onDelete: 'CASCADE' });
  };

  return Purchase;
};
