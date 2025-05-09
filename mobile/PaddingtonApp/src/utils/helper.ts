import inputPoints from '../resources/data/input-point.json';
import {
  TCameraList,
  TCctvFloor,
  TCctvFloorGroup,
  THenleyCameraLocation,
  THierarchicalMenu,
  TInputPoint,
  TRawCamera,
  TSignalTypeSuffixHandling
} from '../resources/types';

import hierarchyCa from '../resources/data/cctv-menu-ca.json';
import hierarchyCb from '../resources/data/cctv-menu-cb.json';
import hierarchyCc from '../resources/data/cctv-menu-cc.json';
import hierarchyCd from '../resources/data/cctv-menu-cd.json';
import hierarchyClubHouse from '../resources/data/cctv-menu-ch.json';
import hierarchyEmo from '../resources/data/cctv-menu-emo.json';
import hierarchyRetail from '../resources/data/cctv-menu-rt.json';
import hierarchyT1 from '../resources/data/cctv-menu-t1.json';
import hierarchyT2 from '../resources/data/cctv-menu-t2.json';
import hierarchyT3 from '../resources/data/cctv-menu-t3.json';

import cctvCameraListB1F from '../resources/data/cctvCameraList_b1f.json';
import cctvCameraListB2F from '../resources/data/cctvCameraList_b2f.json';
import cctvCameraListClubHouse from '../resources/data/cctvCameraList_ch.json';
import cctvCameraListEmo from '../resources/data/cctvCameraList_emo.json';
import cctvCameraListT123Fg from '../resources/data/cctvCameraList_t123_fg.json';

const cctvMenuHierarchy = {
  EMO: hierarchyEmo as TCctvFloorGroup[],
  T1: hierarchyT1 as TCctvFloorGroup[],
  T2: hierarchyT2 as TCctvFloorGroup[],
  T3: hierarchyT3 as TCctvFloorGroup[],
  CA: hierarchyCa as TCctvFloorGroup[],
  CB: hierarchyCb as TCctvFloorGroup[],
  CC: hierarchyCc as TCctvFloorGroup[],
  CD: hierarchyCd as TCctvFloorGroup[],
  RT: hierarchyRetail as TCctvFloorGroup[],
  RT1: hierarchyRetail as TCctvFloorGroup[],
  RT2: hierarchyRetail as TCctvFloorGroup[],
  CH: hierarchyClubHouse as TCctvFloorGroup[],
};

/* Bitwise mask to location
  Carpark: 1
  Retail: 2
  CH: 4
  T8&TL: 8
  T6&T7: 16
  T3&T5: 32
  T1&T2: 64
  EMO: 128
*/

const locationMaskMapping = [
  ["CA"],
  ["CB"],
  ["CC"],
  ["CD"],
  ["T1"],
  ["T2"],
  ["T3"],
  ["CH"],
  ["EMO"],
  ["RT1", "RT"],
  ["RT2", "RT"]
]


export const massageCameraList = (rawCameraList: TRawCamera[]) => {
  const cameraList: TCameraList = {}
  if (!rawCameraList || !(rawCameraList instanceof Array)) {
    return cameraList
  }
  rawCameraList.forEach(c => {
    if (c && c.cameraID && typeof c.cameraID === 'number') {
      cameraList[c.cameraID] = c
    }
  })
  return cameraList
}

export const maskToLocations = (locationMask: number) => {
  let locations: string[] = [];
  for (let i = 0; i < locationMaskMapping.length; i++) {
    locations = locations.concat(
      // eslint-disable-next-line no-bitwise
      locationMask & (2 ** i) ? locationMaskMapping[i] : [],
    );
  }
  // console.log(`maskToLocations: locations = ${JSON.stringify(locations)}`);
  return Array.from(new Set(locations));
};


export const findPrimaryLocation = (locations: string[] = []) => {
  if (locations.includes('EMO')) {
    return 'EMO';
  } else if (locations.includes('T1')) {
    return 'T1';
  } else if (locations.includes('T2')) {
    return 'T2';
  } else if (locations.includes('T3')) {
    return 'T3';
  } else if (locations.includes('CA')) {
    return 'CA';
  } else if (locations.includes('CB')) {
    return 'CB';
  } else if (locations.includes('CC')) {
    return 'CC';
  } else if (locations.includes('CD')) {
    return 'CD';
  } else if (locations.includes('CH')) {
    return 'CH';
  } else if (
    locations.includes('RT') ||
    locations.includes('RT1') ||
    locations.includes('RT2')
  ) {
    return 'RT';
  } else {
    return '';
  }
};

