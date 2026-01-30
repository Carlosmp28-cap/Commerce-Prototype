import React from "react";
import { View, Text, ScrollView } from "react-native";

export interface DirectionSection {
  summary?: string;
  text?: string;
  instruction?: string;
  distanceMeters?: number;
  distance?: number;
  area?: string;
  zone?: string;
  zoneName?: string;
  target?: string;
}

interface DirectionsCardProps {
  directions: DirectionSection[] | null;
  formatDirectionSentence: (d: any, idx: number) => string;
}

const DirectionsCard: React.FC<DirectionsCardProps> = ({ directions, formatDirectionSentence }) => {
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 12, width: 360, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 }}>
      <Text style={{ fontWeight: '700', fontSize: 16 }}>Direções</Text>
      <View style={{ marginTop: 6 }}>
        {!directions || directions.length === 0 ? (
          <Text style={{ color: '#666' }}>
            Sem indicações disponíveis. Calcule uma rota para obter instruções.
          </Text>
        ) : (
          <ScrollView style={{ maxHeight: 260 }}>
            {directions.map((d: any, idx: number) => (
              <View
                key={`dir-${idx}`}
                style={{
                  flexDirection: 'row',
                  paddingVertical: 8,
                  alignItems: 'flex-start',
                  borderBottomWidth: idx < directions.length - 1 ? 1 : 0,
                  borderBottomColor: '#f0f0f0',
                }}
              >
                <View style={{ width: 28, alignItems: 'center' }}>
                  <View
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 6,
                      backgroundColor: '#007bff',
                      marginTop: 6,
                    }}
                  />
                </View>
                <View style={{ flex: 1, paddingLeft: 8 }}>
                  <Text style={{ fontWeight: '600', marginBottom: 4 }}>
                    {formatDirectionSentence(d, idx)}
                  </Text>
                  {(d.distanceMeters ?? d.distance) != null && (
                    <Text style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                      {Math.round(d.distanceMeters ?? d.distance)} m
                    </Text>
                  )}
                  {d.area && (
                    <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
                      {d.area}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default DirectionsCard;
