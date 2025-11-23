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
import { makeHierarchicalMenu, maskToLocations } from '../utils/helper';
import InputPointInspectionWithMap from '../components/InputPointInspectionWithMap';

const targetType = '電氣監察系統';
const alertType = 'electric';
// type TNavigationProp = NavigationProp<TRootStackParamList, 'Electricity'>;

const signalTypes: TSignalTypeSuffix[] = [
  // { suffix: '自動/手動', signalType: 'autoOrManual' },
  // { suffix: '開啟/關閉', signalType: 'openOrClose' },
  { suffix: '故障', signalType: 'malFunction' },
  // { suffix: '', signalType: 'default' },
  { suffix: '運行/停止', signalType: 'runOrStop' },
  { suffix: '正常', signalType: 'normal' },
  { suffix: '輸入電源供電故障', signalType: 'inputPowerMalfunction' },
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

const ElectricityScreen = ({ navigation }: { navigation: TNavigationProp }) => {
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
        <SignalStatusLegend />
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

export default ElectricityScreen;
