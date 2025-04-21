-- Tạo database
CREATE DATABASE pet_store;
GO

-- Sử dụng database
USE pet_store;
GO

-- Bảng users
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  full_name NVARCHAR(100),
  phone_number VARCHAR(20),
  address NVARCHAR(MAX),
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT CHK_UserRole CHECK (role IN ('user', 'admin'))
);

-- Bảng categories
CREATE TABLE categories (
  id VARCHAR(50) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL UNIQUE,
  description NVARCHAR(MAX) NOT NULL,
  slug VARCHAR(100) UNIQUE, 
  type VARCHAR(20),
  image_url NVARCHAR(255),
  is_active BIT DEFAULT 1,
  created_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT CHK_CategoryType CHECK (type IN ('pet', 'food', 'accessory'))
);

-- Bảng brands
CREATE TABLE brands (
  id VARCHAR(50) PRIMARY KEY,
  name NVARCHAR(100) NOT NULL UNIQUE,
  logo NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX),
  website NVARCHAR(255),
  is_active BIT DEFAULT 1,
  created_at DATETIME DEFAULT GETDATE()
);

-- Bảng products
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category_id VARCHAR(50) NOT NULL,
  brand_id VARCHAR(50),
  pet_type VARCHAR(20),
  sku VARCHAR(50) UNIQUE,
  stock INT DEFAULT 0,
  discount DECIMAL(5, 2) DEFAULT 0,
  is_active BIT DEFAULT 1,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (brand_id) REFERENCES brands(id),
  CONSTRAINT CHK_PetType CHECK (pet_type IN ('dog', 'cat', 'all'))
);

