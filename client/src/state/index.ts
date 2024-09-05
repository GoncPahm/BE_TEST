import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface InitialStateTypes {
    userId: string;
}

const initialState: InitialStateTypes = {
    userId: "ckagf1z7x0000b7myeow2xujz",
};

export const globalSlice = createSlice({
    name: "global",
    initialState,
    reducers: {},
});

export const {} = globalSlice.actions;

export default globalSlice.reducer;
