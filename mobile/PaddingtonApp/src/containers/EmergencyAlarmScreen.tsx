import * as React from 'react';
import inputPoints from '../resources/data/input-point.json';
import { StyleSheet, ScrollView, View } from 'react-native';
import TypeHierarchicalMenu from '../components/TypeHierarchicalMenu';
import SignalStatusLegend from '../components/SignalStatusLegend';
import { useAppDispatch, useAppSelector } from '../store';
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

const targetType = '緊急監察系統';
const alertType = 'emergency';
// type TNavigationProp = NavigationProp<TRootStackParamList, 'EmergencyAlarm'>;

const signalTypes: TSignalTypeSuffix[] = [
  { suffix: '警報', signalType: 'alarm' },
  { suffix: '', signalType: 'default' },
];

const EmergencyAlarmScreen = ({ navigation }: { navigation: TNavigationProp }) => {
  const [hierarchy, setHierarchy] = React.useState<THierarchicalMenu>({});
  const [selectedChain, setSelectedChain] = React.useState<number[]>([]);
  const [focused, setFocused] = React.useState(false);
  const demoMode = useAppSelector(state => state.user.demoMode);
  const dispatch = useAppDispatch();
  const alertEnabled = useAppSelector(state => state.user.alertEnabled);
  const locationMask = useAppSelector(state => state.user.locationMask);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.debug('Emergency Alarm screen back in focus');
      setFocused(true);
      setSelectedChain([]);
    });
    return unsubscribe;
  }, [navigation]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.debug('Emergency Alarm screen blurred');
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
      locations,
    });
    setHierarchy(menu);
  }, [locationMask]);

  const singleDefaultItem = React.useMemo(() => {
    const tier1 = Object.keys(hierarchy);
    return tier1.length === 1 && tier1[0] === '';
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
        title={"緊急監察系統"}
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

export default EmergencyAlarmScreen;
