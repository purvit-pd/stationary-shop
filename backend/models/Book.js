const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Book = sequelize.define('Book', {
    title: { type: DataTypes.STRING, allowNull: false },
    author: DataTypes.STRING,
    publisher: DataTypes.STRING,
    standard_id: { type: DataTypes.INTEGER, allowNull: true },
    price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    cost_price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    barcode: { type: DataTypes.STRING, unique: true, allowNull: true },
  }, {
    tableName: 'books',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  Book.associate = (db) => {
    Book.belongsTo(db.Standard, { foreignKey: 'standard_id' });
    Book.hasMany(db.PurchaseItem, { foreignKey: 'book_id' });
    Book.hasMany(db.SaleItem, { foreignKey: 'book_id' });
    Book.hasMany(db.ReturnItem, { foreignKey: 'book_id' });
  };

  return Book;
};
