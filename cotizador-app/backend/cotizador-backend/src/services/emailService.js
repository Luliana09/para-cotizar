const nodemailer = require('nodemailer');

/**
 * Servicio para envío de emails
 */

// Crear transportador de nodemailer
const createTransporter = () => {
  // Si no hay configuración de email, usar ethereal para testing
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('⚠️  No hay configuración de email. Se generará un email de prueba con Ethereal.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

/**
 * Generar HTML para email de cotización
 */
const generarHTMLCotizacion = (cotizacion, cliente) => {
  const fecha = new Date(cotizacion.createdAt).toLocaleDateString('es-PA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .info-box {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e1e8ed;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .label {
          font-weight: 600;
          color: #555;
        }
        .value {
          color: #667eea;
          font-weight: 700;
        }
        .total-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 8px;
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          color: #999;
          font-size: 12px;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e1e8ed;
        }
        .btn {
          display: inline-block;
          background: #28a745;
          color: white;
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 600;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏢 Nueva Cotización Para Aprobación</h1>
        <p>Cotización ${cotizacion.numero_cotizacion}</p>
      </div>

      <div class="content">
        <p>Estimado/a,</p>
        <p>Se ha generado una nueva cotización que requiere su aprobación:</p>

        <div class="info-box">
          <h3 style="margin-top: 0; color: #667eea;">📋 Información del Cliente</h3>
          <div class="info-row">
            <span class="label">Cliente:</span>
            <span class="value">${cliente?.nombre || 'N/A'}</span>
          </div>
          ${cliente?.ruc ? `
          <div class="info-row">
            <span class="label">RUC:</span>
            <span class="value">${cliente.ruc}</span>
          </div>
          ` : ''}
          ${cliente?.email ? `
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">${cliente.email}</span>
          </div>
          ` : ''}
        </div>

        <div class="info-box">
          <h3 style="margin-top: 0; color: #667eea;">📊 Detalles de la Cotización</h3>
          <div class="info-row">
            <span class="label">Número:</span>
            <span class="value">${cotizacion.numero_cotizacion}</span>
          </div>
          <div class="info-row">
            <span class="label">Fecha:</span>
            <span class="value">${fecha}</span>
          </div>
          <div class="info-row">
            <span class="label">Tipo de Servicio:</span>
            <span class="value">${cotizacion.tipo_servicio}</span>
          </div>
          <div class="info-row">
            <span class="label">Categoría:</span>
            <span class="value">${cotizacion.categoria}</span>
          </div>
          <div class="info-row">
            <span class="label">Dimensiones:</span>
            <span class="value">${cotizacion.alto} × ${cotizacion.ancho} ${cotizacion.unidad}</span>
          </div>
          <div class="info-row">
            <span class="label">Área Total:</span>
            <span class="value">${cotizacion.area_total.toFixed(2)} ft²</span>
          </div>
        </div>

        <div class="total-box">
          TOTAL: B/. ${cotizacion.total.toFixed(2)}
        </div>

        <div style="text-align: center;">
          <p><strong>Estado:</strong> <span style="background: #ffc107; color: #856404; padding: 5px 15px; border-radius: 20px; font-size: 14px;">Pendiente de Aprobación</span></p>
        </div>

        <div class="footer">
          <p>Este es un correo automático generado por el Sistema de Cotización.</p>
          <p>Por favor, no responda a este correo.</p>
          <p>© ${new Date().getFullYear()} Sistema de Cotización de Servicios</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Enviar cotización para aprobación
 */
const enviarCotizacionParaAprobacion = async (cotizacion, cliente) => {
  try {
    const transporter = createTransporter();

    // Si no hay transporter (modo de prueba sin configuración)
    if (!transporter) {
      // Crear cuenta de prueba con Ethereal
      const testAccount = await nodemailer.createTestAccount();

      const testTransporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      const info = await testTransporter.sendMail({
        from: `"Sistema de Cotización" <${testAccount.user}>`,
        to: process.env.EMAIL_APROBACION || 'test@example.com',
        subject: `Nueva Cotización Para Aprobación - ${cotizacion.numero_cotizacion}`,
        html: generarHTMLCotizacion(cotizacion, cliente),
      });

      console.log('📧 Email de prueba enviado. URL de visualización:', nodemailer.getTestMessageUrl(info));

      return {
        success: true,
        message: 'Email de prueba enviado correctamente (Ethereal)',
        previewUrl: nodemailer.getTestMessageUrl(info),
        messageId: info.messageId
      };
    }

    // Enviar email real
    const info = await transporter.sendMail({
      from: `"Sistema de Cotización" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_APROBACION || 'lulianaartist16@gmail.com',
      subject: `Nueva Cotización Para Aprobación - ${cotizacion.numero_cotizacion}`,
      html: generarHTMLCotizacion(cotizacion, cliente),
    });

    console.log('📧 Email enviado:', info.messageId);

    return {
      success: true,
      message: 'Email enviado correctamente',
      messageId: info.messageId
    };

  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw error;
  }
};

module.exports = {
  enviarCotizacionParaAprobacion,
  generarHTMLCotizacion
};
