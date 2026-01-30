import React from "react";
import { View, Text, TouchableOpacity, TextInput, ScrollView } from "react-native";

export type Product = { productId: string; name?: string };
export type Zone = { zoneId: string; zoneName?: string; width: number; height: number; x: number; y: number; category?: string; storeId: string };
export type Shelf = { id: string; storeId: string; zoneId?: string; x: number; y: number; width: number; height: number };

interface SelectorsBarProps {
  knownStores: string[];
  storeSearch: string;
  setStoreSearch: (v: string) => void;
  showStoreDropdown: boolean;
  setShowStoreDropdown: (v: boolean) => void;
  currentStoreId: string;
  setCurrentStoreId: (id: string) => void;

  productsAll: Product[];
  displayedProducts: Product[];
  productSearch: string;
  setProductSearch: (v: string) => void;
  showProductDropdown: boolean;
  setShowProductDropdown: (v: boolean) => void;
  productId: string;
  setProductId: (v: string) => void;

  productZones: any[] | null;
  shelves: Shelf[];
  zones: Zone[];
  setSelectedZone: (z: Zone) => void;

  startX: string;
  setStartX: (v: string) => void;
  startY: string;
  setStartY: (v: string) => void;

  routeLoading: boolean;
  onGetRoute: () => void;
  onClear: () => void;
  showDebugOverlay: boolean;
  setShowDebugOverlay: (v: boolean) => void;
}

const SelectorsBar: React.FC<SelectorsBarProps> = ({
  knownStores,
  storeSearch,
  setStoreSearch,
  showStoreDropdown,
  setShowStoreDropdown,
  currentStoreId,
  setCurrentStoreId,
  productsAll,
  displayedProducts,
  productSearch,
  setProductSearch,
  showProductDropdown,
  setShowProductDropdown,
  productId,
  setProductId,
  productZones,
  shelves,
  zones,
  setSelectedZone,
  startX,
  setStartX,
  startY,
  setStartY,
  routeLoading,
  onGetRoute,
  onClear,
  showDebugOverlay,
  setShowDebugOverlay,
}) => {
  const getProductName = (id: string) =>
    displayedProducts.find((p) => p.productId === id)?.name ??
    productsAll.find((p) => p.productId === id)?.name ??
    undefined;

  return (
    <View style={{ width: '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {/* Store selector */}
        <View style={{ width: 160, position: 'relative' }}>
          <TextInput
            value={storeSearch || currentStoreId}
            onChangeText={(t) => { setStoreSearch(t); setShowStoreDropdown(true); }}
            onFocus={() => setShowStoreDropdown(true)}
            placeholder="Select store"
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, width: 160 }}
          />
          {showStoreDropdown && (
            <View onStartShouldSetResponder={() => true} style={{ position: 'absolute', top: 44, left: 0, zIndex: 99999, elevation: 50, width: 160, height: 200, backgroundColor: '#fff', borderColor: '#ddd', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, overflow: 'hidden' }}>
              <ScrollView style={{ height: 200 }} contentContainerStyle={{ paddingVertical: 4 }}>
                {knownStores
                  .filter((s) => s.toLowerCase().includes((storeSearch || '').toLowerCase()))
                  .map((s) => (
                    <TouchableOpacity key={s} onPress={() => {
                      setCurrentStoreId(s);
                      setStoreSearch('');
                      setProductId('');
                      setProductSearch('');
                      setShowStoreDropdown(false);
                    }} style={{ paddingVertical: 6, paddingHorizontal: 10 }}>
                      <Text style={{ lineHeight: 20, fontSize: 14 }}>{s}</Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Product selector */}
        <View style={{ width: 230, position: 'relative', marginLeft: 10 }}>
          <TextInput
            value={productSearch || getProductName(productId) || productId}
            onChangeText={(t) => { setProductSearch(t); setShowProductDropdown(true); if ((t || '').trim() === '') setProductId(''); }}
            onFocus={() => setShowProductDropdown(true)}
            placeholder="ProductId or name"
            style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, width: 220 }}
          />
          {showProductDropdown && (
            <View onStartShouldSetResponder={() => true} style={{ position: 'absolute', top: 46, left: 0, zIndex: 99999, elevation: 50, width: 220, height: 240, backgroundColor: '#fff', borderColor: '#ddd', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, overflow: 'hidden' }}>
              <View style={{ padding: 8 }}>
                {productId ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontWeight: '600' }}>
                      Selected: {getProductName(productId) ?? productId}
                    </Text>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity onPress={() => { setProductId(''); setProductSearch(''); setShowProductDropdown(true); }} style={{ marginLeft: 8, padding: 6 }}>
                        <Text style={{ color: '#d32f2f' }}>Clear</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : null}
                <ScrollView style={{ maxHeight: 200 }} contentContainerStyle={{ paddingVertical: 4 }}>
                  {displayedProducts
                    .filter((p) => (p.productId ?? '').toLowerCase().includes((productSearch || '').toLowerCase()) || (p.name ?? '').toLowerCase().includes((productSearch || '').toLowerCase()))
                    .slice(0, 50)
                    .map((p) => (
                      <TouchableOpacity key={p.productId} onPress={() => {
                        setProductId(p.productId);
                        setProductSearch(p.name ?? '');
                        setShowProductDropdown(false);
                        try {
                          if (productZones && productZones.length > 0) {
                            const mapping = productZones.find((m: any) => m.productId === p.productId);
                            if (mapping) {
                              const shelf = shelves.find((sh) => sh.id === (mapping.shelfId ?? mapping.shelf));
                              if (shelf) {
                                const zone = zones.find((z) => z.zoneId === shelf.zoneId);
                                if (zone) setSelectedZone(zone as any);
                              }
                            }
                          }
                        } catch (err) {
                          console.warn('Mapping error', String(err));
                        }
                      }} style={{ paddingVertical: 6, paddingHorizontal: 10 }}>
                        <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 6 }}>
                          <Text style={{ lineHeight: 20, fontSize: 14 }}>{p.name ?? 'Produto desconhecido'}</Text>
                          <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{p.productId}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </View>
            </View>
          )}
        </View>

        {/* Start position */}
        <View style={{ flexDirection: 'row', marginLeft: 10 }}>
          <TextInput value={startX} onChangeText={setStartX} placeholder="startX" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, width: 60, marginRight: 6 }} keyboardType="numeric" />
          <TextInput value={startY} onChangeText={setStartY} placeholder="startY" style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8, width: 60 }} keyboardType="numeric" />
        </View>

        {/* Actions */}
        <TouchableOpacity onPress={onGetRoute} style={{ marginLeft: 10, backgroundColor: '#007bff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>{routeLoading ? 'Routing...' : 'Get Route'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClear} style={{ marginLeft: 6, backgroundColor: '#607d8b', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6 }}>
          <Text style={{ color: '#fff' }}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SelectorsBar;
