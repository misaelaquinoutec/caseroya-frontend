import axios from 'axios';

export interface ExchangeRateResponse {
  moneda: string;
  precioCompra: number;
  precioVenta: number;
  fecha: string;
}

export const externalApiService = {
  // API pública de tipo de cambio SUNAT / SBS Perú
  obtenerTipoCambio: async (): Promise<ExchangeRateResponse> => {
    try {
      const response = await axios.get('https://api.apis.net.pe/v1/tipo-cambio-sunat', {
        timeout: 5000,
      });
      return {
        moneda: 'USD/PEN',
        precioCompra: response.data.compra || 3.75,
        precioVenta: response.data.venta || 3.78,
        fecha: response.data.fecha || new Date().toISOString().split('T')[0],
      };
    } catch {
      // Fallback seguro si la red externa falla
      return {
        moneda: 'USD/PEN',
        precioCompra: 3.75,
        precioVenta: 3.78,
        fecha: new Date().toISOString().split('T')[0],
      };
    }
  },
};
