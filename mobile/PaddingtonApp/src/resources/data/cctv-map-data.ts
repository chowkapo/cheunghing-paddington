const cctvMapData: {
  [id: string]: {
    id: string;
    name: string;
    src: any;
    width: number;
    height: number;
  }
} = {
  "t1-t2-rf": {
    "id": "t1-t2-rf",
    "width": 3361,
    "height": 1167,
    "name": "t1-t2-rf",
    "src": require('./cctv_map_images/t1-t2-rf.png')
  },
  "gf": {
    "id": "gf",
    "width": 3364,
    "height": 1875,
    "name": "gf",
    "src": require('./cctv_map_images/gf.png')
  },
  "t1-t2-40f": {
    "id": "t1-t2-40f",
    "width": 6770,
    "height": 2438,
    "name": "t1-t2-40f",
    "src": require('./cctv_map_images/t1-t2-40f.png')
  },
  "t1-t2-1f": {
    "id": "t1-t2-1f",
    "width": 6948,
    "height": 2710,
    "name": "t1-t2-1f",
    "src": require('./cctv_map_images/t1-t2-1f.png')
  },
  "t1-t2-typ": {
    "id": "t1-t2-typ",
    "width": 6640,
    "height": 2570,
    "name": "t1-t2-typ",
    "src": require('./cctv_map_images/t1-t2-typ.png')
  },
  "t1-urf": {
    "id": "t1-urf",
    "width": 1754,
    "height": 1239,
    "name": "t1-urf",
    "src": require('./cctv_map_images/t1-urf.png')
  },
  "t1-b1f": {
    "id": "t1-b1f",
    "width": 6769,
    "height": 3488,
    "name": "t1-b1f",
    "src": require('./cctv_map_images/t1-b1f.png')
  },
  "t2-urf": {
    "id": "t2-urf",
    "width": 1754,
    "height": 1239,
    "name": "t2-urf",
    "src": require('./cctv_map_images/t2-urf.png')
  },
  "t2-b1f": {
    "id": "t2-b1f",
    "width": 4444,
    "height": 4632,
    "name": "t2-b1f",
    "src": require('./cctv_map_images/t2-b1f.png')
  },
  "t3-b1f": {
    "id": "t3-b1f",
    "width": 6866,
    "height": 3155,
    "name": "t3-b1f",
    "src": require('./cctv_map_images/t3-b1f.png')
  },
  "ca-b1f": {
    "id": "ca-b1f",
    "width": 4966,
    "height": 7020,
    "name": "ca-b1f",
    "src": require('./cctv_map_images/ca-b1f.png')
  },
  "cb-b1f": {
    "id": "cb-b1f",
    "width": 6081,
    "height": 4639,
    "name": "cb-b1f",
    "src": require('./cctv_map_images/cb-b1f.png')
  },
  "cc-b1f": {
    "id": "cc-b1f",
    "width": 5680,
    "height": 4693,
    "name": "cc-b1f",
    "src": require('./cctv_map_images/cc-b1f.png')
  },
  "cd-b1f": {
    "id": "cd-b1f",
    "width": 4086,
    "height": 4741,
    "name": "cd-b1f",
    "src": require('./cctv_map_images/cd-b1f.png')
  },
  "rt1-b1f": {
    "id": "rt1-b1f",
    "width": 5343,
    "height": 4512,
    "name": "rt1-b1f",
    "src": require('./cctv_map_images/rt1-b1f.png')
  },
  "emo-b1f": {
    "id": "emo-b1f",
    "width": 7020,
    "height": 3841,
    "name": "emo-b1f",
    "src": require('./cctv_map_images/emo-b1f.png')
  },
  "rt2-b1f": {
    "id": "rt2-b1f",
    "width": 6696,
    "height": 2338,
    "name": "rt2-b1f",
    "src": require('./cctv_map_images/rt2-b1f.png')
  },
  "ch-b1f": {
    "id": "ch-b1f",
    "width": 6532,
    "height": 3227,
    "name": "ch-b1f",
    "src": require('./cctv_map_images/ch-b1f.png')
  },
  "t1-b2f": {
    "id": "t1-b2f",
    "width": 6368,
    "height": 4333,
    "name": "t1-b2f",
    "src": require('./cctv_map_images/t1-b2f.png')
  },
  "t2-b2f": {
    "id": "t2-b2f",
    "width": 5911,
    "height": 4535,
    "name": "t2-b2f",
    "src": require('./cctv_map_images/t2-b2f.png')
  },
  "t3-b2f": {
    "id": "t3-b2f",
    "width": 6508,
    "height": 4159,
    "name": "t3-b2f",
    "src": require('./cctv_map_images/t3-b2f.png')
  },
  "emo-b2f": {
    "id": "emo-b2f",
    "width": 6998,
    "height": 3589,
    "name": "emo-b2f",
    "src": require('./cctv_map_images/emo-b2f.png')
  },
  "t3-rf": {
    "id": "t3-rf",
    "width": 6817,
    "height": 2899,
    "name": "t3-rf",
    "src": require('./cctv_map_images/t3-rf.png')
  },
  "condo-ac-rf": {
    "id": "condo-ac-rf",
    "width": 6573,
    "height": 3893,
    "name": "condo-ac-rf",
    "src": require('./cctv_map_images/condo-ac-rf.png')
  },
  "condo-b-rf": {
    "id": "condo-b-rf",
    "width": 6612,
    "height": 3844,
    "name": "condo-b-rf",
    "src": require('./cctv_map_images/condo-b-rf.png')
  },
  "condo-d-rf": {
    "id": "condo-d-rf",
    "width": 6721,
    "height": 3539,
    "name": "condo-d-rf",
    "src": require('./cctv_map_images/condo-d-rf.png')
  },
  "rt1-rf": {
    "id": "rt1-rf",
    "width": 5185,
    "height": 4851,
    "name": "rt1-rf",
    "src": require('./cctv_map_images/rt1-rf.png')
  },
  "rt2-rf": {
    "id": "rt2-rf",
    "width": 6662,
    "height": 2719,
    "name": "rt2-rf",
    "src": require('./cctv_map_images/rt2-rf.png')
  },
  "t3-typ": {
    "id": "t3-typ",
    "width": 6783,
    "height": 2949,
    "name": "t3-typ",
    "src": require('./cctv_map_images/t3-typ.png')
  },
  "t3-1f": {
    "id": "t3-1f",
    "width": 6830,
    "height": 2889,
    "name": "t3-1f",
    "src": require('./cctv_map_images/t3-1f.png')
  },
  "t3-urf": {
    "id": "t3-urf",
    "width": 6730,
    "height": 4133,
    "name": "t3-urf",
    "src": require('./cctv_map_images/t3-urf.png')
  },
  "condo-ac-typ": {
    "id": "condo-ac-typ",
    "width": 6679,
    "height": 4075,
    "name": "condo-ac-typ",
    "src": require('./cctv_map_images/condo-ac-typ.png')
  },
  "condo-b-typ": {
    "id": "condo-b-typ",
    "width": 5892,
    "height": 3500,
    "name": "condo-b-typ",
    "src": require('./cctv_map_images/condo-b-typ.png')
  },
  "condo-d-typ": {
    "id": "condo-d-typ",
    "width": 6746,
    "height": 3752,
    "name": "condo-d-typ",
    "src": require('./cctv_map_images/condo-d-typ.png')
  },
  "rt1-1f": {
    "id": "rt1-1f",
    "width": 5239,
    "height": 4895,
    "name": "rt1-1f",
    "src": require('./cctv_map_images/rt1-1f.png')
  },
  "rt2-1f": {
    "id": "rt2-1f",
    "width": 6667,
    "height": 2229,
    "name": "rt2-1f",
    "src": require('./cctv_map_images/rt2-1f.png')
  },
  "t1-gf": {
    "id": "t1-gf",
    "width": 2327,
    "height": 1490,
    "name": "t1-gf",
    "src": require('./cctv_map_images/t1-gf.png')
  },
  "t2-gf": {
    "id": "t2-gf",
    "width": 2087,
    "height": 1455,
    "name": "t2-gf",
    "src": require('./cctv_map_images/t2-gf.png')
  },
  "t3-gf": {
    "id": "t3-gf",
    "width": 6884,
    "height": 2912,
    "name": "t3-gf",
    "src": require('./cctv_map_images/t3-gf.png')
  }
}
export default cctvMapData
