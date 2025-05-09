import * as React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableHighlight,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAppDispatch, useAppSelector } from '../store';
import ScreenTitle from '../components/ScreenTitle';
import type {
  TChannelValue,
  TLiftChannelData,
  TLiftSignalConversion,
  TNavigationProp,
  TRootStackParamList,
} from '../resources/types';
import liftChannelData from '../resources/data/lift-data.json';
import liftSignalConversionData from '../resources/data/lift-signal-data.json';
import { getModbusChannelValues } from '../api/modbusChannelApi';
import useRecursiveTimeout from '../utils/useRecursiveTimeout';
import { changeAlertMode } from '../features/user/userSlice';
import TypeHierarchicalMenu from '../components/TypeHierarchicalMenu';
import { maskToLocations } from '../utils/helper';
import { api } from '../resources/api';

const targetType = '電梯監察系統';
const alertType = 'lift';
const liftLevels = ['L1', 'L2', 'L3', 'L4'];

const liftHierarchy = {
  'L1-12': ['L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07', 'L08', 'L09', 'L10', 'L11', 'L12'],
  'L13-25': ['L13', 'L14', 'L15', 'L16', 'L17', 'L18', 'L19', 'L20', 'L21', 'L22', 'L23', 'L24', 'L25']
}

const darkGreen = "#264c08"
const lightGreen = "#80ff24"
const darkRed = "#3f0604"
const lightRed = "#ff0000"

const liftParameters = {
  "floorPositionUnit": {
    label: "樓層位置",
    alertType: "liftposition"
  },
  "floorPositionTen": {
    label: "樓層位置",
    alertType: "liftposition"
  },
  "floorPositionHundred": {
    label: "樓層位置",
    alertType: "liftposition"
  },
  "operationLightUp": {
    label: "運行燈(上)",
    alertType: "green"
  },
  "operationLightDown": {
    label: "運行燈(下)",
    alertType: "green"
  },
  "normalPower": {
    label: "正常電源",
    alertType: "green"
  },
  "inService": {
    label: "服務中",
    alertType: "green"
  },
  "fault": {
    label: "故障",
    alertType: "red"
  },
  "emergency": {
    label: "緊急電源",
    alertType: "red"
  },
  "alarm": {
    label: "警鐘",
    alertType: "red"
  },
  "returnToMainFloor": {
    label: "回歸主樓層",
    alertType: "green"
  },
  "cardReader": {
    label: "讀咭開關",
    alertType: "green"
  }
}

