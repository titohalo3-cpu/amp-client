/** Un videojuego del catálogo. */
export interface Videogame {
  id: number;
  titulo: string;
  genero: string;
  plataformas: string[];
  precio: number;
  oferta: number; // % de descuento (0 = sin oferta)
  valoracion: number; // de 0 a 5
  imagen: string; // ruta de la portada
  fechaLanzamiento: string; // 'AAAA-MM-DD'
  descripcion: string;
  stock: number;
}

/** Criterios de ordenación del catálogo. */
export type Orden = 'valoracion' | 'az' | 'recientes' | 'precio-asc' | 'precio-desc';

/** Lo que emite el componente de filtro. */
export interface Filtro {
  texto: string;
  genero: string;
  soloOfertas: boolean;
  valoracionMin: number;
  orden: Orden;
}
