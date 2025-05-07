const axios = require('axios');
const chatbotModel = require('../models/chatbotModel');
require('dotenv').config();

// Context cơ bản về thông tin cửa hàng
const baseStoreContext = `
Pet Accessories Store là cửa hàng chuyên về:
1. Chó cảnh: Nhiều giống chó cảnh như Poodle, Corgi, Golden Retriever, Husky...
2. Mèo cảnh: Nhiều giống mèo cảnh như Maine Coon, British Shorthair, Persian...
3. Phụ kiện thú cưng: Đồ chơi, quần áo, dây xích, vòng cổ, v.v.
4. Thức ăn thú cưng: Thức ăn hạt khô, thức ăn ướt, đồ ăn vặt
5. Dịch vụ spa: Tắm, cắt tỉa lông, massage, chăm sóc sức khỏe

Phụ kiện dành cho chó: vòng cổ, dây dắt, rọ mõm, đồ chơi, bát ăn, áo quần, chuồng và nệm.
Phụ kiện dành cho mèo: cát vệ sinh, khay vệ sinh, cào móng, bát ăn, đồ chơi, chuồng và nhà mèo.
Thức ăn cho chó: Royal Canin, Pedigree, Dog Mania, SmartHeart với đủ loại hạt, pate, snack.
Thức ăn cho mèo: Royal Canin, Whiskas, Meow Mix, Me-O với đủ loại hạt, pate, snack.

Website của Pet Accessories Store có các mục chính: Trang chủ, Chó cảnh, Mèo cảnh, Thức ăn, Phụ kiện, Spa & Chăm sóc, Tin tức và Liên hệ.
Để xem và mua thú cưng, bạn có thể truy cập mục "Chó cảnh" hoặc "Mèo cảnh" trên thanh menu chính.

Giờ mở cửa: 8:00-20:00 từ Thứ 2 đến Chủ Nhật
Địa chỉ: Số 1 Thài Hà, Đống Đa, Hà Nội
Hotline: 0355292839
Email: hieubeo0017@gmail.com
`;

// Cache để giảm số lần truy vấn database
let productsCache = null;
let petsCache = null;
let spaServicesCache = null;
let brandsCache = null;

// Cập nhật hàm analyzeQuery để nhận diện tốt hơn
async function analyzeQuery(query) {
  // Chuyển query về lowercase để dễ so sánh
  const lowerQuery = query.toLowerCase();

  // Mở rộng từ khóa về phụ kiện
  const productKeywords = ['sản phẩm', 'mua', 'giá', 'bao nhiêu', 'phụ kiện', 'thức ăn', 'đồ chơi', 'vòng cổ', 'cát vệ sinh', 'bát', 'chuồng', 'dây xích', 'đồ dùng', 'túi', 'quần áo'];
  
  // Từ khóa về thú cưng cụ thể hơn
  const petKeywords = ['chó', 'mèo', 'puppy', 'kitty', 'giống', 'breed', 'thuần chủng', 'thú cưng', 'pet', 'cún', 'miu', 'mão'];
  
  // Từ khóa về dịch vụ spa
  const spaKeywords = ['spa', 'tắm', 'cắt lông', 'cắt móng', 'dịch vụ', 'làm đẹp', 'grooming', 'vệ sinh'];
  
  // Từ khóa về thương hiệu
  const brandKeywords = ['thương hiệu', 'brand', 'hiệu', 'royal canin', 'kong', 'pedigree', 'whiskas', 'me-o'];

  // Từ khóa về phụ kiện cho từng loài
  const dogAccessoryKeywords = ['phụ kiện cho chó', 'đồ cho chó', 'vật dụng cho chó', 'đồ dùng cho cún'];
  const catAccessoryKeywords = ['phụ kiện cho mèo', 'đồ cho mèo', 'vật dụng cho mèo', 'đồ dùng cho mèo'];
  
  // Mảng kết quả với trọng số chi tiết hơn
  const results = {
    product: 0,
    pet: 0,
    spa: 0,
    brand: 0,
    dog_accessory: 0,
    cat_accessory: 0,
    dog_food: 0,
    cat_food: 0
  };
  
  // Tính điểm cho từng loại dựa trên từ khóa xuất hiện
  productKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) results.product += 1;
  });
  
  petKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) results.pet += 1;
  });
  
  spaKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) results.spa += 1;
  });
  
  brandKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) results.brand += 1;
  });
  
  // Phân tích các phụ kiện theo loài
  dogAccessoryKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) results.dog_accessory += 5; // Tăng trọng số
  });
  
  catAccessoryKeywords.forEach(keyword => {
    if (lowerQuery.includes(keyword)) results.cat_accessory += 5; // Tăng trọng số
  });
  
  // Phân tích thức ăn theo loài
  if ((lowerQuery.includes('thức ăn') || lowerQuery.includes('đồ ăn') || lowerQuery.includes('thực phẩm')) 
      && lowerQuery.includes('chó')) {
    results.dog_food += 5;
  }
  
  if ((lowerQuery.includes('thức ăn') || lowerQuery.includes('đồ ăn') || lowerQuery.includes('thực phẩm')) 
      && lowerQuery.includes('mèo')) {
    results.cat_food += 5;
  }
  
  // Nếu chỉ đề cập đến phụ kiện và chó (không nhất thiết phải là "phụ kiện cho chó")
  if (lowerQuery.includes('phụ kiện') && lowerQuery.includes('chó') && !lowerQuery.includes('mèo')) {
    results.dog_accessory += 3;
  }
  
  // Nếu chỉ đề cập đến phụ kiện và mèo (không nhất thiết phải là "phụ kiện cho mèo")
  if (lowerQuery.includes('phụ kiện') && lowerQuery.includes('mèo') && !lowerQuery.includes('chó')) {
    results.cat_accessory += 3;
  }

  // Trả về các loại thông tin cần lấy, sắp xếp theo độ ưu tiên
  return Object.entries(results)
    .filter(([_, score]) => score > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([type]) => type);
}