function getRandomString(length) {
  var result = '';
  var characters = ' 0123456789ABCEDFGHIJKLMNOPQRSTUVWXYZ';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const Signal = ({ demoMode, badTerminal, digitalStatus, alertType, allowed }) => {
  let backgroundColor, color
  if (demoMode) {
    const randomBadTerminal = Math.random() > 0.95
    const randomDigitalStatus = Math.random() > 0.9
    color = randomBadTerminal ? 'lightgrey' : !!randomDigitalStatus ? (alertType === 'red' ? 'lightsalmon' : 'lightgreen') : (alertType === 'red' ? 'red' : 'green')
    backgroundColor = randomBadTerminal || !randomDigitalStatus ? 'transparent' : '#ccc'
  } else {
    if (badTerminal === null) {
      return (
        <View style={[styles.tableHeader, styles.tableRow, { backgroundColor }]}>
          <Text style={{ fontSize: 12, color: 'black', fontWeight: 'bold' }}>-</Text>
        </View>)
    }
    color = badTerminal
      ? 'lightgrey'
      : !!digitalStatus
        ? alertType === 'red'
          ? lightRed
          : lightGreen
        : alertType === 'red'
          ? darkRed
          : darkGreen;
    // backgroundColor = badTerminal || !digitalStatus ? 'transparent' : '#ccc'
    backgroundColor = 'transparent'
  }
  return (
    <View style={[styles.tableHeader, styles.tableRow, { backgroundColor }]}>
      {allowed ? <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
        <Icon name="circle" size={18} color={color} />
      </Text> : <Text style={{ fontSize: 16 }}>-</Text>}
    </View>
  )

}

const LiftScreen = ({ navigation }: { navigation: TNavigationProp }) => {
  const dispatch = useAppDispatch();
  const demoMode = useAppSelector(state => state.user.demoMode);
  const alertEnabled = useAppSelector(state => state.user.alertEnabled);
  const locationMask = useAppSelector(state => state.user.locationMask);
  const refreshFrequency = useAppSelector(state => state.user.refreshFrequency);
  const authenticationToken = useAppSelector(state => state.user.authenticationToken);
  // const { demoMode, userDetails, alert } = useSelector((state: any) => state.login);
  // const demoMode = useSelector((state: any) => state.login.demoMode);
  // const userDetails = useSelector((state: any) => state.login.userDetails);
  const [focused, setFocused] = React.useState(false)
  // const refreshFrequency = useSelector((state: any) => state.login.refreshFrequency);
  const [selectedChain, setSelectedChain] = React.useState<number[]>([]);
  const [timer, setTimer] = React.useState(null)
  const updateSelectedChain = (selected: any) => {
    console.debug(`selected = ${JSON.stringify(selected)}`);
    setSelectedChain(selected);
  };
  const [channelValues, setChannelValues] = React.useState<any>({})

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.debug('Lift screen back in focus')
      setFocused(true)
      setSelectedChain([])
    });
    return unsubscribe;
  }, [navigation, selectedChain]);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      console.debug('Lift screen blurred')
      setFocused(false)
      if (timer) {
        clearTimeout(timer)
        setTimer(null)
      }
    });
    return unsubscribe;
  }, [navigation, timer]);

  const selectedLevels = React.useMemo(
    () => {
      const liftTiers = Object.keys(liftHierarchy)
      const selectedLevels = liftHierarchy[liftTiers[selectedChain[0]]]
      console.debug(`selectedLevels = ${JSON.stringify(selectedLevels)}`)
      return selectedLevels
    },
    [selectedChain]
  )

  React.useEffect(
    () => {
      if (!selectedLevels) {
        return
      }
      console.debug(`selectedLevels = ${JSON.stringify(selectedLevels)}`)
      let newChannelValues: any = {}
      selectedLevels.forEach((level: string) => {
        const lift = liftChannelData[level]
        if (lift) {
          const liftParameterNames = Object.keys(liftParameters)
          liftParameterNames.forEach(liftParameterName => {
            const channelId = lift[liftParameterName]
            newChannelValues[channelId] = {
              badTerminal: null,
              digitalStatus: null,
              engineeringValue: null
            }
          })
        }
        // newChannelValues[level] = {
        //   badTerminal: null,
        //   digitalStatus: null,
        //   engineeringValue: null
        // }
      })
      setChannelValues({
        ...channelValues,
        ...newChannelValues
      })
    },
    [selectedLevels]
  )

  const selectedChannels = React.useMemo(
    () => {
      if (!selectedLevels) {
        return []
      }
      const channelIds = []
      selectedLevels.forEach(level => {
        const lift = liftChannelData[level]
        if (!lift) {
          return
        }
        Object.keys(liftParameters).forEach(parameter => {
          if (lift[parameter]) {
            channelIds.push(lift[parameter])
          }
        })
      })
      console.debug(`channelIds = ${JSON.stringify(channelIds)}`)
      return channelIds
    },
    [selectedLevels]
  )

  React.useEffect(
    () => {
      if (selectedChannels.length <= 0 || demoMode) {
        return
      }
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${authenticationToken ?? ''}`,
        },
      };
      const apiStatusUrl = api.channelStatusUrl(
        // signalTypes.map((signalType) => data[signalType].id),
        selectedChannels,
      );
      const apiQueryUrl = api.channelQueryUrl(
        // signalTypes.map((signalType) => data[signalType].id),
        selectedChannels,
      );
      console.debug(`apiStatusUrl = ${apiStatusUrl}`)
      console.debug(`apiQueryUrl = ${apiQueryUrl}`)

      const fetchData = async () => {
        if (focused) {
          console.debug(`Lift screen in focus. Will retrieve data`)
          try {
            const newChannelValues = {}
            const statusValues = await fetch(apiStatusUrl, options).then((res) => res.json())
            statusValues.forEach(v => {
              newChannelValues[v.modbusChannelID] = {
                badTerminal: v.badTerminal
              }
            })

            const queryValues = await fetch(apiQueryUrl, options).then((res) => res.json())
            queryValues.forEach(v => {
              newChannelValues[v.modbusChannelID] = {
                ...newChannelValues[v.modbusChannelID],
                digitalStatus: v.digitalStatus,
                engineeringValue: v.engineeringValue,
              }
            })

            // console.debug(`newChannelValues = ${JSON.stringify(newChannelValues)}`)
            setChannelValues({
              ...channelValues,
              ...newChannelValues
            })
          } catch (error) {
            console.error(error)
          }
        } else {
          console.debug(`Lift screen not in focus. Skip signal data retrieval`)
        }
        if (timer) {
          clearTimeout(timer)
          setTimer(null)
        }
        if (focused) {
          const timeout = setTimeout(fetchData, refreshFrequency)
          setTimer(timeout)
        }
      }
      if (timer) {
        clearTimeout(timer)
        setTimer(null)
      }
      fetchData()
    },
    [selectedChannels, refreshFrequency, focused]
  );

  const handleAlertToggle = () => {
    dispatch(
      changeAlertMode({
        system: 'lift',
        enabled: !alertEnabled?.lift,
      }),
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <ScreenTitle
        title={'電梯監察系統'}
        showAlertToggle={true}
        enabled={!!alertEnabled?.lift}
        onValueChange={handleAlertToggle}
      />
      <View style={styles.sectionContentsContainer}>
        <TypeHierarchicalMenu
          hierarchy={liftHierarchy}
          selectedChain={selectedChain}
          onUpdate={updateSelectedChain}
        />
        {selectedLevels && <ScrollView style={styles.table}>
          <LiftHeader levels={selectedLevels} />
          <LiftPositionRow
            demoMode={demoMode}
            levels={selectedLevels}
            liftChannelData={liftChannelData}
            channelValues={channelValues}
            allowedLocations={maskToLocations(locationMask)}
          />
          {Object.keys(liftParameters).filter(parameter => liftParameters[parameter]?.alertType !== 'liftposition').map(parameter => {
            return (<LiftRow
              demoMode={demoMode}
              key={parameter}
              parameter={parameter}
              levels={selectedLevels}
              liftChannelData={liftChannelData}
              label={liftParameters[parameter]?.label ?? '-'}
              channelValues={channelValues}
              alertType={liftParameters[parameter]?.alertType}
              allowedLocations={maskToLocations(locationMask)}
            />)
          })}
        </ScrollView>}
      </View>
    </View >
  );
};

const LiftHeader = ({ levels }) => {
  return (
    <View style={styles.liftDataRow}>
      <View style={styles.tableHeaderLabel}>
        <Text style={styles.liftNumberHeader}>升降機編號</Text>
      </View>
      {levels.map(level => <View key={level} style={styles.tableHeader}>
        <Text style={styles.liftNumberHeader}>{level}</Text>
      </View>)}
    </View>
  )
}

const LiftPositionRow = ({ demoMode, levels, liftChannelData, channelValues, allowedLocations }) => {
  return (
    <View style={styles.liftDataRow}>
      <View style={[styles.tableHeaderLabel, styles.tableRowLabel]}>
        <Text style={{ fontSize: 16 }}>樓層位置</Text>
      </View>
      {levels.map(level => {
        const allowed = liftChannelData[level]?.locations?.filter(location => allowedLocations.includes(location))?.length > 0
        const floorPositionUnit = channelValues[liftChannelData[level]?.floorPositionUnit]?.engineeringValue ?? "-".charCodeAt(0)
        const floorPositionTen = channelValues[liftChannelData[level]?.floorPositionTen]?.engineeringValue ?? "-".charCodeAt(0)
        const floorPositionHundred = channelValues[liftChannelData[level]?.floorPositionHundred]?.engineeringValue ?? "-".charCodeAt(0)
        const position = demoMode ? getRandomString(3) : `${String.fromCharCode(floorPositionHundred)}${String.fromCharCode(floorPositionTen)}${String.fromCharCode(floorPositionUnit)}`
        return <View key={level} style={[styles.tableHeader, styles.tableRow]}>
          {allowed ? <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{position}</Text> : <Text style={{ fontSize: 16 }}>-</Text>}
        </View>
      })}
    </View>
  )
}

const LiftRow = ({ demoMode, parameter, levels, liftChannelData, label, channelValues, alertType, allowedLocations }) => {
  React.useEffect(
    () => {
      console.debug(`LiftRow(): parameter=${parameter}`)
    },
    []
  )

  return (
    <View style={styles.liftDataRow}>
      <View style={[styles.tableHeaderLabel, styles.tableRowLabel]}>
        <Text style={{ fontSize: 16 }}>{label}</Text>
      </View>
      {levels.map(level => {
        const allowed = liftChannelData[level]?.locations?.filter(location => allowedLocations.includes(location))?.length > 0
        const channelId = liftChannelData[level]?.[parameter]
        if (channelId) {
          const engineeringValue = channelValues?.[channelId]?.engineeringValue ?? 0
          const badTerminal = channelValues?.[channelId]?.badTerminal ?? null
          const digitalStatus = channelValues?.[channelId]?.digitalStatus ?? 0
          return <Signal key={level} demoMode={demoMode} badTerminal={badTerminal} alertType={alertType} digitalStatus={digitalStatus} allowed={allowed} />
        }
      })}
    </View>
  )
}

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
  table: {
    flex: 1,
    width: '95%',
    marginTop: 10,
    marginBottom: 20,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: 'white',
  },
  liftDataRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
  },
  tableHeaderLabel: {
    flex: 2,
    backgroundColor: '#FFD580',
    paddingLeft: 10,
    paddingRight: 4,
    alignItems: 'flex-start',
    justifyContent: 'center',
    borderColor: '#FFD580',
    borderStyle: 'solid',
    borderWidth: 1,
    // height: 48
    height: '100%'
  },
  tableHeader: {
    flex: 1,
    backgroundColor: '#FFD580',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFD580',
    borderStyle: 'solid',
    borderWidth: 1,
    height: '100%',
  },
  tableRowLabel: {
    backgroundColor: 'white',
    borderColor: 'cyan',
  },
  tableRow: {
    backgroundColor: 'white',
    borderColor: 'cyan',
  },
});

export default LiftScreen;
