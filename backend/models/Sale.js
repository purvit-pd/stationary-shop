const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sale = sequelize.define('Sale', {
    customer_name: DataTypes.STRING,
    customer_phone: DataTypes.STRING,
    invoice_no: { type: DataTypes.STRING, allowNull: false, unique: true },
    sale_date: { type: DataTypes.DATEONLY, allowNull: false },
    total_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
    discount: { type: DataTypes.FLOAT, defaultValue: 0 },
    payment_method: { type: DataTypes.STRING, defaultValue: 'cash' },
  }, {
    tableName: 'sales',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  Sale.associate = (db) => {
    Sale.hasMany(db.SaleItem, { foreignKey: 'sale_id', onDelete: 'CASCADE' });
  };

  return Sale;
};
