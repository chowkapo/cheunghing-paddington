import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    ScrollView,
    View,
    Text,
    Image,
    Alert,
    Modal,
    TouchableOpacity,
    Dimensions,
    ImageBackground,
} from 'react-native';
import base64 from 'base-64';
import { Button } from 'react-native-elements';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import PowerDevicePointReading from './PowerDevicePointReading';
import liftPowerChannelData from '../resources/data/lift-power-channels.json';
import { api } from '../resources/api';
import { useAppSelector } from '../store';

const labelKeys = [
    'powerConsumption',
    'trendLogOfEnergyConsumption',
    'maximumDemand',
    'totalHarmonicDistortion',
    'powerOutput',
];

const liftCountPerRow = 6

const LiftPowerReadingTable = ({
    demoMode,
    liftDevicePoints
}) => {
    const [channelData, setChannelData] = useState<any>(null);
    const [channelValues, setChannelValues] = useState<any>({});
    const authenticationToken = useAppSelector(state => state.user.authenticationToken);

    useEffect(() => {
        const deviceIdList = liftDevicePoints.map(v => v.id)
        const channels = liftPowerChannelData.filter(
            (v) => deviceIdList.includes(v.deviceId),
        );
        console.debug(`channels: ${JSON.stringify(channels, null, 2)}`);
        setChannelData(channels);
    }, [liftDevicePoints]);

    useEffect(() => {
        if (!channelData || demoMode) {
            return;
        }
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${authenticationToken ?? ''}`,
            },
        };
        const apiStatusUrl = api.channelStatusUrl(
            channelData.map((v) => v.channelId),
        );

        console.debug(`apiStatusUrl = ${apiStatusUrl}`);
        const apiQueryUrl = api.channelQueryUrl(
            channelData.map((v) => v.channelId),
        );
        console.debug(`apiQueryUrl = ${apiQueryUrl}`);

        const fetchData = async () => {
            try {
                const newChannelValues: any = {};
                const statusValues = await fetch(apiStatusUrl, options).then((res) =>
                    res.json(),
                );
                statusValues.forEach((v) => {
                    newChannelValues[v.modbusChannelID] = {
                        badTerminal: v.badTerminal,
                    };
                });

                const queryValues = await fetch(apiQueryUrl, options).then((res) =>
                    res.json(),
                );
                queryValues.forEach((v) => {
                    newChannelValues[v.modbusChannelID] = {
                        ...newChannelValues[v.modbusChannelID],
                        digitalStatus: v.digitalStatus,
                        engineeringValue: v.engineeringValue,
                    };
                });
                console.debug(`newChannelValues = ${JSON.stringify(newChannelValues)}`);
                setChannelValues({
                    ...channelValues,
                    ...newChannelValues,
                });
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, [channelData, channelValues, demoMode]);

    const liftData = useMemo(
        () => liftDevicePoints.map(v => {
            const match = /^L(\d+)-Meter$/.exec(v.name)
            return {
                id: v.id,
                name: match && match[1]
            }
        }).sort((a, b) => parseInt(a.name) > parseInt(b.name))
            .filter(v => v.name).map(v => ({
                name: `Lift ${v.name}`,
                deviceId: v.id,
            }))
        ,
        [liftDevicePoints]
    )

    return (
        <ScrollView
            style={styles.contentContainer}
            contentContainerStyle={styles.content}>
            {
                liftPowerChannelData && liftData && Array.from(Array(Math.ceil(liftData.length / liftCountPerRow)).keys()).map((rowIndex, i) =>
                    <View key={i} style={styles.devicePointReadingTable}>
                        {/*<Text>{JSON.stringify(channelData)}</Text>*/}
                        {/*<Text>{JSON.stringify(liftDevicePoints)}</Text>*/}
                        {/*<Text>{JSON.stringify(liftData)}</Text>*/}
                        <View style={[styles.dataRow, styles.headerRow]}>
                            <View style={styles.label} />
                            {
                                Array.from(Array(liftCountPerRow).keys()).map(rawIndex => {
                                    const index = rowIndex * liftCountPerRow + rawIndex
                                    const data = liftData[index]
                                    if (data) {
                                        return (<View key={data.deviceId} style={styles.value}>
                                            <Text style={styles.headerText}>{data.name}</Text>
                                        </View>
                                        );
                                    } else {
                                        return <View key={index} style={styles.value} />
                                    }
                                })
                            }
                        </View>
                        {
                            labelKeys.map(labelKey => <View key={labelKey} style={styles.dataRow}>
                                <View style={[styles.label, styles.labelBorder]}>
                                    <Text>
                                        {liftPowerChannelData.find(v => v.key === labelKey)?.label}
                                    </Text>
                                </View>
                                {
                                    Array.from(Array(liftCountPerRow).keys()).map(rawIndex => {
                                        const index = rowIndex * liftCountPerRow + rawIndex
                                        const data = liftData[index]
                                        if (data) {
                                            const channelId = liftPowerChannelData.find(d => d.deviceId === data.deviceId && d.key === labelKey)?.channelId ?? ''
                                            return (<View key={data.deviceId} style={styles.value}>
                                                <Text>
                                                    {
                                                        demoMode ? `[#${channelId}] ${channelData?.find(d => d.channelId === channelId)?.unit ?? ''}` :
                                                            `${channelValues[channelId]?.engineeringValue?.toFixed(2) ?? '-'} ${channelData?.find(d => d.channelId === channelId)?.unit ?? ''}`
                                                    }
                                                </Text>
                                            </View>)
                                        } else {
                                            return <View key={index} style={styles.value} />
                                        }
                                    })
                                }
                            </View>)
                        }
                    </View>
                )
            }
        </ScrollView>
    );
};

export default LiftPowerReadingTable;

const styles = StyleSheet.create({
    curtain: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    mapContainer: {
        display: 'flex',
        flexDirection: 'column',
        // alignItems: 'center',
        justifyContent: 'space-between',
        width: '90%',
        height: '90%',
        // padding: 50,
        paddingTop: 0,
        backgroundColor: 'white',
        shadowOffset: {
            width: 0,
            height: 0,
        },
        shadowOpacity: 0.7,
        shadowRadius: 15,
    },
    modalHeader: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'lightgrey',
        paddingLeft: 24,
        paddingRight: 24,
    },
    modalHeading: {
        fontWeight: '600',
        fontSize: 24,
    },
    contentContainer: {
        // overflow: 'scroll'
        // width: '100%'
    },
    content: {
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // flex: 1,
        // width: '100%',
        minWidth: 1000,
        // backgroundColor: 'blue'
        // justifyContent: 'center',
        // flex: 1
    },
    closeButton: {
        height: 40,
        marginTop: 10,
        marginBottom: 10,
    },
    map: {
        width: '90%',
        height: '90%',
        resizeMode: 'contain',
    },

    devicePointReadingTable: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
        // backgroundColor: 'yellow',
        // width: 800
        // flex: 1,
        // width: '100%',
        // height: '100%'
    },
    dataRow: {
        display: 'flex',
        flexDirection: 'row',
        // width: '100%',
        // backgroundColor: 'orange',
        height: 36
        // padding: 2
    },
    headerRow: {
        backgroundColor: '#FFD580',
        // width: '100%'
    },
    headerText: {
        // color: 'white',
        fontWeight: 'bold'
    },
    label: {
        flex: 2.5,
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    labelBorder: {
        borderRightColor: '#eee',
        borderRightWidth: 2,
        paddingRight: 12,
        borderStyle: 'solid'
    },
    blank: {
        backgroundColor: '#eee'
    },
    value: {
        flex: 1,
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