// Hàm tạo context động dựa trên phân tích câu hỏi
async function generateDynamicContext(message) {
  // Phân tích câu hỏi để xác định loại thông tin cần lấy
  const queryTypes = await analyzeQuery(message);
  
  // Context cơ bản
  let dynamicContext = baseStoreContext;
  
  // Thêm thông tin chi tiết dựa trên phân tích
  for (const queryType of queryTypes) {
    switch (queryType) {
      case 'product':
        // Kiểm tra cache hoặc lấy mới
        if (!productsCache) {
          productsCache = await chatbotModel.getPopularProducts(5);
        }
        
        // Tìm kiếm sản phẩm cụ thể nếu có từ khóa rõ ràng
        const productKeywords = message.replace(/sản phẩm|giá|bao nhiêu|mua/gi, '').trim();
        if (productKeywords.length > 3) {
          // Tìm kiếm chính xác trước
          const exactResults = await chatbotModel.searchProductExact(productKeywords);
          if (exactResults && exactResults.length > 0) {
            dynamicContext += "\n\nThông tin sản phẩm bạn đang tìm kiếm:\n";
            exactResults.forEach(p => {
              const discountedPrice = p.discount > 0 
                ? p.price * (1 - p.discount / 100) 
                : p.price;
              
              dynamicContext += `- ${p.name} (${p.brand_name || ''}): ${Intl.NumberFormat('vi-VN').format(discountedPrice)}đ - ${p.description ? p.description.substring(0, 100) + '...' : ''}\n`;
              if (p.stock > 0) {
                dynamicContext += `  Tình trạng: Còn hàng (${p.stock} sản phẩm)\n`;
              } else {
                dynamicContext += `  Tình trạng: Tạm hết hàng\n`;
              }
            });
            break;
          }
          
          // Nếu không tìm thấy kết quả chính xác, thử tìm kiếm thông thường
          const searchResults = await chatbotModel.searchProducts(productKeywords);
          if (searchResults && searchResults.length > 0) {
            dynamicContext += "\n\nSản phẩm liên quan đến tìm kiếm của bạn:\n";
            searchResults.forEach(p => {
              dynamicContext += `- ${p.name}: ${Intl.NumberFormat('vi-VN').format(p.price)}đ - ${p.description.substring(0, 100)}...\n`;
            });
            break;
          }
        }
        
        // Nếu không có từ khóa cụ thể, trả về sản phẩm nổi bật
        if (productsCache.length > 0) {
          dynamicContext += "\n\nSản phẩm nổi bật tại cửa hàng:\n";
          productsCache.forEach(p => {
            dynamicContext += `- ${p.name} (${p.brand_name}): ${Intl.NumberFormat('vi-VN').format(p.price)}đ\n`;
          });
        }
        break;
        
      case 'pet':
        // Kiểm tra cache hoặc lấy mới
        if (!petsCache) {
          petsCache = await chatbotModel.getPopularPets(3);
        }
        
        // Nếu hỏi về số lượng
        if (message.toLowerCase().match(/bao\s+nhi(ê|e)u|số\s+lượng|mấy\s+con|có\s+những|có\s+bao\s+nhi(ê|e)u/)) {
          // Xác định loại thú cưng đang hỏi
          const askingDog = message.toLowerCase().includes('chó');
          const askingCat = message.toLowerCase().includes('mèo');
          
          if (askingDog) {
            const totalDogs = await chatbotModel.countPetsByType('dog');
            const dogs = await chatbotModel.getAllPetsByType('dog', 10);
            
            dynamicContext += `\n\nHiện tại, cửa hàng có ${totalDogs} chú chó cảnh:`;
            dogs.forEach(dog => {
              dynamicContext += `\n- ${dog.name} (${dog.breed}): ${Intl.NumberFormat('vi-VN').format(dog.price)}đ`;
            });
          } 
          
          if (askingCat) {
            const totalCats = await chatbotModel.countPetsByType('cat'); 
            const cats = await chatbotModel.getAllPetsByType('cat', 10);
            
            dynamicContext += `\n\nHiện tại, cửa hàng có ${totalCats} mèo cảnh:`;
            cats.forEach(cat => {
              dynamicContext += `\n- ${cat.name} (${cat.breed}): ${Intl.NumberFormat('vi-VN').format(cat.price)}đ`;
            });
          }
        } else if (petsCache.length > 0) {
          dynamicContext += "\n\nThú cưng đang có tại cửa hàng:\n";
          petsCache.forEach(p => {
            dynamicContext += `- ${p.name} (${p.breed}): ${Intl.NumberFormat('vi-VN').format(p.price)}đ - ${p.description.substring(0, 80)}...\n`;
          });
          
          // Thêm thông tin về giống phổ biến
          if (message.includes('chó')) {
            const dogBreeds = await chatbotModel.getPopularBreeds('dog');
            dynamicContext += "\nCác giống chó phổ biến tại cửa hàng: " + dogBreeds.join(', ') + "\n";
          }
          
          if (message.includes('mèo')) {
            const catBreeds = await chatbotModel.getPopularBreeds('cat');
            dynamicContext += "\nCác giống mèo phổ biến tại cửa hàng: " + catBreeds.join(', ') + "\n";
          }
        }
        break;
        
      case 'spa':
        // Lấy tất cả dịch vụ spa thay vì chỉ lấy nổi bật
        spaServicesCache = await chatbotModel.getAllSpaServices();
        
        // Tìm kiếm dịch vụ spa cụ thể
        const spaKeywords = message.replace(/spa|dịch vụ|tắm|cắt|chăm sóc/gi, '').trim();
        if (spaKeywords.length > 3) {
          const searchResults = await chatbotModel.searchSpaServices(spaKeywords);
          if (searchResults && searchResults.length > 0) {
            dynamicContext += "\n\nDịch vụ spa phù hợp với yêu cầu của bạn:\n";
            searchResults.forEach(s => {
              dynamicContext += `- ${s.name}: ${Intl.NumberFormat('vi-VN').format(s.price)}đ (${s.duration} phút) - ${s.description.substring(0, 100)}...\n`;
            });
            break;
          }
        }
        
        // Hiển thị tất cả dịch vụ spa nếu spaServicesCache có dữ liệu
        if (spaServicesCache && spaServicesCache.length > 0) {
          // Kiểm tra từ khóa cụ thể
          if (message.toLowerCase().includes('nhuộm lông') || message.toLowerCase().includes('nhuộm')) {
            // Tìm dịch vụ nhuộm lông
            const dyeingServices = spaServicesCache.filter(s => 
              s.name.toLowerCase().includes('nhuộm') || 
              s.description.toLowerCase().includes('nhuộm')
            );
            
            if (dyeingServices.length > 0) {
              dynamicContext += "\n\nDịch vụ nhuộm lông nghệ thuật tại Pet Accessories Store:\n";
              dyeingServices.forEach(s => {
                dynamicContext += `- ${s.name}: ${Intl.NumberFormat('vi-VN').format(s.price)}đ (${s.duration} phút) - ${s.description}\n`;
              });
              dynamicContext += "\nVui lòng liên hệ 0355292839 để đặt lịch nhuộm lông cho thú cưng.";
              break;
            }
          }
          
          // Hiển thị các dịch vụ spa nổi bật nếu không có từ khóa cụ thể
          dynamicContext += "\n\nCác dịch vụ spa tại Pet Accessories Store:\n";
          // Lấy tối đa 6 dịch vụ để hiển thị
          const displayServices = spaServicesCache.slice(0, 6);
          displayServices.forEach(s => {
            dynamicContext += `- ${s.name}: ${Intl.NumberFormat('vi-VN').format(s.price)}đ (${s.duration} phút)\n`;
          });
          dynamicContext += "\nĐặt lịch spa: Khách hàng có thể đặt lịch trực tuyến trên website hoặc gọi số 0355292839.";
        }
        break;
        
      case 'brand':
        // Kiểm tra cache hoặc lấy mới
        if (!brandsCache) {
          brandsCache = await chatbotModel.getBrands();
        }
        
        if (brandsCache.length > 0) {
          dynamicContext += "\n\nThông tin về các thương hiệu tại cửa hàng:\n";
          brandsCache.forEach(b => {
            dynamicContext += `- ${b.name}: ${b.description}\n`;
          });
        }
        break;

      case 'dog_accessory':
        // Đếm số lượng phụ kiện cho chó
        const dogAccessoriesCount = await chatbotModel.countAccessoriesByPetType('dog');
        const dogAccessories = await chatbotModel.getAccessoriesByPetType('dog', 8);
        
        dynamicContext += `\n\nHiện tại, cửa hàng có ${dogAccessoriesCount} sản phẩm phụ kiện dành cho chó. Một số phụ kiện nổi bật:\n`;
        dogAccessories.forEach(product => {
          dynamicContext += `- ${product.name}: ${Intl.NumberFormat('vi-VN').format(product.price)}đ\n`;
        });
        
        dynamicContext += `\nCửa hàng cung cấp các loại phụ kiện cho chó như: vòng cổ, dây dắt, đồ chơi gặm, bát ăn/uống, quần áo và các vật dụng cần thiết khác.`;
        break;
        
      case 'cat_accessory':
        // Đếm số lượng phụ kiện cho mèo
        const catAccessoriesCount = await chatbotModel.countAccessoriesByPetType('cat');
        const catAccessories = await chatbotModel.getAccessoriesByPetType('cat', 8);
        
        dynamicContext += `\n\nHiện tại, cửa hàng có ${catAccessoriesCount} sản phẩm phụ kiện dành cho mèo. Một số phụ kiện nổi bật:\n`;
        catAccessories.forEach(product => {
          dynamicContext += `- ${product.name}: ${Intl.NumberFormat('vi-VN').format(product.price)}đ\n`;
        });
        
        dynamicContext += `\nCửa hàng cung cấp các loại phụ kiện cho mèo như: đồ chơi, bát ăn và các vật dụng cần thiết khác.`;
        break;
      
      case 'dog_food':
        // Lấy thức ăn cho chó
        const dogFoods = await chatbotModel.getFoodByPetType('dog', 6);
        
        dynamicContext += `\n\nThức ăn dành cho chó hiện có tại cửa hàng:\n`;
        dogFoods.forEach(product => {
          dynamicContext += `- ${product.name} (${product.brand_name || 'Không rõ thương hiệu'}): ${Intl.NumberFormat('vi-VN').format(product.price)}đ\n`;
        });
        
        dynamicContext += `\nCửa hàng có đầy đủ các loại thức ăn cho chó: thức ăn khô, thức ăn ướt, bánh thưởng, thức ăn cho chó con, chó trưởng thành và chó già.`;
        break;
        
      case 'cat_food':
        // Lấy thức ăn cho mèo
        const catFoods = await chatbotModel.getFoodByPetType('cat', 6);
        
        dynamicContext += `\n\nThức ăn dành cho mèo hiện có tại cửa hàng:\n`;
        catFoods.forEach(product => {
          dynamicContext += `- ${product.name} (${product.brand_name || 'Không rõ thương hiệu'}): ${Intl.NumberFormat('vi-VN').format(product.price)}đ\n`;
        });
        
        dynamicContext += `\nCửa hàng có đầy đủ các loại thức ăn cho mèo: hạt khô, pate, súp thưởng, snack, thức ăn cho mèo con, mèo trưởng thành và mèo già.`;
        break;
    }
  }
  
  return dynamicContext;
}

