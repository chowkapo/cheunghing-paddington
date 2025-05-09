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
import PowerDevicePointReading from './PowerDevicePointReading';
import lightingChannelData from '../resources/data/lighting-channels.json';
import { api } from '../resources/api';
import { useAppSelector } from '../store';

const labelKeys = [
    'powerConsumption',
    'maximumDemand',
];

const countPerRow = 6

const LandscapeLightingReadingTable = ({
    demoMode,
    devicePoints
}) => {
    const [channelData, setChannelData] = useState<any>(null);
    const [channelValues, setChannelValues] = useState<any>({});
    const authenticationToken = useAppSelector(state => state.user.authenticationToken);

    useEffect(() => {
        const deviceIdList = devicePoints.map(v => v.id)
        const channels = lightingChannelData.filter(
            (v) => deviceIdList.includes(v.deviceId),
        );
        console.debug(`channels: ${JSON.stringify(channels, null, 2)}`);
        setChannelData(channels);
    }, [devicePoints]);

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
                const newChannelValues = {};
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

    // const lightingData = useMemo(
    //   () => devicePoints.map(v => {
    //     const match = /^L(\d+)-Meter$/.exec(v.name)
    //     return {
    //       id: v.id,
    //       name: match && match[1]
    //     }
    //   }).sort((a, b) => parseInt(a.name) > parseInt(b.name))
    //     .filter(v => v.name).map(v => ({
    //       name: `Lift ${v.name}`,
    //       deviceId: v.id,
    //     }))
    //   ,
    //   [devicePoints]
    // )

    return (
        <ScrollView
            style={styles.contentContainer}
            contentContainerStyle={styles.content}>
            {/*<Text>{JSON.stringify(channelData)}</Text>*/}
            {/*<Text>{JSON.stringify(devicePoints)}</Text>*/}
            {
                channelData &&
                <View style={styles.devicePointReadingTable}>
                    {/*<Text>{JSON.stringify(lightingData)}</Text>*/}
                    <View style={[styles.dataRow, styles.headerRow]}>
                        <View style={styles.label} />
                        <View style={styles.value}>
                            <Text style={styles.headerText}>Characteristics</Text>
                        </View>
                    </View>
                    {
                        labelKeys.map(labelKey => {
                            const channelId = channelData.find(d => d.key === labelKey)?.channelId
                            return (<View key={labelKey} style={styles.dataRow}>
                                <View style={[styles.label, styles.labelBorder]}>
                                    <Text>
                                        {channelData.find(v => v.key === labelKey)?.label}
                                    </Text>
                                </View>
                                {
                                    <View style={styles.value}>
                                        <Text>
                                            {
                                                demoMode ? `[#${channelId}] ${channelData?.find(d => d.channelId === channelId)?.unit ?? ''}` :
                                                    `${channelValues[channelId]?.engineeringValue?.toFixed(2) ?? '-'} ${channelData?.find(d => d.channelId === channelId)?.unit ?? ''}`
                                            }
                                        </Text>
                                    </View>
                                }
                            </View>)
                        })
                    }
                </View>
            }
        </ScrollView>
    );
};

export default LandscapeLightingReadingTable;

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
        flex: 6,
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
