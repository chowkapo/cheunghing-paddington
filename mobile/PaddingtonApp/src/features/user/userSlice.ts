import type { PayloadAction } from '@reduxjs/toolkit';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import base64 from 'base-64';
import { TLoginApi, cameraListApi, loginApi } from '../../api/loginApi';
import { defaultRefreshFrequency } from '../../resources/config';
import { TRawCamera, TUserData, TUserLoginResponse, TUserState } from '../../resources/types';
import getErrorMessage from '../../utils/getErrorMessage';
import { massageCameraList } from '../../utils/helper';

const initialState: TUserState = {
  username: null,
  locationMask: 0,
  authenticationToken: null,
  authenticating: false,
  error: null,
  refreshFrequency: defaultRefreshFrequency,
  selectedCameras: [
    203, 216, 304, 347, 367, 379, 403, 410, 422, 271, 277, 281, 90, 44, 32, 58
  ],
  useMainStream: false,
  demoMode: false,
  adminMode: false,
  cameraList: {},
  alertEnabled: {
    leakage: true,
    door: true,
    emergency: true,
    watertank: true,
    valve: true,
  },
};

export const login = createAsyncThunk<TUserData, TLoginApi>(
  'user/login',
  async ({ username, password, signal }: TLoginApi, thunkApi) => {
    try {
      let actualUsername = username,
        // adminMode = true,
        // demoLogin = true,
        adminMode = false,
        demoLogin = false,
        response: TUserLoginResponse | null = null;
      if (username.startsWith('!') || username.startsWith('@')) {
        actualUsername = username.substring(1);
        adminMode = true;
      }
      if (username.startsWith('@')) {
        actualUsername = username.substring(1);
        demoLogin = true;
      }
      await new Promise<void>((resolve, reject) => {
        // add 2 seconds delay to show authentication in progress
        const timer = setTimeout(resolve, 2000);
        signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('Aborted by user'));
        });
      });
      if (demoLogin) {
        response = {
          success: true,
          locationMask: 255,
          remark: '',
        };
      } else {
        response = await loginApi({
          username: actualUsername,
          password,
          signal,
        });
      }
      console.log('Login Response: %o', response);
      if (!response.success) {
        throw new Error(response.remark || 'Login Failure');
      }
      const authenticationToken = base64.encode(`${actualUsername}:${password}`)
      let cameraList: TRawCamera[] = [];
      try {
        cameraList = await cameraListApi(authenticationToken)
        console.log('Camera List: %o', cameraList);
      }
      catch (err) {
        console.error('Camera List Error: %o', err);
      }
      return {
        locationMask: response.locationMask,
        username: actualUsername,
        authenticationToken,
        refreshFrequency: defaultRefreshFrequency,
        selectedCameras: initialState.selectedCameras,
        useMainStream: false,
        demoMode: demoLogin,
        cameraList: massageCameraList(cameraList),
        adminMode,
      } as TUserData;
    } catch (err) {
      return thunkApi.rejectWithValue(getErrorMessage(err) || 'Login Error');
    }
  },
);

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: state => {
      state.username = null;
      state.authenticationToken = null;
      state.error = null;
    },
    updateLocationMask: (state, action: PayloadAction<number>) => {
      state.locationMask = action.payload;
    },
    updateRefreshFrequency: (state, action: PayloadAction<number>) => {
      state.refreshFrequency = action.payload;
    },
    changeDemoMode: (state, action: PayloadAction<boolean>) => {
      state.demoMode = action.payload;
    },
    changeVideoStream: (state, action: PayloadAction<boolean>) => {
      state.useMainStream = action.payload;
    },
    changeSelectedCamera: (state, action: PayloadAction<number[]>) => {
      state.selectedCameras = action.payload;
    },
    changeAlertMode: (
      state,
      action: PayloadAction<{ system: string; enabled: boolean }>,
    ) => {
      state.alertEnabled = {
        ...state.alertEnabled,
        [action.payload.system]: !!action.payload.enabled,
      };
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder.addCase(login.pending, (state: TUserState) => {
      state.authenticating = true;
      state.error = null;
    });
    builder.addCase(login.rejected, (state: TUserState, { payload }) => {
      state.authenticating = false;
      state.authenticationToken = null;
      state.error = payload as string;
    });
    builder.addCase(login.fulfilled, (state: TUserState, { payload }) => {
      state.authenticating = false;
      state.error = null;
      state.locationMask = payload.locationMask;
      state.authenticationToken = payload.authenticationToken;
      state.username = payload.username;
      state.refreshFrequency = payload.refreshFrequency;
      state.selectedCameras = payload.selectedCameras;
      state.useMainStream = payload.useMainStream;
      state.demoMode = payload.demoMode;
      state.adminMode = payload.adminMode;
      state.cameraList = payload.cameraList;
    });
  },
});

export const {
  logout,
  updateLocationMask,
  updateRefreshFrequency,
  changeDemoMode,
  changeVideoStream,
  changeSelectedCamera,
  changeAlertMode,
  clearError,
} = userSlice.actions;

export default userSlice.reducer;
