import { api } from '../resources/api';
import { TRawCamera, TUserLoginResponse } from '../resources/types';

export type TLoginApi = {
  username: string;
  password: string;
  signal: AbortSignal;
};

export const loginApi = ({ username, password, signal }: TLoginApi) =>
  fetch(api.loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: `operatorname=${encodeURI(username)}&password=${encodeURI(password)}`,
    signal,
  }).then(res => res.json() as unknown as TUserLoginResponse);

export const cameraListApi = (authenticationToken: string | null) => {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${authenticationToken ?? ''}`,
    },
  };
  return fetch(api.getCameraListUrl, options)
    .then(res => res.json())
    .then(data => data as TRawCamera[]);
}
