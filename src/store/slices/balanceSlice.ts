import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';

interface BalanceState {
  amount: number;
}

const initialState: BalanceState = {
  amount: 70
};

export const balanceSlice = createSlice({
  name: 'balance',
  initialState,
  reducers: {
    decreaseBalance: (state) => {
      state.amount = Math.max(10, state.amount - 20);
    },
    resetBalance: (state) => {
      state.amount = 70;
    }
  }
});

export const { decreaseBalance, resetBalance } = balanceSlice.actions;
export const getBalance = (state: RootState) => state.balance;
export default balanceSlice.reducer; 