export const findCctvPrimaryLocation = (locations: string[] = []) => {
  if (locations.includes('EMO')) {
    return 'EMO';
  } else if (locations.includes('T1')) {
    return 'T1';
  } else if (locations.includes('T2')) {
    return 'T2';
  } else if (locations.includes('T3')) {
    return 'T3';
  } else if (locations.includes('CA')) {
    return 'CA';
  } else if (locations.includes('CB')) {
    return 'CB';
  } else if (locations.includes('CC')) {
    return 'CC';
  } else if (locations.includes('CD')) {
    return 'CD';
  } else if (locations.includes('CH')) {
    return 'CH';
  } else if (locations.includes('RT1')) {
    return 'RT1';
  } else if (locations.includes('RT2')) {
    return 'RT2';
  } else if (locations.includes('RT')) {
    return 'RT';
  } else {
    return '';
  }
};

export const getCctvMenuHierarchy = (locations: string[] = []) => {
  const primaryLocation = findPrimaryLocation(locations);
  console.log(`getCctvMenuHierarchy: primaryLocation = ${primaryLocation}`);
  return primaryLocation ? cctvMenuHierarchy[primaryLocation] : [];
};

export const getCombinedCctvCameraList = () => {
  let combinedCctvCameraList: THenleyCameraLocation[] = cctvCameraListEmo as THenleyCameraLocation[];
  combinedCctvCameraList = combinedCctvCameraList.concat(cctvCameraListB1F as THenleyCameraLocation[]);
  combinedCctvCameraList = combinedCctvCameraList.concat(cctvCameraListB2F as THenleyCameraLocation[]);
  combinedCctvCameraList = combinedCctvCameraList.concat(cctvCameraListT123Fg as THenleyCameraLocation[]);
  combinedCctvCameraList = combinedCctvCameraList.concat(
    cctvCameraListClubHouse as THenleyCameraLocation[],
  );
  return combinedCctvCameraList;
};

export const orderTier1 = [
  //   'B2/F',
  //   'B1/F',
  //   'G/F',
  //   '1/F',
  //   '2/F',
  //   '3/F',
  //   'R/F',
  //   'UR1/F',
  //   'UR2/F',
];

export const orderTier2 = [
  '電制房1',
  '電制房2',
  '1-7',
  '8-13',
  'B1F',
  'B2F',
  'G-11F',
  'RF',
  'URF',

];

// const orderTier2 = [];
export const orderTier3 = [];

export const partialSort = (arr: string[], orderingArray: string[]) => {
  if (!arr || arr.length === 0) {
    return [];
  }
  const size = arr.length;
  const indexed = arr.map((v, index) => {
    // console.debug(`partialSort: v = ${v}`);
    const orderedIndex = orderingArray.findIndex(p => p === v);
    // console.debug(`partialSort: orderedIndex = ${orderedIndex}`);
    if (orderedIndex < 0) {
      return {
        value: v,
        index,
      };
    } else {
      return {
        value: v,
        index: size + orderedIndex,
      };
    }
  });
  // console.debug(`partialSort: indexed = ${JSON.stringify(indexed)}`);
  return indexed.sort((a, b) => a.index - b.index).map(v => v.value);
};

export const customSort = (input: string[], subOrder: string[]) => {
  const subOrderSet = new Set(subOrder);
  const beforeSubOrder: string[] = [];
  const inSubOrder: string[] = [];
  const afterSubOrder: string[] = [];

  let foundFirstSubOrder = false;

  input.forEach(item => {
    if (subOrderSet.has(item)) {
      inSubOrder.push(item);
      foundFirstSubOrder = true;
    } else if (!foundFirstSubOrder) {
      beforeSubOrder.push(item);
    } else {
      afterSubOrder.push(item);
    }
  });

  const sortedInSubOrder = inSubOrder.sort(
    (a, b) => subOrder.indexOf(a) - subOrder.indexOf(b)
  );

  return [...beforeSubOrder, ...sortedInSubOrder, ...afterSubOrder];
};

