import { atom } from 'recoil';

export const loginParamsState = atom({
  key: 'loginParamsState',
  default: {
    operatorId: null,
    timeActivity: null,
  },
});
