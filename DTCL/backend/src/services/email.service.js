/**
 * Email Service - Gửi email verification và các email khác
 */

const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

/**
 * Send verification code email
 * @param {string} email - Recipient email
 * @param {string} code - Verification code
 * @param {string} name - User's name
 */
const sendVerificationEmail = async (email, code, name = 'User') => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Đi chợ tiện lợi" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔐 Mã xác thực tài khoản - Đi chợ tiện lợi',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { background: #667eea; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; display: inline-block; letter-spacing: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛒 Đi chợ tiện lợi</h1>
            </div>
            <div class="content">
              <h2>Xin chào ${name}!</h2>
              <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng sử dụng mã xác thực bên dưới để hoàn tất đăng ký:</p>
              
              <div style="text-align: center;">
                <div class="code">${code}</div>
              </div>
              
              <p><strong>⏰ Mã có hiệu lực trong 10 phút.</strong></p>
              
              <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
              
              <p>Trân trọng,<br>Đội ngũ Đi chợ tiện lợi</p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
        Xin chào ${name}!
        
        Mã xác thực của bạn là: ${code}
        
        Mã có hiệu lực trong 10 phút.
        
        Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.
        
        Trân trọng,
        Đội ngũ Đi chợ tiện lợi
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Verification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        // Don't throw error, just log it - email is optional
        return { success: false, error: error.message };
    }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email
 * @param {string} code - Reset code
 * @param {string} name - User's name
 */
const sendPasswordResetEmail = async (email, code, name = 'User') => {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Đi chợ tiện lợi" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            to: email,
            subject: '🔑 Đặt lại mật khẩu - Đi chợ tiện lợi',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .code { background: #f5576c; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; display: inline-block; letter-spacing: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #888; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔑 Đặt lại mật khẩu</h1>
            </div>
            <div class="content">
              <h2>Xin chào ${name}!</h2>
              <p>Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã bên dưới:</p>
              
              <div style="text-align: center;">
                <div class="code">${code}</div>
              </div>
              
              <p><strong>⏰ Mã có hiệu lực trong 10 phút.</strong></p>
              
              <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.</p>
              
              <p>Trân trọng,<br>Đội ngũ Đi chợ tiện lợi</p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
        </html>
      `,
            text: `
        Xin chào ${name}!
        
        Mã đặt lại mật khẩu của bạn là: ${code}
        
        Mã có hiệu lực trong 10 phút.
        
        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.
        
        Trân trọng,
        Đội ngũ Đi chợ tiện lợi
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('📧 Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Test email configuration
 */
const testEmailConfig = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ Email configuration is valid');
        return true;
    } catch (error) {
        console.error('❌ Email configuration error:', error.message);
        return false;
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail,
    testEmailConfig,
};
