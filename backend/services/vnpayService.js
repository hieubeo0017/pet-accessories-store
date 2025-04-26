const crypto = require('crypto');
const querystring = require('qs');
const moment = require('moment');

// Cấu hình VNPay
const VNP_TMN_CODE = "LGY0QDEA";
const VNP_HASH_SECRET = "LXNROYCXMJ5GFAXFRE27EMDUF98EG1BP";
const VNP_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const VNP_VERSION = "2.1.0";
const VNP_COMMAND = "pay";

// Sửa lại hàm tạo URL thanh toán VNPay
const createPaymentUrl = (paymentData) => {
  // Lấy các tham số từ paymentData
  const { amount, orderInfo, orderType, bankCode, language, ipAddr, returnUrl, txnRef, useIpnUrl = false } = paymentData;

  // Tạo ngày theo định dạng yyyymmddHHmmss
  const date = new Date();
  const createDate = moment(date).format('YYYYMMDDHHmmss');
  
  // Tạo mã giao dịch đơn giản
  const orderId = txnRef || `PAY${moment(date).format('HHmmss')}`;
  
  // Tạo đối tượng params
  var vnp_Params = {};
  vnp_Params['vnp_Version'] = VNP_VERSION;
  vnp_Params['vnp_Command'] = VNP_COMMAND;
  vnp_Params['vnp_TmnCode'] = VNP_TMN_CODE;
  vnp_Params['vnp_Locale'] = language || 'vn';
  vnp_Params['vnp_CurrCode'] = 'VND';
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = `THANHTOAN${orderInfo.replace(/[^a-zA-Z0-9]/g, '')}`;
  vnp_Params['vnp_OrderType'] = orderType || 'billpayment';
  vnp_Params['vnp_Amount'] = Math.floor(amount * 100); // Đảm bảo luôn trả về số nguyên
  
  // Quan trọng: KHÔNG mã hóa returnUrl trước khi thêm vào đối tượng tham số
  vnp_Params['vnp_ReturnUrl'] = returnUrl; // Bỏ encodeURIComponent
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  
  // Thêm tham số vnp_ExpireDate (15 phút)
  const expireDate = moment(date).add(15, 'minutes').format('YYYYMMDDHHmmss');
  vnp_Params['vnp_ExpireDate'] = expireDate;
  
  // Chỉ thêm bankCode khi có giá trị
  if(bankCode !== null && bankCode !== ''){
    vnp_Params['vnp_BankCode'] = bankCode;
  }
  
  // Thêm IPN URL có điều kiện
  if (useIpnUrl) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    vnp_Params['vnp_IpnUrl'] = `${baseUrl}/api/vnpay/callback`;
  }
  
  // Sắp xếp các tham số theo thứ tự từ điển
  vnp_Params = sortObject(vnp_Params);
  
  // Tạo chuỗi signData với đúng định dạng mã hóa
  const signData = querystring.stringify(vnp_Params, { encode: true });
  
  // Tạo chữ ký từ chuỗi đã mã hóa
  const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex").toUpperCase();
  
  vnp_Params['vnp_SecureHash'] = signed;
  
  // Tạo URL thanh toán với encode: true
  const paymentUrl = VNP_URL + '?' + querystring.stringify(vnp_Params, { encode: true });
  
  // Log để debug
  console.log("========= VNPAY DEBUG INFO =========");
  console.log("Sign data:", signData);
  console.log("Generated hash:", signed);
  console.log("Payment URL:", paymentUrl);
  console.log("======================================");
  
  return {
    url: paymentUrl,
    txnRef: orderId
  };
};

// Hàm xác thực callback từ VNPay - sửa lỗi thiếu return statement
const verifyReturnUrl = (vnpParams) => {
  // At the start of verifyReturnUrl function
  console.log("Original VNPay parameters:", JSON.stringify(vnpParams));

  // Tạo bản sao để không thay đổi dữ liệu gốc
  const params = { ...vnpParams };
  const secureHash = params['vnp_SecureHash'];
  
  // Xóa chữ ký để tạo lại chuỗi ký
  delete params['vnp_SecureHash'];
  delete params['vnp_SecureHashType'];
  
  // Sắp xếp tham số theo alphabet
  const sortedParams = sortObject(params);
  
  // Tạo chuỗi signData sử dụng querystring theo đúng cách của vnpay
  const signData = querystring.stringify(sortedParams, { encode: false });
  
  // Tạo chữ ký mới - sử dụng new Buffer thay vì Buffer.from
  const hmac = crypto.createHmac("sha512", VNP_HASH_SECRET);
  const signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex").toUpperCase();
  
  console.log("========= VNPAY VERIFY DEBUG =========");
  console.log("Sign data:", signData);
  console.log("Generated hash:", signed);
  console.log("Received hash:", secureHash);
  console.log("Hashes match?", secureHash === signed);
  console.log("====================================");
  
  // Kết quả của việc so sánh được trả về ở đây
  return secureHash.toLowerCase() === vnpParams['vnp_SecureHash'].toLowerCase();
};

// Hàm sắp xếp object theo thứ tự từ điển
function sortObject(obj) {
  let sorted = {};
  const keys = Object.keys(obj).sort();
  
  for (let i = 0; i < keys.length; i++) {
    sorted[keys[i]] = obj[keys[i]];
  }
  
  return sorted;
}

module.exports = {
  createPaymentUrl,
  verifyReturnUrl
};