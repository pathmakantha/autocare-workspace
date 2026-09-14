import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { buildQrCells, QR_GRID_SIZE } from '@/utils/qrCells';

interface Props {
  seed: string;
  color: string;
  cellSize?: number;
}

export default function QrCode({ seed, color, cellSize = 7 }: Props) {
  const cells = useMemo(() => buildQrCells(seed, color), [seed, color]);
  return (
    <View style={[styles.grid, { width: cellSize * QR_GRID_SIZE }]}>
      {cells.map((bg, i) => (
        <View key={i} style={{ width: cellSize, height: cellSize, backgroundColor: bg }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
});
