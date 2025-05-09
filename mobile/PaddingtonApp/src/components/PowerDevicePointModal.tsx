import React, { useState, useRef, useEffect } from 'react';
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
import powerChannelData from '../resources/data/power-channels.json';
import { api } from '../resources/api';
import { useAppSelector } from '../store';

const labels = [
    'phaseToPhaseVoltage',
    'phaseToNeutralVoltage',
    'current',
    'harmonicCurrentTHD',
];
const lineHeadings = ['L1', 'L2', 'L3'];

const characteristicLabels = [
    'kWh',
    'powerFactor',
    'frequency',
    'activePower',
    'apparentPower',
];

const PowerDevicePointModal = ({
    demoMode,
    title,
    devicePoint,
    visible,
    onClose,
    focused,
    refreshFrequency
}) => {
    const [channelData, setChannelData] = useState<any>(null);
    const [channelValues, setChannelValues] = useState<any>({});
    const [timer, setTimer] = useState(null)
    const savedFocus = React.useRef(focused);
    const authenticationToken = useAppSelector(state => state.user.authenticationToken);

    React.useEffect(() => {
        console.debug(`###PowerDevicePointModal### save new focus: ${focused}`)
        savedFocus.current = focused;
    }, [focused]);

    useEffect(() => {
        const channels = powerChannelData.filter(
            (v) => v.deviceId === devicePoint?.id,
        );
        console.debug(`###PowerDevicePointModal### channels: ${JSON.stringify(channels, null, 2)}`);
        setChannelData(channels);
    }, [devicePoint]);


    useEffect(() => {
        if (!channelData || demoMode) {
            return;
        }
        console.debug(`Power useEffect: %o %o %o %o %o`, channelData, channelValues, demoMode, focused, refreshFrequency)
        const options = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Basic ${authenticationToken ?? ''}`,
            },
        };

        const fetchData = async () => {
            if (focused) {
                console.debug(`Power screen in focus. Will retrieve data`)
                try {
                    const apiStatusUrl = api.channelStatusUrl(
                        channelData.map((v) => v.channelId),
                    );

                    console.debug(`apiStatusUrl = ${apiStatusUrl}`);
                    const apiQueryUrl = api.channelQueryUrl(
                        channelData.map((v) => v.channelId),
                    );
                    console.debug(`apiQueryUrl = ${apiQueryUrl}`);
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
            } else {
                console.debug(`Power screen not in focus. Skip signal data retrieval`)
            }
            if (timer) {
                clearTimeout(timer)
                setTimer(null)
            }
            if (focused) {
                // const timeout = setTimeout(fetchData, refreshFrequency)
                // setTimer(timeout)
            }
        };
        if (timer) {
            clearTimeout(timer)
            setTimer(null)
        }
        fetchData();
        return () => {
            console.debug(`Will unmount power device point modal`)
            if (timer) {
                clearTimeout(timer)
            }
        }
    }, [channelData, channelValues, demoMode, focused, refreshFrequency, timer]);

    const handleClose = () => {
        savedFocus.current = false
        onClose()
    }

    return (
        <Modal
            supportedOrientations={['landscape', 'portrait']}
            animationType="none"
            transparent={true}
            visible={visible}
            presentationStyle="overFullScreen"
            onRequestClose={onClose}>
            <View style={styles.curtain}>
                <View style={styles.mapContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalHeading}>{title}</Text>
                        <Button
                            icon={<MaterialIcons name="cancel" size={25} color="blue" />}
                            type="clear"
                            onPress={onClose}
                            buttonStyle={styles.closeButton}
                        />
                    </View>
                    <ScrollView
                        style={styles.contentContainer}
                        contentContainerStyle={styles.content}>
                        <View style={styles.devicePointReadingTable}>
                            {/*<Text>{JSON.stringify(channelData)}</Text>*/}
                            <View style={[styles.dataRow, styles.headerRow]}>
                                <View style={styles.label} />
                                {lineHeadings.map((lineHeading) =>
                                    <View key={lineHeading} style={styles.value}>
                                        <Text style={styles.headerText}>{lineHeading}</Text>
                                    </View>
                                )}
                                <View style={styles.value}>
                                    <Text style={styles.headerText}>{'Characteristics'}</Text>
                                </View>
                            </View>
                            {labels.map((labelKey) => (
                                <View key={labelKey} style={styles.dataRow}>
                                    <View style={[styles.label, styles.labelBorder]}>
                                        <Text>
                                            {channelData?.find((d) => d.key === labelKey)?.label ??
                                                '-'}
                                        </Text>
                                    </View>
                                    {lineHeadings.map((v2) => {
                                        const channelId = channelData?.find((d) => d.key === labelKey && d.lineIndex === v2)?.channelId
                                        if (!channelId) {
                                            return <View key={v2} />
                                        }
                                        return (
                                            <View key={v2} style={styles.value}>
                                                <Text>{
                                                    demoMode ? `[#${channelId}] ${channelData?.find(d => d.channelId === channelId)?.unit ?? ''}` :
                                                        (channelValues[channelId]?.engineeringValue?.toFixed(2) ?? '-')
                                                }</Text>
                                            </View>
                                        )
                                    })}
                                    <View style={[styles.value, styles.blank]} />
                                </View>
                            ))}
                            {characteristicLabels.map((labelKey) => {
                                const channelId = channelData?.find((d) => d.key === labelKey)?.channelId
                                if (!channelId) {
                                    return <View key={labelKey} />
                                }
                                return (
                                    <View key={labelKey} style={styles.dataRow}>
                                        <View style={[styles.label, styles.labelBorder]}>
                                            <Text>
                                                {channelData?.find((d) => d.key === labelKey)?.label ??
                                                    '-'}
                                            </Text>
                                        </View>
                                        {lineHeadings.map((lineHeading) => (
                                            <View key={lineHeading} style={[styles.value, styles.blank]} />
                                        ))}
                                        <View style={styles.value}>
                                            <Text>{
                                                demoMode ? `[#${channelId}] ${channelData?.find(d => d.channelId === channelId)?.unit}` : (channelValues[channelId]?.engineeringValue?.toFixed(2) ?? '-')
                                            }</Text>
                                        </View>
                                    </View>
                                )
                            })}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default PowerDevicePointModal;

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
        // shadowOffset: {
        //     width: 0,
        //     height: 0,
        // },
        // shadowOpacity: 0.7,
        // shadowRadius: 15,
        borderRadius: 10,
        overflow: 'hidden',
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
    },
    content: {
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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
        // backgroundColor: 'yellow',
        // flex: 1,
        width: '90%',
    },
    dataRow: {
        display: 'flex',
        flexDirection: 'row',
        // backgroundColor: 'orange',
        height: 36
        // padding: 2
    },
    headerRow: {
        backgroundColor: '#FFD580',
    },
    headerText: {
        // color: 'white',
        fontWeight: 'bold'
    },
    label: {
        flex: 1.5,
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