export const sortSignals = (a: string, b: string) => {
  const matchA = /^(\d*)(\D*)(\d*)$/.exec(a);
  const matchB = /^(\d*)(\D*)(\d*)$/.exec(b);
  if (!matchA || !matchB) {
    return a.localeCompare(b);
  } else {
    return (
      parseInt(matchA[1], 10) - parseInt(matchB[1], 10) ||
      matchA[2].localeCompare(matchB[2]) ||
      parseInt(matchA[3], 10) - parseInt(matchB[3], 10)
    );
  }
};

const alertTypeMap = {
  水浸警報: 'leakage',
  冷氣及通風監察系統: 'aircon',
  電氣監察系統: 'electric',
  供水監察系統: 'water',
  緊急監察系統: 'emergency',
};

export const classifyAlert = ({
  controllerID = 0,
  ioType = -1,
  pointID = -1,
}) => {
  let alertType = '';
  const alertTypeMap = {
    水浸警報: 'leakage',
    冷氣及通風監察系統: 'aircon',
    電氣監察系統: 'electric',
    供水監察系統: 'water',
    緊急監察系統: 'emergency',
  };
  if (ioType === 0 && pointID > 0) {
    const inputPointRecord = inputPoints.find(v => v.id === pointID);
    alertType = alertTypeMap[inputPointRecord?.type ?? ''] ?? '';
  } else if (ioType === 6) {
    if (controllerID === 26) {
      alertType = 'weather';
    } else if (controllerID === 193) {
      alertType = 'solar';
    } else if (controllerID >= 27 && controllerID <= 192) {
      alertType = 'power';
    } else if (controllerID >= 1 && controllerID <= 25) {
      alertType = 'lift';
    }
  }
  return alertType;
};

const alertSystemName: {
  [id: string]: string;
} = {
  leakage: '水浸',
  aircon: '冷氣通風',
  electric: '電氣',
  water: '供水',
  emergency: '緊急',
  weather: '天氣',
  solar: '太陽能',
  power: '電能',
  lift: '電梯',
};

export const getAlertSystemName = (alertCode: string) =>
  alertSystemName[alertCode] ?? '';

