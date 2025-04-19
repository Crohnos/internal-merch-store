-- Users table
CREATE TABLE IF NOT EXISTS Users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  roleId INTEGER,
  FOREIGN KEY (roleId) REFERENCES Roles(id)
);

-- Roles table
CREATE TABLE IF NOT EXISTS Roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

-- Permissions table
CREATE TABLE IF NOT EXISTS Permissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT UNIQUE NOT NULL,
  description TEXT
);

-- RolePermissions table (junction table)
CREATE TABLE IF NOT EXISTS RolePermissions (
  roleId INTEGER NOT NULL,
  permissionId INTEGER NOT NULL,
  PRIMARY KEY (roleId, permissionId),
  FOREIGN KEY (roleId) REFERENCES Roles(id),
  FOREIGN KEY (permissionId) REFERENCES Permissions(id)
);

-- ItemTypes table
CREATE TABLE IF NOT EXISTS ItemTypes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

-- Sizes table
CREATE TABLE IF NOT EXISTS Sizes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL
);

-- ItemTypeSizes table (junction table)
CREATE TABLE IF NOT EXISTS ItemTypeSizes (
  itemTypeId INTEGER NOT NULL,
  sizeId INTEGER NOT NULL,
  PRIMARY KEY (itemTypeId, sizeId),
  FOREIGN KEY (itemTypeId) REFERENCES ItemTypes(id),
  FOREIGN KEY (sizeId) REFERENCES Sizes(id)
);

-- Items table
CREATE TABLE IF NOT EXISTS Items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  itemTypeId INTEGER,
  imageUrl TEXT,
  FOREIGN KEY (itemTypeId) REFERENCES ItemTypes(id)
);

-- ItemAvailability table
CREATE TABLE IF NOT EXISTS ItemAvailability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  itemId INTEGER NOT NULL,
  sizeId INTEGER NOT NULL,
  quantityInStock INTEGER DEFAULT 0,
  FOREIGN KEY (itemId) REFERENCES Items(id),
  FOREIGN KEY (sizeId) REFERENCES Sizes(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS Orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  orderDate TEXT NOT NULL, -- ISO8601 format
  totalAmount REAL NOT NULL,
  status TEXT DEFAULT 'Completed',
  FOREIGN KEY (userId) REFERENCES Users(id)
);

-- OrderLines table
CREATE TABLE IF NOT EXISTS OrderLines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orderId INTEGER NOT NULL,
  itemId INTEGER NOT NULL,
  sizeId INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  priceAtTimeOfOrder REAL NOT NULL,
  FOREIGN KEY (orderId) REFERENCES Orders(id),
  FOREIGN KEY (itemId) REFERENCES Items(id),
  FOREIGN KEY (sizeId) REFERENCES Sizes(id)
);

-- Locations table
CREATE TABLE IF NOT EXISTS Locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  address TEXT
);