const { connectDB, sql } = require('../config/database');

const spaPaymentModel = {
  // Tạo thanh toán mới
  create: async (paymentData) => {
    try {
      console.log("Thông tin thanh toán cần lưu:", paymentData);
      const pool = await connectDB();
      const transaction = new sql.Transaction(pool);
      
      try {
        await transaction.begin();
        
        // Tạo ID theo định dạng "PAY-XXXX"
        const idResult = await new sql.Request(transaction).query(`
          SELECT MAX(CAST(SUBSTRING(id, 5, LEN(id)-4) AS INT)) as maxNum
          FROM spa_payments
          WHERE id LIKE 'PAY-%'
        `);
        
        let nextNum = 1;
        if (idResult.recordset[0].maxNum !== null) {
          nextNum = idResult.recordset[0].maxNum + 1;
        }
        
        const paymentId = `PAY-${nextNum.toString().padStart(4, '0')}`;
        console.log("Đã tạo ID thanh toán mới:", paymentId);
        
        // Thêm thanh toán vào database
        await new sql.Request(transaction)
          .input('id', paymentId)
          .input('appointment_id', paymentData.appointment_id)
          .input('amount', sql.Decimal(10, 2), paymentData.amount)
          .input('payment_method', paymentData.payment_method)
          .input('transaction_id', paymentData.transaction_id || null)
          .input('payment_date', sql.DateTime, paymentData.payment_date || new Date())
          .input('status', paymentData.status || 'completed')
          .input('notes', paymentData.notes || null)
          .query(`
            INSERT INTO spa_payments (
              id, appointment_id, amount, payment_method, transaction_id,
              payment_date, status, notes
            )
            VALUES (
              @id, @appointment_id, @amount, @payment_method, @transaction_id,
              @payment_date, @status, @notes
            );
          `);
          
        console.log("Đã thêm thanh toán vào database");
        
        // Cập nhật trạng thái thanh toán của lịch hẹn nếu đã thanh toán đủ
        if (paymentData.update_appointment_status) {
          console.log("Cập nhật trạng thái thanh toán của lịch hẹn:", paymentData.appointment_id);
          await new sql.Request(transaction)
            .input('id', paymentData.appointment_id)
            .input('payment_status', 'paid')
            .input('payment_method', paymentData.payment_method)
            .query(`
              UPDATE spa_appointments
              SET payment_status = @payment_status,
                  payment_method = @payment_method,
                  updated_at = GETDATE()
              WHERE id = @id
            `);
        }
        
        // QUAN TRỌNG: Đảm bảo commit transaction
        await transaction.commit();
        console.log("Đã commit transaction thành công");
        
        return { success: true, id: paymentId };
      } catch (error) {
        console.error("Lỗi trong transaction:", error);
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },
  
  // Lấy lịch sử thanh toán cho một lịch hẹn
  getByAppointmentId: async (appointmentId) => {
    try {
      const pool = await connectDB();
      
      // Lấy danh sách thanh toán
      const result = await pool.request()
        .input('appointment_id', sql.VarChar(50), appointmentId)
        .query(`
          SELECT *
          FROM spa_payments
          WHERE appointment_id = @appointment_id
          ORDER BY payment_date DESC
        `);
        
      return result.recordset;
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  },
  
  // Cập nhật trạng thái thanh toán
  updateStatus: async (id, status) => {
    try {
      const pool = await connectDB();
      
      // Cập nhật trạng thái
      await pool.request()
        .input('id', sql.VarChar(50), id)
        .input('status', sql.VarChar(20), status)
        .query(`
          UPDATE spa_payments
          SET status = @status,
              updated_at = GETDATE()
          WHERE id = @id
        `);
        
      return { success: true };
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  },

  // Tìm kiếm thanh toán theo transaction_id
  findByTransactionId: async (transactionId) => {
    try {
      const pool = await connectDB();
      
      // Tìm kiếm thanh toán theo transaction_id
      const result = await pool.request()
        .input('transaction_id', sql.VarChar(255), transactionId)
        .query(`
          SELECT *
          FROM spa_payments
          WHERE transaction_id = @transaction_id
        `);
        
      return result.recordset.length > 0 ? result.recordset[0] : null;
    } catch (error) {
      console.error('Error finding payment by transaction ID:', error);
      throw error;
    }
  },

  // Tìm kiếm thanh toán theo appointment_id và status
  findByAppointmentIdAndStatus: async (appointmentId, status = 'completed') => {
    try {
      const pool = await connectDB();
      const result = await pool.request()
        .input('appointment_id', sql.VarChar(50), appointmentId)
        .input('status', sql.VarChar(20), status)
        .query(`
          SELECT *
          FROM spa_payments
          WHERE appointment_id = @appointment_id AND status = @status
        `);
      return result.recordset.length > 0 ? result.recordset : [];
    } catch (error) {
      console.error('Error finding payment by appointment ID:', error);
      throw error;
    }
  },
};

module.exports = spaPaymentModel;