export const makeHierarchicalMenu = ({
  targetType,
  inputPointData,
  signalTypes,
  locations,
}: {
  targetType: string;
  inputPointData: TInputPoint[];
  signalTypes: TSignalTypeSuffixHandling[];
  locations?: string[];
}) => {
  const reSuffix = new RegExp(/^\s*(.*?)\s*(\S+)\s*$/);
  const hierarchicalMenu: THierarchicalMenu = {};
  inputPointData
    .filter(
      (v: TInputPoint) =>
        v.type === targetType &&
        (typeof locations === 'undefined' ||
          haveCommonElements(v.allowedLocations, locations)),
    )
    .forEach((v: TInputPoint) => {
      /*
      if (v.sub_type && v.sub_type2) {
        if (v.sub_type3) {
          hierarchicalMenu[v.sub_type] = hierarchicalMenu[v.sub_type] || {};
          (hierarchicalMenu[v.sub_type] as TMenuLevel2)[v.sub_type2] =
            (hierarchicalMenu[v.sub_type] as TMenuLevel2)[v.sub_type2] || [];
          ((hierarchicalMenu[v.sub_type] as TMenuLevel3)[v.sub_type2] as TMenuLevel2)[v.sub_type3] =
            ((hierarchicalMenu[v.sub_type] as TMenuLevel3)[v.sub_type2] as TMenuLevel2)[v.sub_type3] || [];
        } else {
          hierarchicalMenu[v.sub_type] = hierarchicalMenu[v.sub_type] || {};
          (hierarchicalMenu[v.sub_type] as TMenuLevel2)[v.sub_type2] =
            (hierarchicalMenu[v.sub_type] as TMenuLevel2)[v.sub_type2] || [];
        }
      } else {
        hierarchicalMenu[v.sub_type] = hierarchicalMenu[v.sub_type] || [];
      }
        */

      if (v.sub_type2 && v.sub_type3) {
        (hierarchicalMenu as any)[v.sub_type] = hierarchicalMenu[v.sub_type] || {};
        (hierarchicalMenu as any)[v.sub_type][v.sub_type2] =
          (hierarchicalMenu as any)[v.sub_type][v.sub_type2] || {};
        (hierarchicalMenu as any)[v.sub_type][v.sub_type2][v.sub_type3] =
          (hierarchicalMenu as any)[v.sub_type][v.sub_type2][v.sub_type3] || [];
      } else if (v.sub_type2) {
        (hierarchicalMenu as any)[v.sub_type] = hierarchicalMenu[v.sub_type] || {};
        (hierarchicalMenu as any)[v.sub_type][v.sub_type2] =
          (hierarchicalMenu as any)[v.sub_type][v.sub_type2] || [];
      } else {
        (hierarchicalMenu as any)[v.sub_type] = hierarchicalMenu[v.sub_type] || [];
      }


      const match = reSuffix.exec(v.name);
      const canonicalName = (match && match[1])?.replace(/\s+/, ' ');
      let suffix = ((match && match[2]) || '').replace(' ', '');
      let signalType = signalTypes.find(v2 => v2.suffix === suffix);
      const newInputPoint = {
        ...v,
        canonicalName,
        suffix: signalType?.replace ? signalType?.replace?.suffix : suffix,
        signalType: signalType?.replace
          ? signalType?.replace?.signalType
          : signalType?.signalType,
        level: signalType?.level
      };
      if (v.sub_type3 && v.sub_type2 && (hierarchicalMenu as any)[v.sub_type][v.sub_type2][v.sub_type3] instanceof Array) {
        ((hierarchicalMenu as any)[v.sub_type][v.sub_type2][v.sub_type3] as TInputPoint[]).push(newInputPoint);

      } else if (v.sub_type2 && (hierarchicalMenu as any)[v.sub_type][v.sub_type2] instanceof Array) {
        ((hierarchicalMenu as any)[v.sub_type][v.sub_type2] as TInputPoint[]).push(newInputPoint);
      } else {
        if (hierarchicalMenu[v.sub_type] instanceof Array) {
          (hierarchicalMenu[v.sub_type] as TInputPoint[]).push(newInputPoint);
        }
      }
    });
  // console.log(`makeHierarchicalMenu: hierarchicalMenu = ${JSON.stringify(hierarchicalMenu, null, 2)}`);
  return hierarchicalMenu;
};

export const haveCommonElements = (array1: string[], array2: string[]) => {
  // Create a set from the first array
  const set1 = new Set(array1);

  // Iterate over the second array
  for (const element of array2) {
    // Check if any element exists in the set
    if (set1.has(element)) {
      return true; // Common element found
    }
  }

  return false; // No common elements found
};

const expandLocations = (locations: string[]) => {
  let expanded: string[] = [];
  locations.forEach(l => {
    if (l.includes('&')) {
      expanded = expanded.concat(l.split('&'));
    } else {
      expanded.push(l);
    }
  });
  // console.log(`locations = ${JSON.stringify(locations)}`);
  // console.log(`expanded = ${JSON.stringify(expanded)}`);
  return expanded;
};

const mapCctvInclusion = {
  "PUBLIC": ["TOWER 1", "TOWER 2", "TOWER 3", "CONDO. A", "CONDO. B", "CONDO. C", "CONDO. D", "PODIUM", "CARPARK", "CLUB HOUSE", "RETAIL BLOCK 1", "RETAIL BLOCK 2"],
  "RETAIL BLOCK": ["RETAIL BLOCK 1", "RETAIL BLOCK 2"]
}

const deduplicate = (value: THenleyCameraLocation, index: number, self: THenleyCameraLocation[]) => index === self.findIndex((v) => v.cameraId === value.cameraId && v.mapid === value.mapid)