-- Bảng product_images
CREATE TABLE product_images (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  image_url NVARCHAR(255) NOT NULL,
  is_primary BIT DEFAULT 0,
  display_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Bảng product_specifications
CREATE TABLE product_specifications (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  spec_name NVARCHAR(100) NOT NULL,
  spec_value NVARCHAR(MAX) NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Bảng pets
CREATE TABLE pets (
  id VARCHAR(50) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL,
  breed NVARCHAR(100) NOT NULL,
  age VARCHAR(50) NOT NULL,
  gender VARCHAR(20) NOT NULL,
  color NVARCHAR(50),
  weight VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  description NVARCHAR(MAX) NOT NULL,
  vaccination NVARCHAR(MAX),
  health NVARCHAR(MAX),
  origin NVARCHAR(255),
  stock INT DEFAULT 1,
  is_adopted BIT DEFAULT 0,
  is_active BIT DEFAULT 1,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  category_id VARCHAR(50),
  CONSTRAINT CHK_PetType_Pets CHECK (type IN ('dog', 'cat')),
  CONSTRAINT CHK_PetGender CHECK (gender IN ('male', 'female')),
  CONSTRAINT FK_Pets_Categories FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Bảng pet_images
CREATE TABLE pet_images (
  id VARCHAR(50) PRIMARY KEY,
  pet_id VARCHAR(50) NOT NULL,
  image_url NVARCHAR(255) NOT NULL,
  is_primary BIT DEFAULT 0,
  display_order INT DEFAULT 0,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

-- Bảng cart_items
CREATE TABLE cart_items (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  product_id VARCHAR(50),
  pet_id VARCHAR(50),
  quantity INT NOT NULL DEFAULT 1,
  added_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL,
  CONSTRAINT CHK_CartItemType CHECK (item_type IN ('product', 'pet')),
  CONSTRAINT CHK_CartItemRef CHECK (product_id IS NOT NULL OR pet_id IS NOT NULL)
);

-- Bảng orders
CREATE TABLE orders (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_fee DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  full_name NVARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  address NVARCHAR(MAX) NOT NULL,
  city NVARCHAR(100) NOT NULL,
  additional_info NVARCHAR(MAX),
  payment_method VARCHAR(20) NOT NULL,
  order_status VARCHAR(20) DEFAULT 'pending',
  payment_status VARCHAR(20) DEFAULT 'pending',
  tracking_number VARCHAR(100),
  notes NVARCHAR(MAX),
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT CHK_OrderPaymentMethod CHECK (payment_method IN ('cod', 'banking')),
  CONSTRAINT CHK_OrderStatus CHECK (order_status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  CONSTRAINT CHK_PaymentStatus CHECK (payment_status IN ('pending', 'paid', 'failed'))
);

-- Bảng order_items
CREATE TABLE order_items (
  id VARCHAR(50) PRIMARY KEY,
  order_id VARCHAR(50) NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  product_id VARCHAR(50),
  pet_id VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL,
  CONSTRAINT CHK_OrderItemType CHECK (item_type IN ('product', 'pet')),
  CONSTRAINT CHK_OrderItemRef CHECK (product_id IS NOT NULL OR pet_id IS NOT NULL)
);

-- Bảng reviews
CREATE TABLE reviews (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  item_type VARCHAR(20) NOT NULL,
  product_id VARCHAR(50),
  pet_id VARCHAR(50),
  rating INT NOT NULL,
  comment NVARCHAR(MAX),
  is_approved BIT DEFAULT 1,
  created_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE SET NULL,
  CONSTRAINT CHK_ReviewItemType CHECK (item_type IN ('product', 'pet')),
  CONSTRAINT CHK_ReviewItemRef CHECK (product_id IS NOT NULL OR pet_id IS NOT NULL),
  CONSTRAINT CHK_Rating CHECK (rating BETWEEN 1 AND 5)
);

-- Bảng review_images
CREATE TABLE review_images (
  id VARCHAR(50) PRIMARY KEY,
  review_id VARCHAR(50) NOT NULL,
  image_url NVARCHAR(255) NOT NULL,
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
);

-- Bảng blogs
CREATE TABLE blogs (
  id VARCHAR(50) PRIMARY KEY,
  title NVARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt NVARCHAR(MAX) NOT NULL,
  content NVARCHAR(MAX) NOT NULL,
  image NVARCHAR(255),
  author_id VARCHAR(50),
  category VARCHAR(20),
  is_published BIT DEFAULT 1,
  publish_date DATETIME DEFAULT GETDATE(),
  view_count INT DEFAULT 0,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT CHK_BlogCategory CHECK (category IN ('pet-care', 'nutrition', 'training', 'health'))
);

-- Bảng blog_tags
CREATE TABLE blog_tags (
  id VARCHAR(50) PRIMARY KEY,
  name NVARCHAR(50) NOT NULL UNIQUE
);

-- Bảng blog_tag_relations
CREATE TABLE blog_tag_relations (
  blog_id VARCHAR(50) NOT NULL,
  tag_id VARCHAR(50) NOT NULL,
  PRIMARY KEY (blog_id, tag_id),
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE
);

-- Tạo trigger để tự động cập nhật updated_at
GO
CREATE TRIGGER trg_users_update
ON users
AFTER UPDATE
AS
BEGIN
    UPDATE users
    SET updated_at = GETDATE()
    FROM users u
    INNER JOIN inserted i ON u.id = i.id
END
GO

CREATE TRIGGER trg_products_update
ON products
AFTER UPDATE
AS
BEGIN
    UPDATE products
    SET updated_at = GETDATE()
    FROM products p
    INNER JOIN inserted i ON p.id = i.id
END
GO

CREATE TRIGGER trg_pets_update
ON pets
AFTER UPDATE
AS
BEGIN
    UPDATE pets
    SET updated_at = GETDATE()
    FROM pets p
    INNER JOIN inserted i ON p.id = i.id
END
GO

CREATE TRIGGER trg_orders_update
ON orders
AFTER UPDATE
AS
BEGIN
    UPDATE orders
    SET updated_at = GETDATE()
    FROM orders o
    INNER JOIN inserted i ON o.id = i.id
END
GO

CREATE TRIGGER trg_blogs_update
ON blogs
AFTER UPDATE
AS
BEGIN
    UPDATE blogs
    SET updated_at = GETDATE()
    FROM blogs b
    INNER JOIN inserted i ON b.id = i.id
END
GO

-- Thêm dữ liệu mẫu với ID dạng chuỗi
-- DANH MỤC
INSERT INTO categories (id, name, description, slug, type, image_url, is_active) 
VALUES ('CAT-0001', N'Chó cảnh', N'Các giống chó cảnh được nuôi phổ biến tại Việt Nam', 'cho-canh', 'pet', 'https://example.com/images/categories/dogs.jpg', 1);

INSERT INTO categories (id, name, description, slug, type, image_url, is_active) 
VALUES ('CAT-0002', N'Thức ăn cho chó', N'Thức ăn khô, ướt và đồ ăn vặt dinh dưỡng dành cho chó', 'thuc-an-cho-cho', 'food', 'https://example.com/images/categories/dog-food.jpg', 1);

INSERT INTO categories (id, name, description, slug, type, image_url, is_active) 
VALUES ('CAT-0003', N'Phụ kiện cho mèo', N'Đồ chơi, nhà, cát vệ sinh và các phụ kiện dành cho mèo', 'phu-kien-cho-meo', 'accessory', 'https://example.com/images/categories/cat-accessories.jpg', 1);

-- THƯƠNG HIỆU
INSERT INTO brands (id, name, logo, description, website, is_active) 
VALUES ('BRD-0001', N'Royal Canin', 'https://example.com/images/brands/royal-canin.png', N'Thương hiệu thức ăn cao cấp dành cho thú cưng đến từ Pháp', 'https://www.royalcanin.com', 1);

INSERT INTO brands (id, name, logo, description, website, is_active) 
VALUES ('BRD-0002', N'Kong', 'https://example.com/images/brands/kong.png', N'Thương hiệu đồ chơi và phụ kiện cao cấp dành cho thú cưng', 'https://www.kongcompany.com', 1);

INSERT INTO brands (id, name, logo, description, website, is_active) 
VALUES ('BRD-0003', N'Pedigree', 'https://example.com/images/brands/pedigree.png', N'Thương hiệu thức ăn dành cho chó phổ biến trên toàn thế giới', 'https://www.pedigree.com', 1);

-- SẢN PHẨM
INSERT INTO products (id, name, description, price, category_id, brand_id, pet_type, sku, stock, discount, is_active)
VALUES ('PRD-0001', N'Royal Canin Medium Adult', N'Thức ăn cho chó trưởng thành kích cỡ vừa từ 12 tháng đến 7 năm tuổi', 750000.00, 'CAT-0002', 'BRD-0001', 'dog', 'RC-MED-A-4KG', 50, 5.00, 1);

INSERT INTO products (id, name, description, price, category_id, brand_id, pet_type, sku, stock, discount, is_active)
VALUES ('PRD-0002', N'Kong Puzzle Toy', N'Đồ chơi thông minh giúp kích thích trí não của mèo', 350000.00, 'CAT-0003', 'BRD-0002', 'cat', 'KONG-PUZ-CAT', 30, 0.00, 1);

INSERT INTO products (id, name, description, price, category_id, brand_id, pet_type, sku, stock, discount, is_active)
VALUES ('PRD-0003', N'Pedigree Dentastix', N'Bánh thưởng hình que giúp vệ sinh răng miệng cho chó', 120000.00, 'CAT-0002', 'BRD-0003', 'dog', 'PED-DENT-M', 100, 10.00, 1);

-- THÚ CƯNG
INSERT INTO pets (id, name, type, breed, age, gender, color, weight, price, description, vaccination, health, origin, stock, is_adopted, is_active, category_id)
VALUES ('PET-0001', N'Buddy', 'dog', N'Golden Retriever', N'3 tháng', 'male', N'Vàng đậm', N'4.5 kg', 18000000.00, N'Chó Golden Retriever thuần chủng, năng động và thân thiện với trẻ em', N'Đã tiêm 2 mũi vaccine (5 trong 1, 7 trong 1) và tẩy giun đầy đủ', N'Sức khỏe tốt, không mắc bệnh di truyền', N'Nhập khẩu từ Thái Lan', 1, 0, 1, 'CAT-0001');

INSERT INTO pets (id, name, type, breed, age, gender, color, weight, price, description, vaccination, health, origin, stock, is_adopted, is_active, category_id)
VALUES ('PET-0002', N'Luna', 'cat', N'Persian', N'4 tháng', 'female', N'Trắng', N'2.2 kg', 15000000.00, N'Mèo Persian lông dài, mặt tẹt đáng yêu, tính cách hiền lành', N'Đã tiêm vaccine phòng bệnh mèo và tẩy giun', N'Sức khỏe tốt, đã kiểm tra PKD âm tính', N'Nhập khẩu từ Thái Lan', 1, 0, 1, 'CAT-0001');

INSERT INTO pets (id, name, type, breed, age, gender, color, weight, price, description, vaccination, health, origin, stock, is_adopted, is_active, category_id)
VALUES ('PET-0003', N'Coco', 'dog', N'Poodle', N'2 tháng', 'male', N'Nâu đỏ', N'1.8 kg', 12000000.00, N'Chó Poodle Toy thuần chủng, thông minh và dễ huấn luyện', N'Đã tiêm mũi vaccine đầu tiên, tẩy giun', N'Sức khỏe tốt, hoạt bát, ăn uống tốt', N'Việt Nam', 1, 0, 1, 'CAT-0001');



-- Thêm trường is_featured vào bảng pets
ALTER TABLE pets 
ADD is_featured BIT DEFAULT 0;

-- Thêm trường is_featured vào bảng products
ALTER TABLE products 
ADD is_featured BIT DEFAULT 0;

-- Thêm trường is_featured vào bảng brands nếu chưa có
ALTER TABLE brands ADD is_featured BIT DEFAULT 0 NOT NULL;





CREATE TABLE spa_services (
  id VARCHAR(50) PRIMARY KEY,
  name NVARCHAR(255) NOT NULL,
  description NVARCHAR(MAX) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  duration INT NOT NULL, -- Thời gian thực hiện dịch vụ (phút)
  image_url NVARCHAR(255),
  pet_type VARCHAR(20), -- 'dog', 'cat', 'all'
  pet_size VARCHAR(20), -- 'small', 'medium', 'large', 'all'
  is_active BIT DEFAULT 1,
  is_featured BIT DEFAULT 0,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  CONSTRAINT CHK_SpaServicePetType CHECK (pet_type IN ('dog', 'cat', 'all')),
  CONSTRAINT CHK_SpaServicePetSize CHECK (pet_size IN ('small', 'medium', 'large', 'all'))
);



CREATE TABLE spa_service_images (
  id VARCHAR(50) PRIMARY KEY,
  service_id VARCHAR(50) NOT NULL,
  image_url NVARCHAR(255) NOT NULL,
  is_primary BIT DEFAULT 0,
  display_order INT DEFAULT 0,
  FOREIGN KEY (service_id) REFERENCES spa_services(id) ON DELETE CASCADE
);


CREATE TABLE spa_appointments (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  pet_name NVARCHAR(100) NOT NULL,
  pet_type VARCHAR(20) NOT NULL,
  pet_breed NVARCHAR(100),
  pet_size VARCHAR(20) NOT NULL,
  pet_notes NVARCHAR(MAX),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  full_name NVARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT CHK_AppointmentPetType CHECK (pet_type IN ('dog', 'cat')),
  CONSTRAINT CHK_AppointmentPetSize CHECK (pet_size IN ('small', 'medium', 'large')),
  CONSTRAINT CHK_AppointmentStatus CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  CONSTRAINT CHK_AppointmentPaymentStatus CHECK (payment_status IN ('pending', 'paid'))
);


GO
CREATE TRIGGER trg_spa_services_update
ON spa_services
AFTER UPDATE
AS
BEGIN
    UPDATE spa_services
    SET updated_at = GETDATE()
    FROM spa_services s
    INNER JOIN inserted i ON s.id = i.id
END
GO

CREATE TRIGGER trg_spa_appointments_update
ON spa_appointments
AFTER UPDATE
AS
BEGIN
    UPDATE spa_appointments
    SET updated_at = GETDATE()
    FROM spa_appointments a
    INNER JOIN inserted i ON a.id = i.id
END
GO

