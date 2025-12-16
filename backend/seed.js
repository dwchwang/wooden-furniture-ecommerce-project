import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from './src/models/category.model.js';
import Product from './src/models/product.model.js';
import ProductVariant from './src/models/product-variant.model.js';
import { generateSlug } from './src/utils/slug.util.js';
import { DB_NAME } from './src/utils/constants.js';

dotenv.config();

// Categories: Chỉ là các phòng
const categories = [
  {
    name: 'Phòng Khách',
    slug: 'phong-khach',
    description: 'Nội thất phòng khách sang trọng',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500',
    isActive: true,
  },
  {
    name: 'Phòng Ngủ',
    slug: 'phong-ngu',
    description: 'Nội thất phòng ngủ ấm cúng',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500',
    isActive: true,
  },
  {
    name: 'Phòng Ăn',
    slug: 'phong-an',
    description: 'Bàn ăn và ghế ăn cao cấp',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=500',
    isActive: true,
  },
  {
    name: 'Phòng Làm Việc',
    slug: 'phong-lam-viec',
    description: 'Nội thất văn phòng chuyên nghiệp',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500',
    isActive: true,
  },
];

// Products với type riêng
const products = [
  {
    name: 'Bàn Ăn Gỗ Sồi Hiện Đại',
    type: 'Bàn Ăn',
    description: 'Bàn ăn gỗ sồi tự nhiên, thiết kế hiện đại, bền đẹp theo thời gian. Phù hợp cho gia đình 6-8 người.',
    material: 'Gỗ Sồi',
    dimensions: { length: 180, width: 90, height: 75 },
    weight: 50,
    images: [
      'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800',
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',
    ],
    basePrice: 8500000,
    isActive: true,
    isFeatured: true,
    categoryIndex: 2, // Phòng Ăn
  },
  {
    name: 'Sofa Góc Chữ L Cao Cấp',
    type: 'Sofa',
    description: 'Sofa góc chữ L bọc vải cao cấp, khung gỗ thông chắc chắn. Thiết kế sang trọng, thoải mái.',
    material: 'Gỗ Thông + Vải',
    dimensions: { length: 280, width: 200, height: 85 },
    weight: 80,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800',
      'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800',
    ],
    basePrice: 15000000,
    isActive: true,
    isFeatured: true,
    categoryIndex: 0, // Phòng Khách
  },
  {
    name: 'Giường Ngủ Gỗ Óc Chó',
    type: 'Giường',
    description: 'Giường ngủ gỗ óc chó nguyên khối, vân gỗ đẹp tự nhiên. Thiết kế tối giản, sang trọng.',
    material: 'Gỗ Óc Chó',
    dimensions: { length: 200, width: 180, height: 120 },
    weight: 100,
    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800',
      'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800',
    ],
    basePrice: 18000000,
    isActive: true,
    isFeatured: true,
    categoryIndex: 1, // Phòng Ngủ
  },
  {
    name: 'Tủ Quần Áo 4 Cánh',
    type: 'Tủ Quần Áo',
    description: 'Tủ quần áo gỗ công nghiệp phủ melamine, 4 cánh rộng rãi. Nhiều ngăn tiện lợi.',
    material: 'Gỗ Công Nghiệp',
    dimensions: { length: 200, width: 60, height: 220 },
    weight: 120,
    images: [
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800',
    ],
    basePrice: 12000000,
    isActive: true,
    isFeatured: false,
    categoryIndex: 1, // Phòng Ngủ
  },
  {
    name: 'Bàn Làm Việc Gỗ Tần Bì',
    type: 'Bàn Làm Việc',
    description: 'Bàn làm việc gỗ tần bì tự nhiên, thiết kế tối giản. Có ngăn kéo tiện dụng.',
    material: 'Gỗ Tần Bì',
    dimensions: { length: 120, width: 60, height: 75 },
    weight: 30,
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800',
    ],
    basePrice: 5500000,
    isActive: true,
    isFeatured: true,
    categoryIndex: 3, // Phòng Làm Việc
  },
  {
    name: 'Ghế Ăn Gỗ Sồi Bọc Nệm',
    type: 'Ghế Ăn',
    description: 'Ghế ăn gỗ sồi tự nhiên, bọc nệm êm ái. Thiết kế thanh lịch, bền đẹp.',
    material: 'Gỗ Sồi',
    dimensions: { length: 45, width: 50, height: 95 },
    weight: 8,
    images: [
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=800',
    ],
    basePrice: 1800000,
    isActive: true,
    isFeatured: false,
    categoryIndex: 2, // Phòng Ăn
  },
  {
    name: 'Kệ Sách Gỗ 5 Tầng',
    type: 'Kệ Sách',
    description: 'Kệ sách gỗ công nghiệp 5 tầng, chắc chắn. Phù hợp cho phòng làm việc, phòng đọc sách.',
    material: 'Gỗ Công Nghiệp',
    dimensions: { length: 80, width: 30, height: 180 },
    weight: 25,
    images: [
      'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=800',
    ],
    basePrice: 3200000,
    isActive: true,
    isFeatured: false,
    categoryIndex: 3, // Phòng Làm Việc
  },
  {
    name: 'Bàn Trà Gỗ Óc Chó Mặt Đá',
    type: 'Bàn Trà',
    description: 'Bàn trà gỗ óc chó kết hợp mặt đá marble sang trọng. Thiết kế hiện đại, độc đáo.',
    material: 'Gỗ Óc Chó + Đá Marble',
    dimensions: { length: 120, width: 60, height: 45 },
    weight: 40,
    images: [
      'https://images.unsplash.com/photo-1551298370-9d3d53740c72?w=800',
    ],
    basePrice: 9500000,
    isActive: true,
    isFeatured: true,
    categoryIndex: 0, // Phòng Khách
  },
  {
    name: 'Tủ Giày 3 Tầng',
    type: 'Tủ Giày',
    description: 'Tủ giày gỗ công nghiệp 3 tầng, thiết kế thông minh. Tiết kiệm không gian.',
    material: 'Gỗ Công Nghiệp',
    dimensions: { length: 100, width: 35, height: 120 },
    weight: 35,
    images: [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    ],
    basePrice: 2800000,
    isActive: true,
    isFeatured: false,
    categoryIndex: 1, // Phòng Ngủ
  },
  {
    name: 'Ghế Sofa Đơn Bọc Da',
    type: 'Sofa',
    description: 'Ghế sofa đơn bọc da PU cao cấp, khung gỗ sồi. Sang trọng, dễ vệ sinh.',
    material: 'Gỗ Sồi + Da PU',
    dimensions: { length: 90, width: 85, height: 90 },
    weight: 35,
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800',
    ],
    basePrice: 6500000,
    isActive: true,
    isFeatured: true,
    categoryIndex: 0, // Phòng Khách
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB with DB_NAME (same as main app)
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log(`✅ Connected to MongoDB database: ${DB_NAME}`);

    // Drop collections completely to avoid index issues
    try {
      await mongoose.connection.db.dropCollection('categories');
      await mongoose.connection.db.dropCollection('products');
      await mongoose.connection.db.dropCollection('productvariants');
      console.log('🗑️  Dropped existing collections');
    } catch (error) {
      console.log('ℹ️  Collections may not exist yet');
    }

    // Create categories one by one to trigger slug generation
    const createdCategories = [];
    for (const category of categories) {
      const created = await Category.create(category);
      createdCategories.push(created);
    }
    console.log(`✅ Created ${createdCategories.length} categories`);

    // Create products with category references and type
    const createdProducts = [];
    for (let i = 0; i < products.length; i++) {
      const { categoryIndex, ...productData } = products[i];
      const product = {
        ...productData,
        category: createdCategories[categoryIndex]._id,
      };
      const created = await Product.create(product);
      createdProducts.push(created);
    }
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create variants for each product
    const variants = [];
    const colors = ['Nâu Tự Nhiên', 'Đen', 'Trắng Kem'];
    const sizes = ['Nhỏ', 'Vừa', 'Lớn'];

    for (const product of createdProducts) {
      // Create 2-3 variants per product
      const numVariants = Math.floor(Math.random() * 2) + 2;
      
      for (let i = 0; i < numVariants; i++) {
        const color = colors[i % colors.length];
        const size = sizes[i % sizes.length];
        const priceVariation = (i * 500000);
        
        // Generate SKU from product name
        const productPrefix = product.name
          .split(' ')
          .slice(0, 2)
          .map(word => word.substring(0, 3).toUpperCase())
          .join('');
        const colorCode = color.substring(0, 3).toUpperCase();
        const sizeCode = size.substring(0, 1).toUpperCase();
        const sku = `${productPrefix}-${colorCode}-${sizeCode}-${Date.now().toString().slice(-4)}`;
        
        variants.push({
          product: product._id,
          sku,
          color,
          size,
          price: product.basePrice + priceVariation,
          stock: Math.floor(Math.random() * 20) + 5,
          images: product.images,
          isActive: true,
        });
      }
    }

    const createdVariants = await ProductVariant.insertMany(variants);
    console.log(`✅ Created ${createdVariants.length} product variants`);

    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Categories: ${createdCategories.length} (Phòng Khách, Phòng Ngủ, Phòng Ăn, Phòng Làm Việc)`);
    console.log(`   - Products: ${createdProducts.length} (với Type: Bàn, Ghế, Giường, Tủ, Kệ, Sofa)`);
    console.log(`   - Variants: ${createdVariants.length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