export const getCctvCameraList = ({
  cctvCameraLocationList,
  mapId,
  chainLabels,
  locations,
}: {
  cctvCameraLocationList: THenleyCameraLocation[];
  mapId: string;
  chainLabels: string[];
  locations?: string[];
}) => {
  const primaryLocation = findPrimaryLocation(locations);
  if (primaryLocation === 'EMO' && ["TOWER 1", "TOWER 2"].includes(chainLabels[0]?.toUpperCase())) {
    const list = cctvCameraLocationList.filter(v => v.monitor?.includes(primaryLocation)).filter(v =>
      v.mapid === mapId && v.x && v.y &&
      v.location.toUpperCase() === chainLabels[0]?.toUpperCase() &&
      (
        v.floor.toUpperCase() === chainLabels[2]?.toUpperCase() ||
        mapCctvInclusion?.[chainLabels[0] as keyof typeof mapCctvInclusion]?.includes(v.location.toUpperCase())
      )
    ).filter(deduplicate).map(v => ({
      ...v,
      enabled: true
    }))
    return list
  } else if (primaryLocation !== 'CH') {
    const list = cctvCameraLocationList.filter(v => v.monitor?.includes(primaryLocation)).filter(v =>
      v.mapid === mapId && v.x && v.y &&
      (
        v.location.toUpperCase() === chainLabels[0]?.toUpperCase() ||
        v.floor.toUpperCase() === chainLabels[0]?.toUpperCase() ||
        v.floor.toUpperCase() === chainLabels[2]?.toUpperCase() ||
        mapCctvInclusion?.[chainLabels[0] as keyof typeof mapCctvInclusion]?.includes(v.location.toUpperCase())
      ) &&
      (
        v.floor.toUpperCase() === chainLabels[0]?.toUpperCase() ||
        v.floor.toUpperCase() === chainLabels[1]?.toUpperCase() ||
        v.floor.toUpperCase() === chainLabels[2]?.toUpperCase()
      )
    ).filter(deduplicate).map(v => ({
      ...v,
      enabled: true
    }))
    return list
  } else {
    const list = cctvCameraLocationList.filter(v => v.monitor?.includes(primaryLocation)).
      filter(v =>
        v.mapid === mapId && v.x && v.y &&
        (
          v.cameraName?.toUpperCase()?.startsWith(chainLabels[1]?.toUpperCase()) ||
          (chainLabels[0]?.toUpperCase() === 'G/F' && chainLabels[1]?.toUpperCase()?.includes('LOBBY') &&
            v.floor?.toUpperCase() === 'G/F' && v.cameraName?.toUpperCase()?.includes("LIFT"))
        )
      ).filter(deduplicate).map(v => ({
        ...v,
        enabled: true
      }))
    return list
  }
  // const list = cctvCameraLocationList
  //   .filter(cctv => {
  //     return (
  //       cctv.mapid === mapId &&
  //       cctv.x &&
  //       cctv.y &&
  //       chainLabels
  //         .map(label => label.toUpperCase())
  //         .includes(cctv.floor?.toUpperCase())
  //     );
  //   })
  //   .map(cctv => ({
  //     ...cctv,
  //     enabled:
  //       !locations ||
  //       haveCommonElements(cctv.monitor ?? [], expandLocations(locations)),
  //   }));
  // return list;
};

export const getCctvMenuSelectedChainLabels = ({
  cctvMultiLevelMenus,
  selected,
}: {
  cctvMultiLevelMenus: TCctvFloorGroup[];
  selected: number[];
}) => {
  const newSelectedChainLabels: string[] = [];
  let currentLevel = cctvMultiLevelMenus;
  selected.forEach(selectedItem => {
    newSelectedChainLabels.push(currentLevel[selectedItem].label);
    // setSelectedMapId((currentLevel[selectedItem] as TCctvFloor).mapid ?? null);
    currentLevel = (currentLevel[selectedItem] as TCctvFloorGroup).floors ?? [];
  });
  return newSelectedChainLabels;
};

export const getTargetMap = ({
  cctvMultiLevelMenus,
  selected,
}: {
  cctvMultiLevelMenus: TCctvFloorGroup[];
  selected: number[];
}) => {
  let newSelectedMap = null;
  let currentLevelFloors: (TCctvFloorGroup | TCctvFloor)[] =
    cctvMultiLevelMenus;
  let targetFloor: TCctvFloor | null = null;
  selected.forEach(level => {
    if ((currentLevelFloors[level] as TCctvFloorGroup).floors) {
      currentLevelFloors =
        ((currentLevelFloors as TCctvFloorGroup[])[level] as TCctvFloorGroup)
          .floors ?? [];
    } else {
      targetFloor = currentLevelFloors[level] as TCctvFloor;
    }
  });
  if (targetFloor && (targetFloor as TCctvFloor).mapid) {
    newSelectedMap = targetFloor;
  }
  return newSelectedMap;
};
