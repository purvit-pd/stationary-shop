const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Supplier = sequelize.define('Supplier', {
    name: { type: DataTypes.STRING, allowNull: false },
    contact_person: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    address: DataTypes.TEXT,
    gstin: DataTypes.STRING,
  }, {
    tableName: 'suppliers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false,
  });

  Supplier.associate = (db) => {
    Supplier.hasMany(db.Purchase, { foreignKey: 'supplier_id' });
  };

  return Supplier;
};