// Reset cache định kỳ (mỗi 30 phút) để đảm bảo thông tin luôn mới
setInterval(() => {
  productsCache = null;
  petsCache = null;
  spaServicesCache = null;
  brandsCache = null;
  console.log('Chatbot cache cleared.');
}, 30 * 60 * 1000);

const chatbotController = {
  chat: async (req, res) => {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Thiếu nội dung tin nhắn' 
      });
    }
    
    try {
      // Tạo context động dựa trên nội dung tin nhắn sử dụng RAG
      const dynamicContext = await generateDynamicContext(message);
      
      console.log('Sending request to OpenRouter with context length:', dynamicContext.length);
      
      // Tạo prompt tối ưu token
      const prompt = {
        messages: [
          {
            role: "system",
            content: `Bạn là trợ lý AI của Pet Accessories Store, một cửa hàng thú cưng và phụ kiện. 
            Hãy trả lời ngắn gọn, chính xác và thân thiện. 
            Sử dụng thông tin sau để trả lời: ${dynamicContext}
            Nếu không biết câu trả lời, hãy gợi ý liên hệ hotline 0355292839.
            ĐỪNG bịa ra thông tin không có trong dữ liệu.
            Trả lời bằng tiếng Việt có dấu, viết đúng chính tả.`
          },
          { role: "user", content: message }
        ],
        model: "deepseek/deepseek-chat",
        temperature: 0.7,
        max_tokens: 200 // Giới hạn độ dài phản hồi để tiết kiệm token
      };

      // Gọi API OpenRouter
      const response = await axios.post(
        process.env.OPENROUTER_URL,
        prompt,
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://pet-accessories-store.com',
            'X-Title': 'Pet Accessories Store Chatbot'
          }
        }
      );

      // Kiểm tra cấu trúc phản hồi trước khi truy cập
      let botReply = "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau hoặc liên hệ hotline 0355292839.";
      
      if (response.data && 
          response.data.choices && 
          Array.isArray(response.data.choices) && 
          response.data.choices.length > 0 && 
          response.data.choices[0].message) {
        botReply = response.data.choices[0].message.content;
      } else {
        console.error('Cấu trúc phản hồi OpenRouter không đúng:', JSON.stringify(response.data));
      }

      return res.status(200).json({
        success: true,
        message: botReply
      });
    } catch (error) {
      console.error('Lỗi chatbot:', error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: 'Đã xảy ra lỗi khi xử lý yêu cầu'
      });
    }
  },
  
  // Hàm để tự động nạp và lưu cache dữ liệu từ database
  loadContextData: async () => {
    try {
      // Nạp dữ liệu vào cache khi khởi động server
      productsCache = await chatbotModel.getPopularProducts(8);
      petsCache = await chatbotModel.getPopularPets(5);
      spaServicesCache = await chatbotModel.getPopularSpaServices(5);
      brandsCache = await chatbotModel.getBrands();
      
      console.log('Chatbot context data loaded successfully');
    } catch (error) {
      console.error('Error loading chatbot context data:', error);
    }
  }
};

module.exports = chatbotController;