import 'leaflet';

declare module 'leaflet' {
  namespace tileLayer {
    function provider(provider: string, options?: TileLayerOptions): TileLayer;
  }
}
