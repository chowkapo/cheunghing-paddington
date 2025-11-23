import * as React from 'react';
import inputPoints from '../resources/data/input-point.json';
import { StyleSheet, ScrollView, View } from 'react-native';
import TypeHierarchicalMenu from '../components/TypeHierarchicalMenu';
import SignalStatusLegend from '../components/SignalStatusLegend';
import { useAppSelector, useAppDispatch } from '../store';
import ScreenTitle from '../components/ScreenTitle';
import type {
  TSignalTypeSuffix,
  TRootStackParamList,
  THierarchicalMenu,
  TNavigationProp,
} from '../resources/types';
import { changeAlertMode } from '../features/user/userSlice';
import type { NavigationProp } from '@react-navigation/native';
import { makeHierarchicalMenu, maskToLocations, orderTier2, orderTier3, partialSort } from '../utils/helper';
import InputPointInspectionWithMap from '../components/InputPointInspectionWithMap';

const targetType = '消防監察系統';
const alertType = 'fire';
// type TNavigationProp = NavigationProp<TRootStackParamList, 'Electricity'>;

const signalTypes: TSignalTypeSuffix[] = [
  { suffix: '自動/手動', signalType: 'autoOrManual' },
  { suffix: '開啟/關閉', signalType: 'openOrClose' },
  { suffix: '故障', signalType: 'malFunction' },
  { suffix: '警報', signalType: 'alarm' },
  { suffix: '', signalType: 'default' },
];

const customSignalPresentation = {
  '0': { autoOrManual: '自動', runOrStop: '停止', openOrClose: '關閉' },
  '1': { autoOrManual: '手動', runOrStop: '運行', openOrClose: '開啟' },
  '2': { autoOrManual: '手動', runOrStop: '運行', openOrClose: '開啟' },
  '3': { autoOrManual: '自動', runOrStop: '停止', openOrClose: '關閉' },
  '4': { autoOrManual: '自動', runOrStop: '停止', openOrClose: '關閉' },
  '5': {
    autoOrManual: '通訊中斷',
    runOrStop: '通訊中斷',
    openOrClose: '通訊中斷',
  },
};

const combinedSignalStatus = [
  'T2-LVSB-G1',
  'T2-LVSB-G2',
  'T1-LVSB-G3',
  'T3-LVSB-G4',
];

const FireScreen = ({ navigation }: { navigation: TNavigationProp }) => {
  const [hierarchy, setHierarchy] = React.useState<THierarchicalMenu>({});
  const [selectedChain, setSelectedChain] = React.useState<number[]>([]);
  const [focused, setFocused] = React.useState(false);
  const demoMode = useAppSelector(state => state.user.demoMode);
  const dispatch = useAppDispatch();
  const alertEnabled = useAppSelector(state => state.user.alertEnabled);
  const locationMask = useAppSelector(state => state.user.locationMask);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.debug('Electricity screen back in focus');
      setFocused(true);
      setSelectedChain([]);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.debug('Electricity screen blurred');
      setFocused(false);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
      const locations = maskToLocations(locationMask);
    const menu = makeHierarchicalMenu({
      inputPointData: inputPoints,
      targetType,
      signalTypes,
      locations
    });
    setHierarchy(menu);
  }, []);

  const singleDefaultItem = React.useMemo(() => {
    const tier1 = Object.keys(hierarchy);
    const singleFirstLevel = tier1.length === 1 && tier1[0] === ''
    console.log(`singleFirstLevel = ${singleFirstLevel}`)
    return singleFirstLevel;
  }, [hierarchy]);

  React.useEffect(() => {
    if (focused) {
      if (singleDefaultItem) {
        setSelectedChain([0]);
      }
    }
  }, [singleDefaultItem, focused]);

  const updateSelectedChain = (selected: number[]) => {
    console.debug(`selected = ${JSON.stringify(selected)}`);
    setSelectedChain(selected);
  };
  const tier1 = React.useMemo(() => Object.keys(hierarchy), [hierarchy]);

  const tier2 = React.useMemo(
    () =>
      partialSort(
        tier1 && typeof selectedChain[0] !== 'undefined'
          ? Object.keys(hierarchy[tier1[selectedChain[0]]]).filter((v) => v)
          : [],
        orderTier2,
      ),
    [hierarchy, selectedChain, tier1],
  );

  const tier3 = React.useMemo(
    () =>
      partialSort(
        tier2 &&
        typeof selectedChain[1] !== 'undefined' &&
        Object.keys(
          hierarchy[tier1[selectedChain[0]]][tier2[selectedChain[1]]],
        ).filter((v) => v),
        orderTier3,
      ),
    [tier1, tier2, selectedChain, hierarchy],
  );

  const handleAlertToggle = () => {
    dispatch(
      changeAlertMode({
        system: alertType,
        enabled: !alertEnabled?.[alertType],
      }),
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <ScreenTitle
        title={targetType}
        showAlertToggle={true}
        enabled={!!alertEnabled?.[alertType]}
        onValueChange={handleAlertToggle}
      />
      <View style={styles.sectionContentsContainer}>
        {!singleDefaultItem && (
          <TypeHierarchicalMenu
            hierarchy={hierarchy}
            selectedChain={selectedChain}
            onUpdate={updateSelectedChain}
          />
        )}
        <ScrollView style={styles.inputPointAndMapContainer}>
          <InputPointInspectionWithMap
            focused={focused}
            demoMode={demoMode}
            hierarchy={hierarchy}
            selectedChain={selectedChain}
            signalTypes={signalTypes}
            customSignalPresentation={customSignalPresentation}
          />
        </ScrollView>
      </View>
      <View style={styles.legendContainer}>
        <SignalStatusLegend combineSignalStatus={
          tier3 &&
          !!combinedSignalStatus.includes(tier3[selectedChain[2]])
        } />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    height: '100%',
    flexDirection: 'column',
  },
  sectionContentsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  legendContainer: {
    height: 80,
  },
  inputPointAndMapContainer: {
    overflow: 'scroll',
  },
});

export default FireScreen;
