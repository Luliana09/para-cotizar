import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Registro from './components/Registro';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import PanelAprobaciones from './components/PanelAprobaciones';
import GestionClientes from './components/GestionClientes';
import GestionUsuarios from './components/GestionUsuarios';
import FormularioCotizacion from './components/FormularioCotizacion';
import ResultadosCotizacion from './components/ResultadosCotizacion';
import VisualizadorCSV from './components/VisualizadorCSV';
import HistorialCotizaciones, { guardarEnHistorial } from './components/HistorialCotizaciones';
import { cargarCSV } from './services/csvService';
import { calcularCotizacion, validarDatos } from './services/calculoService';
import { generarPDF } from './services/pdfService';
import { cotizacionesService } from './services/apiService';
import './App.css';

// Componente principal de cotización
function CotizacionPage({ serviciosData, onAlerta }) {
  const [resultado, setResultado] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [cotizacionId, setCotizacionId] = useState(null);

  const handleCalcular = async (datos) => {
    try {
      // Validar que haya un cliente seleccionado
      if (!clienteSeleccionado) {
        onAlerta('error', 'Por favor seleccione un cliente antes de cotizar', 8000);
        return;
      }

      // Validar datos
      const validacion = validarDatos(datos);
      if (!validacion.valido) {
        onAlerta('error', validacion.errores.join(', '), 8000);
        return;
      }

      // Calcular cotización
      const resultadoCalculo = calcularCotizacion(datos);

      // Verificar tamaño mínimo
      if (
        resultadoCalculo.validaciones.tamañoMinimo &&
        !resultadoCalculo.validaciones.tamañoMinimo.cumple
      ) {
        onAlerta(
          'warning',
          `Advertencia: El área es menor al tamaño mínimo (${resultadoCalculo.validaciones.tamañoMinimo.tamañoMinimo} ft²)`,
          8000
        );
      }

      setResultado(resultadoCalculo);

      // Guardar en historial local (fallback)
      guardarEnHistorial(resultadoCalculo);

      // Guardar en base de datos
      try {
        const cotizacionData = {
          cliente_id: clienteSeleccionado.id,
          tipo_servicio: datos.tipoServicio,
          categoria: datos.categoria,
          espesor: datos.espesor || null,
          precio_por_ft2: datos.precioPorFt2,
          con_luz: datos.conLuz || false,
          metodo_calculo: datos.metodoCalculo || 'area',
          alto: datos.alto,
          ancho: datos.ancho,
          unidad: datos.unidad,
          cantidad: datos.cantidad || 1,
          area_unitaria: resultadoCalculo.areaUnitaria,
          area_total: resultadoCalculo.areaTotal,
          precio_base: resultadoCalculo.precioBase,
          recargo_color: resultadoCalculo.recargoColor || 0,
          color_personalizado: datos.colorPersonalizado || false,
          subtotal: resultadoCalculo.subtotal,
          itbms: resultadoCalculo.itbms || 0,
          aplicar_itbms: datos.aplicarITBMS || false,
          total: resultadoCalculo.total,
          datos_calculo_json: JSON.stringify(resultadoCalculo)
        };

        const response = await cotizacionesService.create(cotizacionData);
        if (response.success) {
          setCotizacionId(response.data.id);
          onAlerta('success', `✓ Cotización ${response.data.numero_cotizacion} guardada exitosamente`, 5000);
        }
      } catch (error) {
        console.error('Error al guardar en BD:', error);
        onAlerta('warning', 'Cotización calculada pero no se pudo guardar en la base de datos', 6000);
      }

      // Scroll suave a resultados
      setTimeout(() => {
        const resultadosElement = document.querySelector('.resultados-cotizacion');
        if (resultadosElement) {
          resultadosElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      console.error('Error al calcular:', err);
      onAlerta('error', 'Error al calcular la cotización: ' + err.message, 8000);
    }
  };

  const handleLimpiar = () => {
    setResultado(null);
  };

  const handleExportarPDF = () => {
    if (resultado) {
      generarPDF(resultado);
    }
  };

  const handleImprimir = () => {
    window.print();
  };

  const handleEnviarAprobacion = async () => {
    if (!cotizacionId) {
      onAlerta('error', 'No hay ID de cotización para enviar', 5000);
      return;
    }

    try {
      onAlerta('info', 'Enviando cotización para aprobación...', 0);

      // Cambiar el estado a "enviada"
      const response = await cotizacionesService.cambiarEstado(cotizacionId, 'enviada');

      if (response.success) {
        onAlerta('success', '✓ Cotización enviada para aprobación exitosamente', 5000);

        // Opcional: también enviar el correo si existe el endpoint
        try {
          await cotizacionesService.enviarParaAprobacion(cotizacionId);
        } catch (emailError) {
          console.warn('El correo no pudo ser enviado:', emailError);
          // No mostrar error al usuario si solo falla el email
        }
      }
    } catch (error) {
      console.error('Error al enviar para aprobación:', error);
      onAlerta('error', 'Error al enviar la cotización: ' + (error.response?.data?.message || error.message), 8000);
    }
  };

  const handleCargarCotizacion = (cotizacion) => {
    setResultado(cotizacion);
    onAlerta('success', 'Cotización cargada del historial', 3000);

    setTimeout(() => {
      const resultadosElement = document.querySelector('.resultados-cotizacion');
      if (resultadosElement) {
        resultadosElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  return (
    <div className="page-content">
      {/* Info Box */}
      <div className="info-box">
        <h3 className="info-title">
          <span className="icon">📋</span>
          Instrucciones de Uso
        </h3>
        <ul className="info-list">
          <li>
            Seleccione el <strong>tipo de servicio</strong> y{' '}
            <strong>categoría</strong> deseada
          </li>
          <li>
            Para "Letras Formadas" y "Letras Recortadas" puede elegir entre{' '}
            <strong>cálculo por área total</strong> o{' '}
            <strong>por tamaño de letra</strong>
          </li>
          <li>
            Complete las <strong>dimensiones</strong> en la unidad de medida que
            prefiera
          </li>
          <li>
            Active las opciones adicionales según sea necesario (color personalizado,
            ITBMS)
          </li>
          <li>
            Haga clic en <strong>"Calcular Cotización"</strong> para ver el resumen
            detallado
          </li>
        </ul>
      </div>

      {/* Gestión de Clientes */}
      <GestionClientes onClienteSeleccionado={setClienteSeleccionado} />

      {/* Cliente Seleccionado */}
      {clienteSeleccionado && (
        <div className="cliente-seleccionado-banner">
          <div className="banner-content">
            <span className="banner-icon">👤</span>
            <div className="banner-text">
              <strong>Cliente Seleccionado:</strong>
              <span className="banner-detail">
                {clienteSeleccionado.nombre}
                {clienteSeleccionado.ruc && ` - RUC: ${clienteSeleccionado.ruc}`}
              </span>
            </div>
            <button
              className="btn-cambiar-cliente"
              onClick={() => setClienteSeleccionado(null)}
            >
              Cambiar Cliente
            </button>
          </div>
        </div>
      )}

      {/* Formulario */}
      <FormularioCotizacion
        serviciosData={serviciosData}
        onCalcular={handleCalcular}
        onLimpiar={handleLimpiar}
      />

      {/* Resultados */}
      {resultado && (
        <ResultadosCotizacion
          resultado={resultado}
          onExportarPDF={handleExportarPDF}
          onImprimir={handleImprimir}
          onEnviarAprobacion={handleEnviarAprobacion}
        />
      )}
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, loading: authLoading, usuario } = useAuth();
  const [serviciosData, setServiciosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });

  // Cargar CSV al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      const inicializarDatos = async () => {
        try {
          setLoading(true);
          const datos = await cargarCSV('/2 DATO PARA COTIZAR COPIA.csv');

          if (!datos || datos.length === 0) {
            throw new Error('El archivo CSV no contiene datos válidos');
          }

          setServiciosData(datos);
          mostrarAlerta(
            'success',
            `✓ Datos cargados correctamente. ${datos.length} servicios disponibles.`
          );
        } catch (err) {
          console.error('Error al cargar datos:', err);
          setError(err.message);
          mostrarAlerta(
            'error',
            'Error al cargar el archivo CSV. Asegúrese de que el archivo esté en la carpeta public.'
          );
        } finally {
          setLoading(false);
        }
      };

      inicializarDatos();
    }
  }, [isAuthenticated]);

  const mostrarAlerta = (tipo, mensaje, duracion = 5000) => {
    setAlerta({ tipo, mensaje });
    if (duracion > 0) {
      setTimeout(() => setAlerta({ tipo: '', mensaje: '' }), duracion);
    }
  };

  const handleCargarCotizacion = (cotizacion) => {
    mostrarAlerta('success', 'Cotización cargada del historial', 3000);
  };

  if (authLoading) {
    return (
      <div className="app">
        <div className="container">
          <div className="loading-screen">
            <div className="loading-spinner"></div>
            <h2>Cargando...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="app">
        <Header />
        <Navigation />
        <div className="app-with-nav">
          <div className="container">
            <div className="loading-screen">
              <div className="loading-spinner"></div>
              <h2>Cargando Sistema de Cotización...</h2>
              <p>Leyendo archivo CSV de servicios...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || serviciosData.length === 0) {
    return (
      <div className="app">
        <Header />
        <Navigation />
        <div className="app-with-nav">
          <div className="container">
            <div className="error-screen">
              <div className="error-icon">⚠️</div>
              <h2>Error al Cargar Datos</h2>
              <p>{error || 'No se pudieron cargar los servicios'}</p>
              <div className="error-instructions">
                <h3>Instrucciones:</h3>
                <ol>
                  <li>
                    Asegúrese de que el archivo "2 DATO PARA COTIZAR COPIA.csv" esté en
                    la carpeta <code>public</code>
                  </li>
                  <li>Verifique que el archivo tenga el formato correcto</li>
                  <li>Recargue la página (F5)</li>
                </ol>
              </div>
              <button onClick={() => window.location.reload()} className="btn btn-primary">
                🔄 Recargar Página
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <Navigation />
      <div className="app-with-nav">
        <div className="container">
          {/* Banner de datos cargados */}
          <div className="data-loaded-banner">
            <div className="banner-content">
              <span className="banner-icon">✓</span>
              <div className="banner-text">
                <strong>Datos Cargados Correctamente</strong>
                <span className="banner-detail">
                  {serviciosData.length} servicios disponibles
                </span>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {alerta.mensaje && (
            <div className={`alert alert-${alerta.tipo}`}>
              {alerta.mensaje}
            </div>
          )}

          {/* Rutas */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/cotizacion"
              element={<CotizacionPage serviciosData={serviciosData} onAlerta={mostrarAlerta} />}
            />
            {usuario?.rol === 'admin' && (
              <Route
                path="/aprobaciones"
                element={<PanelAprobaciones />}
              />
            )}
            <Route
              path="/clientes"
              element={<GestionClientes />}
            />
            {usuario?.rol === 'admin' && (
              <Route
                path="/usuarios"
                element={<GestionUsuarios />}
              />
            )}
            <Route
              path="/datos-csv"
              element={<VisualizadorCSV serviciosData={serviciosData} />}
            />
            <Route
              path="/historial"
              element={<HistorialCotizaciones onCargarCotizacion={handleCargarCotizacion} />}
            />
          </Routes>

          {/* Footer */}
          <footer className="app-footer">
            <p>© 2024 Sistema de Cotización de Servicios</p>
            <p className="footer-detail">
              Desarrollado con React • Backend API REST con Node.js + MySQL
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
