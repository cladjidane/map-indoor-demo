import argparse
import geopandas as gpd

def main():
    parser = argparse.ArgumentParser(description='Combine les features MultiPolygon d\'un fichier GeoJSON.')
    parser.add_argument('fichier_geojson', help='Chemin vers le fichier GeoJSON à combiner.')
    parser.add_argument('fichier_sortie', help='Chemin vers le fichier de sortie GeoJSON.')

    args = parser.parse_args()

    gdf = gpd.read_file(args.fichier_geojson)
    combined_geometry = gdf.unary_union

    combined_gdf = gpd.GeoDataFrame(geometry=[combined_geometry])

    combined_gdf.to_file(args.fichier_sortie, driver='GeoJSON')

if __name__ == '__main__':
    main()
