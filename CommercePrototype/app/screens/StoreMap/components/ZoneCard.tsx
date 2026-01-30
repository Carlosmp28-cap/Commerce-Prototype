import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";

export type Zone = {
  storeId: string;
  zoneId: string;
  zoneName?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  category?: string;
};
export type Shelf = {
  id: string;
  storeId: string;
  zoneId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

interface ZoneCardProps {
  selectedZone: Zone;
  onClose: () => void;
  shelves: Shelf[];
  zones: Zone[];
  baseApi: string;
  currentStoreId: string;
  productZones: any[] | null;
  setProductZones: (pz: any[]) => void;
  productsAll: { productId: string; name?: string }[];
  setProductId: (id: string) => void;
  setProductSearch: (s: string) => void;
  setShowProductDropdown: (v: boolean) => void;
  setSelectedZone: (z: Zone) => void;
}

const ZoneCard: React.FC<ZoneCardProps> = ({
  selectedZone,
  onClose,
  shelves,
  zones,
  baseApi,
  currentStoreId,
  productZones,
  setProductZones,
  productsAll,
  setProductId,
  setProductSearch,
  setShowProductDropdown,
  setSelectedZone,
}) => {
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 12, width: 320, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: '700', fontSize: 16 }}>
          {selectedZone.zoneName ?? (selectedZone as any).name ?? selectedZone.zoneId}
        </Text>
        <TouchableOpacity onPress={onClose} style={{ padding: 6 }}>
          <Text style={{ color: '#007bff' }}>Fechar</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 10 }}>
        <Text style={{ marginBottom: 6 }}>
          Dimensões: {selectedZone.width}m × {selectedZone.height}m
        </Text>

        <Text style={{ fontWeight: '600', marginTop: 8 }}>Produtos</Text>
        <View style={{ maxHeight: 160, marginTop: 6 }}>
          {!productZones ? (
            <TouchableOpacity
              onPress={async () => {
                try {
                  const url = `${baseApi}/product-zones?storeId=${encodeURIComponent(currentStoreId)}`;
                  const res = await fetch(url);
                  if (!res.ok) throw new Error('Não disponível');
                  const data = await res.json();
                  setProductZones(data);
                } catch (e) {
                  console.warn('Failed to load product-zones', e);
                  setProductZones([] as any);
                }
              }}
              style={{ padding: 8, backgroundColor: '#eee', borderRadius: 6 }}
            >
              <Text>Carregar mapeamento de produtos (se suportado pelo backend)</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView>
              {(() => {
                const shelfIds = new Set(
                  shelves
                    .filter((sh) => sh.zoneId === selectedZone.zoneId)
                    .map((s) => s.id),
                );
                const productsInZone = (productZones || []).filter(
                  (pz: any) => shelfIds.has(pz.shelfId),
                );
                if (productsInZone.length === 0)
                  return <Text>Nenhum produto encontrado nesta zona</Text>;
                return productsInZone.map((pz: any) => (
                  <TouchableOpacity
                    key={pz.productId}
                    onPress={() => {
                      setProductId(pz.productId);
                      setProductSearch(
                        pz.productName ??
                          productsAll.find((pp) => pp.productId === pz.productId)?.name ??
                          '',
                      );
                      setShowProductDropdown(false);
                      try {
                        const shelf = shelves.find((sh) => sh.id === pz.shelfId);
                        if (shelf) {
                          const zone = zones.find((z) => z.zoneId === shelf.zoneId);
                          if (zone) setSelectedZone(zone);
                        }
                      } catch (e) {
                        console.warn('Error selecting zone for product mapping', e);
                      }
                    }}
                    style={{ paddingVertical: 8, paddingHorizontal: 6 }}
                  >
                    <Text>
                      {pz.productName ?? productsAll.find((pp) => pp.productId === pz.productId)?.name ?? 'Produto desconhecido'}
                    </Text>
                    <Text style={{ color: '#888', fontSize: 12 }}>{pz.productId}</Text>
                  </TouchableOpacity>
                ));
              })()}
            </ScrollView>
          )}
        </View>
      </View>
    </View>
  );
};

export default ZoneCard;
