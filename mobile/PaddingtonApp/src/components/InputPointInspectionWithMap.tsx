import * as React from 'react';
import ImageMarker, { ImageFormat } from 'react-native-image-marker';
import InputPointList from './InputPointList';
import mapData from '../resources/data/map';
import {
  TCustomSignalPresentation,
  TInputPoint,
  TSignalTypeSuffix,
  type THierarchicalMenu,
} from '../resources/types';
import ImageModal from './ImageModal';
import { useAppSelector } from '../store';
import { locatorAdjustment } from '../resources/config';
import locator from '../resources/images/locator.png';
import { partialSort, orderTier1, orderTier2, customSort, orderTier3 } from '../utils/helper';
import { StyleSheet, View } from 'react-native';

const InputPointInspectionWithMap = ({
  focused,
  demoMode,
  hierarchy,
  selectedChain,
  signalTypes,
  customSignalPresentation,
  customCanonicalNameSortOrder
}: {
  focused: boolean;
  demoMode: boolean;
  hierarchy: THierarchicalMenu;
  selectedChain: number[];
  signalTypes: TSignalTypeSuffix[];
  customSignalPresentation?: TCustomSignalPresentation;
  customCanonicalNameSortOrder?: string[];
}) => {
  const [map, setMap] = React.useState<{
    name: string;
    src: string;
    width?: number;
    height?: number;
    x: number;
    y: number;
  } | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const refreshFrequency = useAppSelector(state => state.user?.refreshFrequency ?? 10000);

  React.useEffect(() => {
    // console.debug(`map changed: ${JSON.stringify(map)}`);
    if (!map || !map.src) {
      return;
    }

    setLoading(true);
    try {
      ImageMarker.markImage({
        backgroundImage: {
          src: map.src,
          scale: 1,
        },
        watermarkImages: [
          {
            src: locator,
            scale: 1,
            position: {
              X:
                map.x - locatorAdjustment.x < 0
                  ? 0
                  : map.x - locatorAdjustment.x, // left
              Y:
                map.y - locatorAdjustment.y < 0
                  ? 0
                  : map.y - locatorAdjustment.y, // top
            },
          },
        ],
        quality: 100, // quality of image
        saveFormat: ImageFormat.png,
      })
        .then(res => {
          setImageUrl(res);
          // setLoading(false);
          // console.debug('the path is' + res);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (err) {
      console.error(err);
    }
  }, [map]);

  const selectedInputPoints = React.useMemo(() => {
    // console.log(`InputPointInspectionWithMap: selectedInputPoints()`);
    console.log(`selectedInputPoints: hierarchy = %o`, hierarchy);
    const tier1 = partialSort(Object.keys(hierarchy), orderTier1);
    // console.log(`tier1=${JSON.stringify(tier1)}`);
    if (typeof selectedChain[0] !== 'undefined') {
      const tier1Items = hierarchy[tier1[selectedChain[0]]];
      // console.log(
      //   `tier1Items = ${JSON.stringify(tier1Items).substring(0, 100)}`,
      // );
      if (tier1Items instanceof Array) {
        return tier1Items;
      } else if (typeof selectedChain[1] !== 'undefined') {
        const tier2 = partialSort(Object.keys(tier1Items), orderTier2);
        console.log(`tier2 = ${JSON.stringify(tier2)}`);
        const tier2Items = tier1Items[tier2[selectedChain[1]]];
        // console.log(`tier2Items = ${JSON.stringify(tier2Items)}`);
        if (tier2Items instanceof Array) {
          return tier2Items;
        } else if (typeof selectedChain[2] !== 'undefined') {
          const tier3 = partialSort(Object.keys(tier2Items), orderTier3);
          console.log(`tier3 = ${JSON.stringify(tier3)}`);
          const tier3Items = tier2Items[tier3[selectedChain[2]]];
          console.log(`tier3Items = ${JSON.stringify(tier3Items)}`);
          if (Array.isArray(tier3Items)) {
            return tier3Items;
          }
        }
      }
    }

    // if (typeof selectedChain[0] !== 'undefined')
  }, [hierarchy, selectedChain]);

  const uniqueLevels = React.useMemo(() => {
    const levels = selectedInputPoints?.map((v) => v.level).filter((l): l is number => !!l);
    const uniqueLevels = [...new Set(levels)].sort();
    return uniqueLevels;
  }, [selectedInputPoints]);

  const inputPointViewHandler = React.useCallback(
    (id: number) => {
      // console.debug(`input clicked: #${id}, loading = ${loading}`);
      const inputPointPressed = selectedInputPoints?.find(
        (v: TInputPoint) => v.id === id,
      );
      // console.debug(`inputPointPressed = ${JSON.stringify(inputPointPressed)}`);
      if (inputPointPressed && !loading) {
        setLoading(true); // set loading to true to hide previous map image, to prevent map image flickering during update
        const targetMap = mapData.find(v => v.id === inputPointPressed.mapId);
        const mapInfo = {
          name: `${inputPointPressed.canonicalName}${inputPointPressed.location ? ' @ ' + inputPointPressed.location : ''}`,
          src: targetMap?.map ?? '',
          width: targetMap?.map_width,
          height: targetMap?.map_height,
          x: inputPointPressed.x,
          y: inputPointPressed.y,
        };
        setMap(mapInfo);
      }
    },
    [selectedInputPoints, loading],
  );

  return (
    <React.Fragment>
      {uniqueLevels && uniqueLevels.length > 0 && uniqueLevels.map((l: number, levelIndex: number) => (
        <View key={l} style={styles.inputPointContainer}>
          {uniqueLevels.length > 1 && levelIndex > 0 && (
            <View
              style={{ backgroundColor: 'cyan', height: 4, width: '80%' }}
            />
          )}
          <InputPointList
            demoMode={demoMode}
            inputPoints={selectedInputPoints?.filter(v => v.level === l)}
            onInputPointPress={inputPointViewHandler}
            signalTypesLabels={signalTypes}
            focused={focused && typeof selectedChain[0] !== 'undefined'}
            refreshFrequency={refreshFrequency}
            customSignalPresentation={customSignalPresentation}
            customCanonicalNameSortOrder={customCanonicalNameSortOrder}
          />
        </View>
      ))}
      {(!uniqueLevels || uniqueLevels.length === 0) && <InputPointList
        demoMode={demoMode}
        inputPoints={selectedInputPoints}
        onInputPointPress={inputPointViewHandler}
        signalTypesLabels={signalTypes}
        focused={focused && typeof selectedChain[0] !== 'undefined'}
        refreshFrequency={refreshFrequency}
        customSignalPresentation={customSignalPresentation}
        customCanonicalNameSortOrder={customCanonicalNameSortOrder}
      />}

      {map && map.src && !loading && (
        <ImageModal
          imageUrl={imageUrl}
          visible={!!(map && map.src && !loading)}
          title={map.name}
          onClose={() => setMap(null)}
        />
      )}
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  inputPointContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
})

export default InputPointInspectionWithMap;
