export declare class ThompsonBandit {
    private arms;
    private arm;
    private sample;
    pick(ids: string[], rand?: () => number): string;
    reward(id: string, win: boolean): void;
}
